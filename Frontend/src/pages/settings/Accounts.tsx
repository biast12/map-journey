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
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useImageHandler from "../../hooks/useImageHandler";

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
  const { t } = useTranslation();

  /* States */
  const [username, setUsername] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(
    userData.avatar ||
      "https://ionicframework.com/docs/img/demos/card-media.png"
  );
  const [showToast, setShowToast] = useState(false);

  /* Hooks */
  const { makeRequest, isLoading, error } = useRequestData();
  const { takePhoto, photoUrl, handleUpload, removeImage } = useImageHandler();

  useEffect(() => {
    if (photoUrl) {
      setAvatar(photoUrl);
    }
  }, [photoUrl]);

  const handleSave = async () => {
    let updatedAvatar = avatar;

    if (photoUrl) {
      try {
        const { publicUrl } = await handleUpload(userData.id);
        updatedAvatar = publicUrl;
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
    }

    let updatedData: {
      avatar: string;
      name: string;
      email: string;
      password?: string;
    } = {
      avatar: updatedAvatar,
      name: username,
      email: email,
    };

    if (password) {
      updatedData = { ...updatedData, password };
    }

    console.log("Updated data:", updatedData);

    await makeRequest(
      `users/${userData.id}`,
      "PUT",
      { "Content-Type": "application/json" },
      updatedData
    );

    if (!error) {
      setShowToast(true);
      await removeImage(userData.avatar).catch((error) =>
        console.error("Error removing old image:", error)
      );
    } else {
      console.error("Error updating user data");
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && (
        <Error message={t("pages.settings.accounts.error_page_message")} />
      )}
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("pages.settings.accounts.card_title")}</IonTitle>
          <IonButton slot="end" href="/settings" fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="imageContainer">
          <img
            id="showPinImage"
            alt={t("pages.settings.accounts.img_alt")}
            src={avatar}
            onClick={async () => {
              await takePhoto();
            }}
          />
        </div>
        <div className="inlineTagsContainer">
          <div className="inlineTags">
            <IonInput
              value={username}
              placeholder={t("pages.settings.accounts.username")}
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={email}
              placeholder={t("pages.settings.accounts.email")}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={password}
              type="password"
              placeholder={t("pages.settings.accounts.password")}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </div>
          <IonButton onClick={handleSave} disabled={isLoading}>
            <IonIcon icon={pencilSharp}></IonIcon>
            {t("pages.settings.accounts.submit")}
          </IonButton>
        </div>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={t("pages.settings.accounts.successful")}
          duration={2000}
        />
      </IonContent>
    </>
  );
};

export default Account;
