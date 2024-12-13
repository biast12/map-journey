import badWords from "./profanityFilter.json";

const profanityFilter = (text: string): boolean => {
  const lowerCaseText = text.toLowerCase();
  const textArray = lowerCaseText.split(" ");
  return badWords.some((word) => textArray.includes(word));
};

export default profanityFilter;
