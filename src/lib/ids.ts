import { customAlphabet } from "nanoid";

const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generate = customAlphabet(alphabet, 6);

export function createRoomCode(): string {
  return generate();
}

export function createFileId(): string {
  const idGen = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 9);
  return idGen();
}
