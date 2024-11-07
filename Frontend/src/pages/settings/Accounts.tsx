import React, { useState, useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonToast,
} from "@ionic/react";
import { pencilSharp, close } from "ionicons/icons";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import { usePhotoGallery } from "../../hooks/usePhotoGallery";

/* Components */
import Loader from "../../components/Loader";
import Error from "../../components/Error";

import "./Accounts.scss";

interface UserDataProps {
  userData: {
    id: string;
    avatar: string;
    name: string;
    email: string;
  };
}

const Account: React.FC<UserDataProps> = ({ userData }) => {
  const [username, setUsername] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(
    userData.avatar ||
      "https://ionicframework.com/docs/img/demos/card-media.png"
  );
  const { makeRequest, isLoading, error } = useRequestData();
  const { takePhoto, photo } = usePhotoGallery();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (photo) {
      setAvatar(photo.webViewPath || "");
    }
  }, [photo]);

  const handleSave = async () => {
    const updatedData = {
      avatar: avatar,
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
      setShowToast(true);
    } else {
      console.error("Error updating user data");
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && <Error message={"Something went wrong!"} />}
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
          <img id="showPinImage" alt="User Avatar" src={avatar} />
        </div>
        <div className="inlineTagsContainer">
          <div className="inlineTags">
            <IonInput
              value={username}
              placeholder="Username"
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={email}
              placeholder="Email"
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={password}
              type="password"
              placeholder="Password"
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </div>
          <IonButton onClick={handleSave} disabled={isLoading}>
            <IonIcon icon={pencilSharp}></IonIcon>
            Save
          </IonButton>
        </div>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="User data updated successfully"
          duration={2000}
        />
      </IonContent>
    </>
  );
};

export default Account;
