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
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import { profanityFilter } from "../../utils/profanityFilter";
import "./LoginModal.scss";
import Error from "../Error";
import Loader from "../Loader";
import Toast from "../Toast";

/* Modal */
import CreateUserModal from "./CreateUserModal";

interface LoginProps {
  closeLoginModal: () => void;
}

const LoginModal: React.FC<LoginProps> = ({ closeLoginModal }) => {
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { t } = useTranslation();
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { storeAuthToken, storeRoleToken, clearAuthToken, clearRoleToken } =
    useAuth();

  async function handleLogin(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      setToastMessage("All fields are required");
      setShowToast(true);
      return;
    }

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
      setToastMessage(t("modals.login.success"));
      setShowToast(true);
      storeAuthToken(data.user.id);
      storeRoleToken(data.user.role);
      closeLoginModal();
    } else if (error) {
      setLoginSuccess(false);
      clearAuthToken();
      clearRoleToken();
    }
  }, [data, error]);

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
        <IonModal isOpen={createUserModal} onDidDismiss={closeCreateUserModal}>
          <div className="modal-content">
            <CreateUserModal
              closeCreateUserModal={closeCreateUserModal}
              closeLoginModal={closeLoginModal}
            />
          </div>
        </IonModal>
        <Toast
          showToast={showToast}
          toastMessage={toastMessage}
          setShowToast={setShowToast}
        />
      </IonCard>
    </>
  );
};

export default LoginModal;
