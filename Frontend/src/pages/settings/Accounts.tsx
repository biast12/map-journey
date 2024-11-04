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
import { pencilSharp, close } from "ionicons/icons";
import "./Accounts.scss";
import useRequestData from "../../hooks/useRequestData";
import { usePhotoGallery } from "../../hooks/usePhotoGallery";

interface UserDataProps {
  userData: any;
}

const Account: React.FC<UserDataProps> = ({ userData }) => {
  const [username, setUsername] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [password, setPassword] = useState("");
  const { makeRequest, isLoading, error } = useRequestData();
  const { takePhoto, photo } = usePhotoGallery();

  const handleSave = async () => {
    const updatedData = {
      avatar: photo,
      name: username,
      email: email,
      password: password,
    };

    await makeRequest(
      `users/${userData.id}`,
      "PUT",
      { "Content-Type": "application/json" },
      updatedData
    );

    if (!error) {
      console.log("User data updated successfully");
    } else {
      console.error("Error updating user data");
    }
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
        <div
          className="imageContainer"
          onClick={async () => {
            await takePhoto();
          }}
        >
          <img
            id="showPinImage"
            alt="Silhouette of mountains"
            src={
              photo?.webViewPath
                ? photo.webViewPath
                : "https://ionicframework.com/docs/img/demos/card-media.png"
            }
          />
        </div>
        <div className="inlineTagsContainer">
          <div className="inlineTags">
            <IonInput
              value={username}
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={password}
              type="password"
              onIonChange={(e) => setPassword(e.detail.value!)}
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

export default Account;
