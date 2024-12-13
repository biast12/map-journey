import { useState, useEffect } from "react";
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
  IonCheckbox,
  IonLabel,
} from "@ionic/react";
import { pencilSharp, trashOutline, close } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useImageHandler from "../../hooks/useImageHandler";
import handleDeleteAccount from "../../utils/handleDeleteAccount";
import { useAuth } from "../../hooks/ProviderContext";

/* Components */
import Toast, { showToastMessage } from "../../components/Toast";
import Loader from "../../components/Loader";

import "./Account.scss";

const Account = ({ userData }: { userData: UserData }) => {
  const { t } = useTranslation();
  const history = useHistory();

  /* Hooks */
  const { makeRequest, isLoading } = useRequestData();
  const { makeRequest: deleteMakeRequest } = useRequestData();
  const { photoUrl, loading, takePhoto, handleUpload } = useImageHandler();
  const { storeUserDataToken, clearUserDataToken } = useAuth();

  /* States */
  const [username, setUsername] = useState<string>(userData.name);
  const [email, setEmail] = useState<string>(userData.email);
  const [password, setPassword] = useState<string>("");
  const [avatar, setAvatar] = useState<string>(userData.avatar);
  const [status, setStatus] = useState<string>(userData.status);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Map Journey - Account Settings";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

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

    const updatedData: {
      avatar: string;
      name: string;
      email: string;
      password?: string;
      status?: string;
    } = {
      avatar: updatedAvatar,
      name: username,
      email: email,
    };

    if (!updatedData.name || !updatedData.email) {
      showToastMessage(t("pages.settings.account.required_fields"));
      return;
    }

    if (password) {
      updatedData.password = password;
    }
    if (status !== userData.status) {
      updatedData.status = status;
    }

    userData.role === "admin" && console.log("Updated data:", updatedData);

    try {
      await makeRequest(`users/${userData.id}`, "PUT", { "Content-Type": "application/json" }, updatedData);

      const newUserData = { ...userData };
      if (updatedAvatar !== userData.avatar) {
        newUserData.avatar = updatedAvatar;
      }
      if (username !== userData.name) {
        newUserData.name = username;
      }
      if (email !== userData.email) {
        newUserData.email = email;
      }
      if (status !== userData.status) {
        newUserData.status = status as Status;
      }

      storeUserDataToken(newUserData);
      showToastMessage(t("pages.settings.account.successful"), "success");
    } catch (error) {
      showToastMessage(t("pages.settings.account.failed"), "error");
    }
  };

  return (
    <>
      {isLoading || (loading && <Loader />)}
      <Toast />
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("pages.settings.account.card_title")}</IonTitle>
          <IonButton slot="end" routerLink="/settings" fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="imageContainer">
          <img
            id="showPinImage"
            alt={t("pages.settings.account.img_alt")}
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
              placeholder={t("pages.settings.account.username_placeholder")}
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={email}
              placeholder={t("pages.settings.account.email_placeholder")}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonInput
              value={password}
              type="password"
              placeholder={t("pages.settings.account.password_placeholder")}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </div>
          <div className="inlineTags">
            <IonLabel>Public: </IonLabel>
            <IonCheckbox
              disabled={!(userData.status === "public" || userData.status === "private")}
              checked={status === "public"}
              onIonChange={(e) => setStatus(e.target.checked! ? "public" : "private")}
            />
          </div>
          <IonButton onClick={handleSave} disabled={isLoading}>
            <IonIcon icon={pencilSharp}></IonIcon>
            {t("pages.settings.account.submit")}
          </IonButton>
          <IonButton color="danger" onClick={() => setShowDeleteModal(true)}>
            <IonIcon icon={trashOutline}></IonIcon>
            {t("pages.settings.account.delete.header")}
          </IonButton>
        </div>
        <IonModal isOpen={showDeleteModal} onDidDismiss={() => setShowDeleteModal(false)}>
          <IonAlert
            isOpen={showDeleteModal}
            onDidDismiss={() => setShowDeleteModal(false)}
            header={t("pages.settings.account.delete.header")}
            message={t("pages.settings.account.delete.message")}
            buttons={[
              {
                text: t("pages.settings.account.delete.cancel"),
                role: t("pages.settings.account.delete.cancel").toLocaleLowerCase(),
                handler: () => {
                  setShowDeleteModal(false);
                },
              },
              {
                text: t("pages.settings.account.delete.header"),
                handler: () => {
                  handleDeleteAccount({
                    userID: userData.id,
                    makeRequest: deleteMakeRequest,
                    clearUserDataToken,
                    history,
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
