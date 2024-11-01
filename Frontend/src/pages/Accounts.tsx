import React, { useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
} from "@ionic/react";
import { pencilSharp, close} from "ionicons/icons";
import "./Accounts.scss";

const Account: React.FC = () => {
  const [username, setUsername] = useState("Krisz123");
  const [email, setEmail] = useState("krisz@gmail.com");
  const [password, setPassword] = useState("12345678");

  const handleButtonClick = () => {
    console.log("text test");
  };

  const handleImageClick = () => {
    console.log("image test");
  };

  const handleCloseClick = () => {
    console.log("close test")
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
          <IonButton slot="end" href="/settings" fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="imageContainer" onClick={handleImageClick}>
          <img
            id="showPinImage"
            alt="Silhouette of mountains"
            src="https://ionicframework.com/docs/img/demos/card-media.png"
          />
        </div>
        <div className="inlineTags">
          <IonInput
            value={username}
            onIonChange={(e) => setUsername(e.detail.value!)}
          />
          <IonButton onClick={handleButtonClick}>
            <IonIcon icon={pencilSharp}></IonIcon>
          </IonButton>
        </div>
        <div className="inlineTags">
          <IonInput
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
          <IonButton onClick={handleButtonClick}>
            <IonIcon icon={pencilSharp}></IonIcon>
          </IonButton>
        </div>
        <div className="inlineTags">
          <IonInput
            value={password}
            type="password"
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
          <IonButton onClick={handleButtonClick}>
            <IonIcon icon={pencilSharp}></IonIcon>
          </IonButton>
        </div>
      </IonContent>
    </>
  );
};

export default Account;
