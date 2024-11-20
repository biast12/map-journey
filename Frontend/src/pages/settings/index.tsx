import React from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import { settingsOutline, personOutline } from "ionicons/icons";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const settingsData = [
    {
      name: t("pages.settings.index.account"),
      url: "account",
      icon: settingsOutline,
    },
    {
      name: t("pages.settings.index.general"),
      url: "general",
      icon: personOutline,
    },
  ];
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {settingsData.map((setting, index) => (
            <IonItem key={index} button href={"/settings/" + setting.url}>
              <IonIcon icon={setting.icon} slot="start" />
              <IonLabel>{setting.name}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </>
  );
};

export default Settings;
