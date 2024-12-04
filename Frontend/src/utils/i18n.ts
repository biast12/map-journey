import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend/cjs";
import LanguageDetector from "i18next-browser-languagedetector";

const defaultLanguage = "en";
const loadPath = "langs/{{lng}}.json";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    backend: {
      loadPath: (lngs: string) => {
        return loadPath.replace("{{lng}}", lngs[0].toLowerCase());
      },
    },
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    missingKeyHandler: function (lng, key) {
      console.warn(`Missing translation for key: ${key} in language: ${lng}`);
    },
  });

const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
};

const setDebugMode = (debug: boolean) => {
  i18n.init({
    debug: debug,
  });
  i18n.reloadResources();
};

export { changeLanguage, setDebugMode };
export default i18n;
