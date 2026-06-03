// Google Apps Script backend for Bible Games HQ.
//
// Setup:
// 1. Create a Google Sheet in Drive.
// 2. Extensions -> Apps Script. Replace Code.gs contents with this file.
// 3. Change TEACHER_KEY to a random string. Keep it private.
// 4. Deploy -> New deployment -> Type: Web app.
//      Execute as: Me
//      Who has access: Anyone
// 5. Copy the Web App URL into VITE_APPS_SCRIPT_URL.
// 6. Re-deploy after changes: Manage deployments -> edit -> New version.
//
// Security model:
// - TEACHER_KEY is used only to create a room and is never included in QR links.
// - Each room has a joinToken for participants and a hostToken for result/admin actions.
// - Rooms expire after SESSION_TTL_MS.
// - Backend validates token, payload shape, capacity, and recomputes score from answers.
// - CacheService rate limits public reads/writes before touching Sheets.

const TEACHER_KEY = "CHANGE_ME_TEACHER_KEY";
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const MAX_PER_ROOM = 200;
const MAX_NAME_LEN = 24;
const MAX_ELAPSED_MS = 60 * 60 * 1000;
const PARTICIPANTS_SHEET = "Participants";
const SUBMISSIONS_SHEET = "Submissions";

const RATE_LIMIT_WRITE_PER_MIN = 80;
const RATE_LIMIT_READ_PER_MIN = 300;

const PARTICIPANT_HEADERS = ["Time", "Room", "PlayerId", "Name", "Anonymous"];
const SUBMISSION_HEADERS = [
  "Time",
  "Room",
  "PlayerId",
  "Name",
  "Anonymous",
  "CorrectPairs",
  "TotalPairs",
  "AnswersJson",
  "ElapsedMs",
  "CompletedAt",
];

const BEATITUDE_PAIRS = [
  {
    id: "poor-in-spirit",
    promise: "因為天國是他們的",
  },
  {
    id: "mourn",
    promise: "因為他們必得安慰",
  },
  {
    id: "meek",
    promise: "因為他們必承受地土",
  },
  {
    id: "hunger",
    promise: "因為他們必得飽足",
  },
  {
    id: "merciful",
    promise: "因為他們必蒙憐恤",
  },
  {
    id: "pure",
    promise: "因為他們必得見神",
  },
  {
    id: "peacemakers",
    promise: "因為他們必稱為神的兒子",
  },
  {
    id: "persecuted",
    promise: "因為天國是他們的",
  },
];
const BEATITUDE_PAIR_IDS = BEATITUDE_PAIRS.map((pair) => pair.id);
const BEATITUDE_PROMISE_BY_ID = BEATITUDE_PAIRS.reduce((map, pair) => {
  map[pair.id] = pair.promise;
  return map;
}, {});

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || "";

  if (action === "room") {
    if (!checkRateLimit("read", RATE_LIMIT_READ_PER_MIN)) {
      return json({ ok: false, error: "rate limited" });
    }
    return json(getRoomSummary(p.roomId || "", p.hostToken || ""));
  }

  return json({ ok: true, msg: "Bible Games HQ backend alive" });
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: "bad payload" });
  }

  const action = body.action || "";

  if (action === "createRoom") {
    if (!checkRateLimit("write", RATE_LIMIT_WRITE_PER_MIN)) {
      return json({ ok: false, error: "rate limited" });
    }
    if (body.teacherKey !== TEACHER_KEY) {
      return json({ ok: false, error: "unauthorized" });
    }
    return json(createRoom());
  }

  if (action === "joinRoom") {
    if (!checkRateLimit("write", RATE_LIMIT_WRITE_PER_MIN)) {
      return json({ ok: false, error: "rate limited" });
    }
    return json(joinRoom(body));
  }

  if (action === "submitResult") {
    if (!checkRateLimit("write", RATE_LIMIT_WRITE_PER_MIN)) {
      return json({ ok: false, error: "rate limited" });
    }
    return json(submitResult(body));
  }

  if (action === "endRoom") {
    if (!checkRateLimit("write", RATE_LIMIT_WRITE_PER_MIN)) {
      return json({ ok: false, error: "rate limited" });
    }
    return json(endRoom(body.roomId || "", body.hostToken || ""));
  }

  return json({ ok: false, error: "unknown action" });
}

