import type { CreateRoomResponse } from "./api";

const TEACHER_KEY_STORAGE = "bible-games-hq:teacher-key";
const HOST_ROOM_STORAGE_PREFIX = "bible-games-hq:host-room:";

export type StoredHostRoom = {
  roomId: string;
  joinToken: string;
  hostToken: string;
  expiresAt: number;
};

export function getStoredTeacherKey() {
  return localStorage.getItem(TEACHER_KEY_STORAGE) ?? "";
}

export function setStoredTeacherKey(value: string) {
  localStorage.setItem(TEACHER_KEY_STORAGE, value);
}

export function clearStoredTeacherKey() {
  localStorage.removeItem(TEACHER_KEY_STORAGE);
}

export function saveHostRoom(room: CreateRoomResponse) {
  const stored: StoredHostRoom = {
    roomId: room.roomId,
    joinToken: room.joinToken,
    hostToken: room.hostToken,
    expiresAt: room.expiresAt,
  };

  localStorage.setItem(`${HOST_ROOM_STORAGE_PREFIX}${room.roomId}`, JSON.stringify(stored));
}

export function getStoredHostRoom(roomId: string): StoredHostRoom | null {
  const raw = localStorage.getItem(`${HOST_ROOM_STORAGE_PREFIX}${roomId}`);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredHostRoom>;
    if (
      parsed.roomId === roomId &&
      typeof parsed.joinToken === "string" &&
      typeof parsed.hostToken === "string" &&
      typeof parsed.expiresAt === "number"
    ) {
      return parsed as StoredHostRoom;
    }
  } catch {
    localStorage.removeItem(`${HOST_ROOM_STORAGE_PREFIX}${roomId}`);
  }

  return null;
}
