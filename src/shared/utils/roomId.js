const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateRoomId(length = 7) {
  const values = crypto.getRandomValues(new Uint8Array(length));
  const suffix = Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join("");
  return `codev-${suffix}`;
}

export function normalizeRoomId(value) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}
