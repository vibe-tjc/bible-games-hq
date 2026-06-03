export type CreateRoomInput = {
  teacherKey: string;
};

export type CreateRoomResponse = {
  roomId: string;
  joinToken: string;
  hostToken: string;
  expiresAt: number;
};

export type ParticipantPayload = {
  playerId: string;
  name: string;
  anonymous: boolean;
};

export type FirstAnswer = {
  pairId: string;
  selectedId: string;
};

export type SubmissionPayload = ParticipantPayload & {
  answers: FirstAnswer[];
  elapsedMs: number;
};

export type CompletedPlayer = {
  playerId: string;
  displayName: string;
  anonymous: boolean;
  correctPairs: number;
  totalPairs: number;
  completedAt: number;
  elapsedMs: number;
};

export type RoomSummary = {
  roomId: string;
  createdAt: number;
  expiresAt: number;
  totalParticipants: number;
  completedCount: number;
  totalCorrectPairs: number;
  totalPairs: number;
  correctRate: number;
  completedPlayers: CompletedPlayer[];
};

type AppsScriptEnvelope<T> = T & {
  ok?: boolean;
  error?: string;
};

export const apiConfigured = Boolean(import.meta.env.VITE_APPS_SCRIPT_URL);

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function apiUrl(params: Record<string, string>) {
  const base = import.meta.env.VITE_APPS_SCRIPT_URL;

  if (!base) {
    throw new ApiError("尚未設定 VITE_APPS_SCRIPT_URL。", 0);
  }

  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

async function parseAppsScriptResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as AppsScriptEnvelope<T> | null;

  if (!response.ok) {
    throw new ApiError(payload?.error ?? "Apps Script 請求失敗。", response.status);
  }

  if (!payload || payload.ok === false) {
    throw new ApiError(payload?.error ?? "Apps Script 回傳格式錯誤。", response.status);
  }

  return payload as T;
}

async function getJson<T>(params: Record<string, string>) {
  const response = await fetch(apiUrl(params));
  return parseAppsScriptResponse<T>(response);
}

async function postJson<T>(body: Record<string, unknown>) {
  const base = import.meta.env.VITE_APPS_SCRIPT_URL;

  if (!base) {
    throw new ApiError("尚未設定 VITE_APPS_SCRIPT_URL。", 0);
  }

  // Apps Script Web Apps handle simple POST bodies more reliably without custom headers.
  const response = await fetch(base, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseAppsScriptResponse<T>(response);
}

export function createRoom(input: CreateRoomInput) {
  return postJson<CreateRoomResponse>({
    action: "createRoom",
    gameId: "beatitudes",
    teacherKey: input.teacherKey,
  });
}

export function getRoom(roomId: string, hostToken: string) {
  return getJson<RoomSummary>({
    action: "room",
    roomId,
    hostToken,
  });
}

export function joinRoom(roomId: string, joinToken: string, payload: ParticipantPayload) {
  return postJson<{ ok: true }>({
    action: "joinRoom",
    roomId,
    joinToken,
    ...payload,
  });
}

export function submitResult(roomId: string, joinToken: string, payload: SubmissionPayload) {
  return postJson<{ ok: true }>({
    action: "submitResult",
    roomId,
    joinToken,
    ...payload,
  });
}

export function endRoom(roomId: string, hostToken: string) {
  return postJson<{ ok: true }>({
    action: "endRoom",
    roomId,
    hostToken,
  });
}
