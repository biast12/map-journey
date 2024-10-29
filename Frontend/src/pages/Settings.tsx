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
            <IonItem
              key={index}
              button
              href={"/settings/" + setting.name.toLowerCase()}
            >
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