function createRoom() {
  const roomId = randomCode(6);
  const now = Date.now();
  const session = {
    joinToken: randomCode(24),
    hostToken: randomCode(24),
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  PropertiesService.getScriptProperties().setProperty(roomKey(roomId), JSON.stringify(session));

  return {
    ok: true,
    roomId: roomId,
    joinToken: session.joinToken,
    hostToken: session.hostToken,
    expiresAt: session.expiresAt,
  };
}

function joinRoom(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return { ok: false, error: "busy, try again" };
  }

  try {
    const v = validateParticipant(data, "join");
    if (!v.ok) return v;
    const participantCount = getParticipantCount(v.roomId);
    if (participantCount >= MAX_PER_ROOM && !participantExists(v.roomId, v.playerId)) {
      return { ok: false, error: "room full" };
    }
    upsertParticipant(v.roomId, v.playerId, v.name, v.anonymous);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function submitResult(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return { ok: false, error: "busy, try again" };
  }

  try {
    const v = validateParticipant(data, "submit");
    if (!v.ok) return v;
    const answers = normalizeAnswers(data.answers);
    if (!answers.ok) return answers;
    const elapsed = clampInteger(data.elapsedMs, 0, MAX_ELAPSED_MS);
    if (elapsed === null) return { ok: false, error: "bad elapsedMs" };

    const participantCount = getParticipantCount(v.roomId);
    if (participantCount >= MAX_PER_ROOM && !participantExists(v.roomId, v.playerId)) {
      return { ok: false, error: "room full" };
    }

    upsertParticipant(v.roomId, v.playerId, v.name, v.anonymous);
    upsertSubmission(
      v.roomId,
      v.playerId,
      v.name,
      v.anonymous,
      answers.correctPairs,
      answers.totalPairs,
      answers.answers,
      elapsed,
    );
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function endRoom(roomId, hostToken) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return { ok: false, error: "busy, try again" };
  }

  try {
    const s = getSession(roomId);
    if (!s) return { ok: false, error: "room not found" };
    if (s.hostToken !== hostToken) return { ok: false, error: "invalid host token" };
    PropertiesService.getScriptProperties().deleteProperty(roomKey(roomId));
    deleteRowsByRoom(getSheet(PARTICIPANTS_SHEET, PARTICIPANT_HEADERS), roomId);
    deleteRowsByRoom(getSheet(SUBMISSIONS_SHEET, SUBMISSION_HEADERS), roomId);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function getRoomSummary(roomId, hostToken) {
  const s = getSession(roomId);
  if (!s) return { ok: false, error: "room not found" };
  if (s.hostToken !== hostToken) return { ok: false, error: "invalid host token" };
  if (Date.now() > s.expiresAt) return { ok: false, error: "room expired" };

  const participants = getParticipants(roomId);
  const submissions = getSubmissions(roomId);
  const totalCorrectPairs = submissions.reduce((sum, item) => sum + item.correctPairs, 0);
  const totalPairs = submissions.reduce((sum, item) => sum + item.totalPairs, 0);

  return {
    ok: true,
    roomId: roomId,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    totalParticipants: participants.length,
    completedCount: submissions.length,
    totalCorrectPairs: totalCorrectPairs,
    totalPairs: totalPairs,
    correctRate: totalPairs === 0 ? 0 : totalCorrectPairs / totalPairs,
    completedPlayers: submissions.map((item) => ({
      playerId: item.playerId,
      displayName: item.name,
      anonymous: item.anonymous,
      correctPairs: item.correctPairs,
      totalPairs: item.totalPairs,
      completedAt: item.completedAt,
      elapsedMs: item.elapsedMs,
    })),
  };
}

function validateParticipant(data, mode) {
  if (!data || typeof data !== "object") return { ok: false, error: "bad payload" };
  const roomId = normalizeRoomId(data.roomId);
  if (!roomId) return { ok: false, error: "missing roomId" };
  if (typeof data.joinToken !== "string" || !data.joinToken) {
    return { ok: false, error: "missing join token" };
  }
  if (typeof data.playerId !== "string" || !data.playerId) {
    return { ok: false, error: "missing playerId" };
  }

  const s = getSession(roomId);
  if (!s) return { ok: false, error: "room not found" };
  if (s.joinToken !== data.joinToken) return { ok: false, error: "invalid join token" };
  if (Date.now() > s.expiresAt) return { ok: false, error: "room expired" };

  const playerId = String(data.playerId).slice(0, 80);
  const anonymous = Boolean(data.anonymous);
  const rawName = typeof data.name === "string" ? data.name.trim() : "";
  const name =
    anonymous || !rawName
      ? "匿名參與者 " + playerId.slice(0, 4).toUpperCase()
      : rawName.slice(0, MAX_NAME_LEN);

  if (mode === "submit" && !Array.isArray(data.answers)) {
    return { ok: false, error: "bad answers" };
  }

  return {
    ok: true,
    roomId: roomId,
    playerId: playerId,
    name: name,
    anonymous: anonymous || !rawName,
  };
}

function normalizeAnswers(input) {
  if (!Array.isArray(input) || input.length !== BEATITUDE_PAIR_IDS.length) {
    return { ok: false, error: "bad answers" };
  }

  const validIds = {};
  BEATITUDE_PAIR_IDS.forEach((id) => {
    validIds[id] = true;
  });

  const seen = {};
  const answers = [];
  let correctPairs = 0;

  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    if (!item || typeof item.pairId !== "string" || typeof item.selectedId !== "string") {
      return { ok: false, error: "bad answers" };
    }
    if (!validIds[item.pairId] || !validIds[item.selectedId] || seen[item.pairId]) {
      return { ok: false, error: "bad answers" };
    }
    seen[item.pairId] = true;
    if (BEATITUDE_PROMISE_BY_ID[item.pairId] === BEATITUDE_PROMISE_BY_ID[item.selectedId]) {
      correctPairs++;
    }
    answers.push({ pairId: item.pairId, selectedId: item.selectedId });
  }

  return {
    ok: true,
    answers: answers,
    correctPairs: correctPairs,
    totalPairs: BEATITUDE_PAIR_IDS.length,
  };
}

function upsertParticipant(roomId, playerId, name, anonymous) {
  const sheet = getSheet(PARTICIPANTS_SHEET, PARTICIPANT_HEADERS);
  const row = findRowByRoomPlayer(sheet, roomId, playerId);
  const values = [new Date(), roomId, playerId, name, anonymous ? "yes" : "no"];

  if (row) {
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function upsertSubmission(
  roomId,
  playerId,
  name,
  anonymous,
  correctPairs,
  totalPairs,
  answers,
  elapsedMs,
) {
  const sheet = getSheet(SUBMISSIONS_SHEET, SUBMISSION_HEADERS);
  const row = findRowByRoomPlayer(sheet, roomId, playerId);
  const completedAt = Date.now();
  const values = [
    new Date(),
    roomId,
    playerId,
    name,
    anonymous ? "yes" : "no",
    correctPairs,
    totalPairs,
    JSON.stringify(answers),
    elapsedMs,
    completedAt,
  ];

  if (row) {
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function getParticipants(roomId) {
  const sheet = getSheet(PARTICIPANTS_SHEET, PARTICIPANT_HEADERS);
  const values = sheet.getDataRange().getValues().slice(1);
  const byPlayer = {};

  values.forEach((row) => {
    if (String(row[1]) !== roomId) return;
    byPlayer[String(row[2])] = {
      playerId: String(row[2]),
      name: String(row[3] || ""),
      anonymous: String(row[4]) === "yes",
    };
  });

  return Object.keys(byPlayer).map((key) => byPlayer[key]);
}

function getSubmissions(roomId) {
  const sheet = getSheet(SUBMISSIONS_SHEET, SUBMISSION_HEADERS);
  const values = sheet.getDataRange().getValues().slice(1);
  const byPlayer = {};

  values.forEach((row) => {
    if (String(row[1]) !== roomId) return;
    byPlayer[String(row[2])] = {
      playerId: String(row[2]),
      name: String(row[3] || ""),
      anonymous: String(row[4]) === "yes",
      correctPairs: Number(row[5]) || 0,
      totalPairs: Number(row[6]) || BEATITUDE_PAIR_IDS.length,
      elapsedMs: Number(row[8]) || 0,
      completedAt: Number(row[9]) || 0,
    };
  });

  return Object.keys(byPlayer)
    .map((key) => byPlayer[key])
    .sort((a, b) => a.completedAt - b.completedAt);
}

function participantExists(roomId, playerId) {
  return Boolean(
    findRowByRoomPlayer(getSheet(PARTICIPANTS_SHEET, PARTICIPANT_HEADERS), roomId, playerId),
  );
}

function getParticipantCount(roomId) {
  return getParticipants(roomId).length;
}

function findRowByRoomPlayer(sheet, roomId, playerId) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const values = sheet.getRange(2, 2, last - 1, 2).getValues();

  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === roomId && String(values[i][1]) === playerId) {
      return i + 2;
    }
  }

  return 0;
}

function deleteRowsByRoom(sheet, roomId) {
  const last = sheet.getLastRow();
  if (last < 2) return;
  const rooms = sheet.getRange(2, 2, last - 1, 1).getValues();

  for (let i = rooms.length - 1; i >= 0; i--) {
    if (String(rooms[i][0]) === roomId) {
      sheet.deleteRow(i + 2);
    }
  }
}

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getSession(roomId) {
  const normalized = normalizeRoomId(roomId);
  if (!normalized) return null;
  const raw = PropertiesService.getScriptProperties().getProperty(roomKey(normalized));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function roomKey(roomId) {
  return "room:" + roomId;
}

function normalizeRoomId(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toUpperCase();
  return /^[A-Z2-9]{4,12}$/.test(normalized) ? normalized : "";
}

function clampInteger(value, min, max) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    return null;
  }
  return numberValue;
}

function checkRateLimit(bucket, limit) {
  try {
    const cache = CacheService.getScriptCache();
    const minute = Math.floor(Date.now() / 60000);
    const key = "rate:" + bucket + ":" + minute;
    const current = parseInt(cache.get(key) || "0", 10);
    if (current >= limit) return false;
    cache.put(key, String(current + 1), 120);
    return true;
  } catch (err) {
    return true;
  }
}

function randomCode(len) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// Optional helper: run manually from Apps Script editor, or attach a time trigger.
function cleanupExpiredRooms() {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  const now = Date.now();

  Object.keys(all).forEach((key) => {
    if (key.indexOf("room:") !== 0) return;
    try {
      const roomId = key.slice("room:".length);
      const session = JSON.parse(all[key]);
      if (now > session.expiresAt) {
        props.deleteProperty(key);
        deleteRowsByRoom(getSheet(PARTICIPANTS_SHEET, PARTICIPANT_HEADERS), roomId);
        deleteRowsByRoom(getSheet(SUBMISSIONS_SHEET, SUBMISSION_HEADERS), roomId);
      }
    } catch (err) {
      props.deleteProperty(key);
    }
  });
}
