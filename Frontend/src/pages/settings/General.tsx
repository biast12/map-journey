import React, { useState } from "react";
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

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useNotificationsStatus from "../../hooks/ProviderContext";

/* Components */
import Loader from "../../components/Loader";
import Error from "../../components/Error";

import "./General.scss";

interface UserDataProps {
  userData: {
    settings: {
      id: string;
      maptheme: string;
      language: string;
      notification: boolean;
    };
  };
}

interface Themes {
  [key: string]: string;
}

interface Languages {
  [key: string]: string;
}

const General: React.FC<UserDataProps> = ({ userData }) => {
  const [mapTheme, setMapTheme] = useState(userData.settings.maptheme);
  const [language, setLanguage] = useState(userData.settings.language);
  const [notification, setNotification] = useState(
    userData.settings.notification
  );
  const { makeRequest, error, isLoading } = useRequestData();

  const { storeNotificationsStatusToken } = useNotificationsStatus();

  const themes: Themes = {
    default: "Default",
  };

  const languages: Languages = {
    en: "English",
  };

  const handleSave = async () => {
    const updatedData = {
      maptheme: mapTheme,
      language: language,
      notification: notification,
    };

    await makeRequest(
      `settings/${userData.settings.id}`,
      "PUT",
      { "Content-Type": "application/json" },
      updatedData
    );

    if (!error) {
      storeNotificationsStatusToken(updatedData.notification);
    } else {
      console.error("Error updating settings");
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && <Error message={"Something went wrong!"} />}
      <IonHeader>
        <IonToolbar>
          <IonTitle>General Settings</IonTitle>
          <IonButton slot="end" href="/settings" fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="settingsContainer">
          <div className="settingsItem">
            <label>Map Theme</label>
            <IonSelect
              value={mapTheme}
              placeholder="Select Map Theme"
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
            <label>Language</label>
            <IonSelect
              value={language}
              placeholder="Select Language"
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
            <label>Enable Notifications</label>
            <IonToggle
              checked={notification}
              onIonChange={(e) => setNotification(e.detail.checked)}
            />
          </div>
          <IonButton onClick={handleSave} disabled={isLoading}>
            <IonIcon icon={pencilSharp}></IonIcon>
            Save
          </IonButton>
        </div>
      </IonContent>
    </>
  );
};

export default General;
