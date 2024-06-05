import { adjectives, nouns } from "./name.store";

export function generatePrettyName() {
  const randomAdjectiveIndex = Math.floor(Math.random() * adjectives.length);
  const randomNounIndex = Math.floor(Math.random() * nouns.length);

  return `${adjectives[randomAdjectiveIndex]} ${nouns[randomNounIndex]}`
}
