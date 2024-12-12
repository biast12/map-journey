import { useState, useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from "@ionic/react";
import { pencilSharp, close } from "ionicons/icons";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import { changeLanguage } from "../../utils/i18n";

/* Components */
import Toast, { showToastMessage } from "../../components/Toast";
import Loader from "../../components/Loader";

import "./General.scss";

interface Themes {
  [key: string]: string;
}

const General = ({ userData }: { userData: UserData }) => {
  const { t } = useTranslation();
  const { storeUserDataToken } = useAuth();

  /* States */
  const [mapTheme, setMapTheme] = useState(userData.settings.maptheme);
  const [language, setLanguage] = useState(userData.settings.language);
  const [notification, setNotification] = useState(userData.settings.notification);
  const [languages, setLanguages] = useState<{ [key: string]: string }>({});

  /* Hooks */
  const { makeRequest, isLoading } = useRequestData();

  const themes: Themes = {
    default: "Default",
  };

  useEffect(() => {
    document.title = "Map Journey - General Settings";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  useEffect(() => {
    const importLanguages = async () => {
      const languageFiles = import.meta.glob<{ lang: string }>(
        "/public/langs/*.json"
      );
      const loadedLanguages: { [key: string]: string } = {};

      for (const path in languageFiles) {
        const langModule = await languageFiles[path]();
        const langCode = path.match(/\/(\w+)\.json$/)?.[1];
        if (langCode) {
          if (langModule.lang) {
            loadedLanguages[langCode] = langModule.lang;
          } else {
            loadedLanguages[langCode] = t(
              "pages.settings.general.lang_missing_key"
            );
          }
        }
      }

      const sortedLanguages = Object.fromEntries(
        Object.entries(loadedLanguages).sort(([, a], [, b]) => {
          if (a === "English") return -1;
          if (b === "English") return 1;
          return a.localeCompare(b);
        })
      );

      setLanguages(sortedLanguages);
    };

    importLanguages();
  }, []);

  const handleSave = async () => {
    const updatedData: SettingsData = {
      language: language,
      maptheme: mapTheme,
      notification: notification,
    };

    try {
      await makeRequest(
        `settings/${userData.id}`,
        "PUT",
        { "Content-Type": "application/json" },
        updatedData
      );
      const newUserData = { ...userData, settings: { ...userData.settings } };

      if (language !== userData.settings?.language) {
        newUserData.settings.language = language;
      }
      if (mapTheme !== userData.settings?.maptheme) {
        newUserData.settings.maptheme = mapTheme;
      }
      if (notification !== userData.settings?.notification) {
        newUserData.settings.notification = notification;
      }

      console.log("Updated data:", newUserData);

      storeUserDataToken(newUserData);
      changeLanguage(updatedData.language);
      showToastMessage(t("pages.settings.general.successful"), "success");
    } catch (error) {
      showToastMessage(t("pages.settings.general.error_message"), "error");
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <Toast />
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("pages.settings.general.card_title")}</IonTitle>
          <IonButton slot="end" routerLink="/settings" fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="settingsContainer">
          <div className="settingsItem">
            <label>{t("pages.settings.general.map_theme")}</label>
            <IonSelect
              value={mapTheme}
              placeholder={t("pages.settings.general.map_theme_placeholder")}
              onIonChange={(e) => setMapTheme(e.detail.value)}
            >
              {Object.keys(themes).map((theme) => (
                <IonSelectOption key={theme} value={theme}>
                  {themes[theme]}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
          <div className="settingsItem">
            <label>{t("pages.settings.general.language")}</label>
            <IonSelect
              value={language}
              placeholder={t("pages.settings.general.language_placeholder")}
              onIonChange={(e) => setLanguage(e.detail.value)}
            >
              {Object.keys(languages).map((lang) => (
                <IonSelectOption key={lang} value={lang}>
                  {languages[lang]}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
          <div className="settingsItem">
            <label>{t("pages.settings.general.notification")}</label>
            <IonToggle
              checked={notification}
              onIonChange={(e) => setNotification(e.detail.checked)}
            />
          </div>
          <IonButton onClick={handleSave} disabled={isLoading}>
            <IonIcon icon={pencilSharp}></IonIcon>
            {t("pages.settings.general.submit")}
          </IonButton>
        </div>
      </IonContent>
    </>
  );
};

export default General;
