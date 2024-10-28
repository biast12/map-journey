import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import {
  settingsOutline,
  notificationsOutline,
  lockClosedOutline,
  personOutline,
  flagOutline,
} from "ionicons/icons";

const Settings: React.FC = () => {
  const settingsData = [
    { name: "General", icon: settingsOutline },
    { name: "Account", icon: personOutline },
    { name: "Notifications", icon: notificationsOutline },
    { name: "Privacy", icon: lockClosedOutline },
    { name: "Language", icon: flagOutline },
  ];
  // CURRENTLY CANNOT CLOSE SETTINGS, NEED TO REFRESH MANUALLY
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {settingsData.map((setting, index) => (
            <IonItem key={index} button>
              <IonIcon icon={setting.icon} slot="start" />
              <IonLabel>{setting.name}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
