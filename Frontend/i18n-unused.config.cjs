module.exports = {
  localesPath: "public/langs",
  srcPath: "src",
  translationKeyMatcher: /t\(\s*["'`]?([\s\S]+?)["'`]?\s*(?:\)|,)|i18nKey="([\s\S]+?)"/gi,
};
