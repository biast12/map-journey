import badWords from "./profanityFilter.json";

const profanityFilter = (text: string): boolean => {
  const lowerCaseText = text.toLowerCase();
  return badWords.some((word) => lowerCaseText.includes(word));
};

export default profanityFilter;
