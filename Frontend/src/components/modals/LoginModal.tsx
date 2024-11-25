import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonToast,
  IonModal,
} from "@ionic/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import "./LoginModal.scss";
import Error from "../../components/Error";
import Loader from "../../components/Loader";

/* Modal */
import CreateUserModal from "./CreateUserModal";

interface LoginProps {
  closeLoginModal: () => void;
}

const LoginModal: React.FC<LoginProps> = ({ closeLoginModal }) => {
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const toast = useRef<HTMLIonToastElement>(null);
  const { t } = useTranslation();
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { storeAuthToken } = useAuth();

  async function handleLogin(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    await makeRequest(
      "users/login",
      "POST",
      { "Content-Type": "application/json" },
      { email, password }
    );
  }
  useEffect(() => {
    if (data) {
      setLoginSuccess(true);
      toast.current?.present();
      storeAuthToken(data.user.id);
      closeLoginModal();
    } else if (error) {
      setLoginSuccess(false);
    }
  }, [error, data]);

  const openCreateUserModal = () => setCreateUserModal(true);
  const closeCreateUserModal = () => setCreateUserModal(false);

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && (
        <Error message={t("modals.login.error_page_message")} />
      )}
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
        <IonToast
          ref={toast}
          message={t("modals.login.failed")}
          position="bottom"
          duration={1500}
        ></IonToast>
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
