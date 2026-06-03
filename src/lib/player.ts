const PLAYER_KEY_PREFIX = "bible-games-hq:player:";

export function getPlayerId(roomId: string) {
  const key = `${PLAYER_KEY_PREFIX}${roomId}`;
  const existing = localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const next =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(key, next);
  return next;
}
