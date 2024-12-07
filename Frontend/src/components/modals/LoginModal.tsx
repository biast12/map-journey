import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonModal,
} from "@ionic/react";
import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import Toast, { showToastMessage } from "../Toast";
import Loader from "../Loader";

/* Modal */
import CreateUserModal from "./CreateUserModal";

import "./LoginModal.scss";

interface LoginProps {
  closeLoginModal: () => void;
}

const LoginModal: React.FC<LoginProps> = ({ closeLoginModal }) => {
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);

  const { t } = useTranslation();
  const { makeRequest, data, isLoading } = useRequestData();
  const { storeAuthToken, storeRoleToken, clearAuthToken, clearRoleToken } =
    useAuth();

  async function handleLogin(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      showToastMessage(t("required_fields"));
      return;
    }

    try {
      await makeRequest(
        "users/login",
        "POST",
        { "Content-Type": "application/json" },
        { email, password }
      );
    } catch (error) {
      setLoginSuccess(false);
      clearAuthToken();
      clearRoleToken();
    }
  }
  useEffect(() => {
    if (data) {
      storeAuthToken(data.user.id);
      storeRoleToken(data.user.role);
      closeLoginModal();
    }
  }, [data]);

  const openCreateUserModal = () => setCreateUserModal(true);
  const closeCreateUserModal = () => setCreateUserModal(false);

  return (
    <>
      {isLoading && <Loader />}
      <Toast />
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>{t("modals.login.card_title")}</IonCardTitle>
        </IonCardHeader>
        <form action="" onSubmit={handleLogin}>
          <IonInput
            id="emailInput"
            name="email"
            type="email"
            labelPlacement="fixed"
            label={t("modals.login.email")}
            placeholder={t("modals.login.email_placeholder")}
          ></IonInput>
          <IonInput
            id="passwordInput"
            name="password"
            type="password"
            labelPlacement="fixed"
            label={t("modals.login.password")}
            placeholder={t("modals.login.password_placeholder")}
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
          </IonInput>
          {loginSuccess == false && (
            <p id="loginFailed">{t("modals.login.failed")}</p>
          )}
          <IonButton
            type="submit"
            id="loginButton"
            expand="block"
            disabled={isLoading}
          >
            {t("modals.login.submit")}
          </IonButton>
        </form>
        <IonButton
          id="createUserButton"
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
