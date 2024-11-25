import React, { useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonAlert,
} from "@ionic/react";
import { settingsOutline, personOutline, logOutOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../hooks/ProviderContext";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const history = useHistory();
  const { clearAuthToken } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await clearAuthToken();
    history.push("/");
  };
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
          <IonTitle>{t("pages.settings.index.card_title")}</IonTitle>
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
          <IonItem button onClick={() => setShowLogoutModal(true)}>
            <IonIcon icon={logOutOutline} slot="start" />
            <IonLabel>{t("pages.settings.index.logout.header")}</IonLabel>
          </IonItem>
        </IonList>
        <IonModal
          isOpen={showLogoutModal}
          onDidDismiss={() => setShowLogoutModal(false)}
        >
          <IonAlert
            isOpen={showLogoutModal}
            onDidDismiss={() => setShowLogoutModal(false)}
            header={t("pages.settings.index.logout.header")}
            message={t("pages.settings.index.logout.message")}
            buttons={[
              {
                text: t("pages.settings.index.logout.cancel"),
                role: t(
                  "pages.settings.index.logout.cancel"
                ).toLocaleLowerCase(),
                handler: () => {
                  setShowLogoutModal(false);
                },
              },
              {
                text: t("pages.settings.index.logout.header"),
                handler: handleLogout,
              },
            ]}
          />
        </IonModal>
      </IonContent>
    </>
  );
};

export default Settings;
