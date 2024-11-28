import badWords from "./profanityFilter.json";

export const profanityFilter = (text: string): boolean => {
  const lowerCaseText = text.toLowerCase();
  return badWords.some((word) => lowerCaseText.includes(word));
};
