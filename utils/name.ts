import { ulid } from "ulid";
import { adjectives, nouns } from "./name.store";
export function generatePrettyName() {
  const num = ulid();
  const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
  const randomNounIndex = Math.floor(Math.random() * nouns.length);
  const end = num.length - 1;

  return `${adjectives[randomAdjectiveIndex]} ${nouns[randomNounIndex]} ${num
    .split("")
    .slice(end - 3, end)
    .join("")
    .toLocaleLowerCase()}`;
}
