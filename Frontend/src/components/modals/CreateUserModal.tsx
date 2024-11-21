import { useRef, useState, FormEvent } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
  IonToast,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import useRequestData from "../../hooks/useRequestData";
import "./CreateUserModal.scss";
import Loader from "../../components/Loader";
import Error from "../../components/Error";

interface CreateUserProps {
  closeCreateUserModal: () => void;
  closeLoginModal: () => void;
}

const CreateUserModal: React.FC<CreateUserProps> = ({
  closeCreateUserModal,
  closeLoginModal,
}) => {
  const [createSuccess, setCreateSuccess] = useState<boolean | null>(null);
  const toast = useRef<HTMLIonToastElement>(null);
  const { t } = useTranslation();
  const { makeRequest, isLoading, data, error } = useRequestData();

  async function handleCreateUser(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    await makeRequest(
      "users",
      "POST",
      { "Content-Type": "application/json" },
      { name, email, password }
    );

    if (!error && data) {
      setCreateSuccess(true);
      toast.current?.present();
      closeCreateUserModal();
      closeLoginModal();
    } else {
      setCreateSuccess(false);
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && (
        <Error message={t("modals.create_user.error_page_message")} />
      )}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>{t("modals.create_user.card_title")}</IonCardTitle>
        </IonCardHeader>
        <form action="" onSubmit={handleCreateUser}>
          <IonInput
            required
            id="nameInput"
            name="name"
            type="text"
            labelPlacement="fixed"
            label={t("modals.create_user.username")}
            placeholder={t("modals.create_user.username_placeholder")}
          ></IonInput>
          <IonInput
            required
            id="emailInput"
            name="email"
            type="email"
            labelPlacement="fixed"
            label={t("modals.create_user.email")}
            placeholder={t("modals.create_user.email_placeholder")}
          ></IonInput>
          <IonInput
            required
            id="passwordInput"
            name="password"
            type="password"
            labelPlacement="fixed"
            label={t("modals.create_user.password")}
            placeholder={t("modals.create_user.password_placeholder")}
          >
            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
          </IonInput>
          {createSuccess === false && (
            <p id="createFailed">{t("modals.create_user.failed")}</p>
          )}
          <IonButton
            type="submit"
            id="createButton"
            expand="block"
            disabled={isLoading}
          >
            {t("modals.create_user.submit")}
          </IonButton>
        </form>
        <IonButton
          id="closeButton"
          expand="block"
          color="medium"
          onClick={closeCreateUserModal}
        >
          {t("modals.create_user.close")}
        </IonButton>
        <IonToast
          ref={toast}
          message="User created successfully"
          position="bottom"
          duration={1500}
        ></IonToast>
      </IonCard>
    </>
  );
};

export default CreateUserModal;
