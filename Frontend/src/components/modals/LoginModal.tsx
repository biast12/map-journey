import React, { FormEvent, useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonModal,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import Turnstile from 'react-turnstile';

/* Hooks */
import { changeLanguage, setDebugMode } from "../../utils/i18n";
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import Loader from "../Loader";

/* Modal */
import CreateUserModal from "./CreateUserModal";

import "./LoginModal.scss";

const LoginModal = ({ closeLoginModal }: { closeLoginModal: () => void }) => {
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { t } = useTranslation();
  const { makeRequest, data, isLoading } = useRequestData();
  const { storeUserDataToken, clearUserDataToken } =
    useAuth();

  async function handleLogin(formEvent: FormEvent) {
    formEvent.preventDefault();

    if (!captchaToken) {
      setLoginSuccess(false);
      return;
    }

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await makeRequest(
        "users/login",
        "POST",
        { "Content-Type": "application/json" },
        { email, password }
      );
    } catch (error) {
      setLoginSuccess(false);
      clearUserDataToken();
    }
  }

  useEffect(() => {
    if (data && !isLoading) {
      storeUserDataToken(data);
      changeLanguage(data.settings.language);
      if (data.role === "admin") {
        console.log("Admin/Debug mode enabled");
        console.log("Your saved user data: ", data);
        setDebugMode(true);
      }
      closeLoginModal();
    }
  }, [isLoading]);

  const openCreateUserModal = () => setCreateUserModal(true);
  const closeCreateUserModal = () => setCreateUserModal(false);

  return (
    <>
      {isLoading && <Loader />}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>{t("modals.login.card_title")}</IonCardTitle>
        </IonCardHeader>
        <form action="" onSubmit={handleLogin}>
          <IonInput
            required
            id="emailInput"
            name="email"
            type="email"
            labelPlacement="fixed"
            label="Email"
            placeholder={t("modals.login.email_placeholder")}
          ></IonInput>
          <IonInput
            required
            id="passwordInput"
            name="password"
            type="password"
            labelPlacement="fixed"
            label="Password"
            placeholder={t("modals.login.password_placeholder")}
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
          </IonInput>
          <Turnstile
            id="captcha"
            theme="dark"
            retry="never"
            sitekey={import.meta.env.VITE_CLOUDFLARE_CAPTCHA_KEY}
            onVerify={(token) => setCaptchaToken(token)}
          />
          {loginSuccess == false && (
            <p id="loginFailed">{t("modals.login.failed")}</p>
          )}
          <IonButton
            type="submit"
            expand="block"
            disabled={isLoading}
          >
            {t("modals.login.submit")}
          </IonButton>
        </form>
        <IonButton
          id="create-user-button"
          expand="block"
          onClick={openCreateUserModal}
        >
          {t("modals.login.create_user")}
        </IonButton>
        <IonModal isOpen={createUserModal} onDidDismiss={closeCreateUserModal}>
          <div className="modal-content">
            <CreateUserModal
              closeCreateUserModal={closeCreateUserModal}
              closeLoginModal={closeLoginModal}
            />
          </div>
        </IonModal>
      </IonCard>
    </>
  );
};

export default LoginModal;
