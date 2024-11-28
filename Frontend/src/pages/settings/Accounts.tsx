import React, { useState, useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonModal,
  IonAlert,
} from "@ionic/react";
import { pencilSharp, trashOutline, close } from "ionicons/icons";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useImageHandler from "../../hooks/useImageHandler";
import handleDeleteAccount from "../../hooks/useDeleteAccount";
import { useAuth } from "../../hooks/ProviderContext";

/* Components */
import Loader from "../../components/Loader";
import Error from "../../components/Error";
import Toast, { showToastMessage } from "../../components/Toast";

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
  const [username, setUsername] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(userData.avatar);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* Hooks */
  const { makeRequest, isLoading, error } = useRequestData();
  const { takePhoto, photoUrl, handleUpload, removeImage } = useImageHandler();
  const { role } = useAuth();

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

    if (!updatedData.name || !updatedData.email) {
      showToastMessage(t("pages.settings.accounts.required_fields"));
      return;
    }

    if (password) {
      updatedData = { ...updatedData, password };
    }

    role === "admin" && console.log("Updated data:", updatedData);

    await makeRequest(
      `users/${userData.id}`,
      "PUT",
      { "Content-Type": "application/json" },
      updatedData
    );

    if (!error) {
      showToastMessage(t("pages.settings.accounts.successful"));
      await removeImage(userData.avatar).catch((error) =>
        console.error("Error removing old image:", error)
      );
    } else {
      showToastMessage(t("pages.settings.accounts.error_fetch"));
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
          <IonButton color="danger" onClick={() => setShowDeleteModal(true)}>
            <IonIcon icon={trashOutline}></IonIcon>
            {t("pages.settings.accounts.delete.header")}
          </IonButton>
        </div>
        <IonModal
          isOpen={showDeleteModal}
          onDidDismiss={() => setShowDeleteModal(false)}
        >
          <IonAlert
            isOpen={showDeleteModal}
            onDidDismiss={() => setShowDeleteModal(false)}
            header={t("pages.settings.accounts.delete.header")}
            message={t("pages.settings.accounts.delete.message")}
            buttons={[
              {
                text: t("pages.settings.accounts.delete.cancel"),
                role: t(
                  "pages.settings.accounts.delete.cancel"
                ).toLocaleLowerCase(),
                handler: () => {
                  setShowDeleteModal(false);
                },
              },
              {
                text: t("pages.settings.accounts.delete.header"),
                handler: () => {
                  handleDeleteAccount({
                    data: { id: userData.id, avatar: userData.avatar },
                  });
                },
              },
            ]}
          />
        </IonModal>
        <Toast />
      </IonContent>
    </>
  );
};

export default Account;
