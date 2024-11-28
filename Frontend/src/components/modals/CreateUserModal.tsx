import { useState, FormEvent, useEffect } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import profanityFilter from "../../utils/profanityFilter";
import "./CreateUserModal.scss";
import Loader from "../Loader";
import Error from "../Error";
import Toast, { showToastMessage } from "../Toast";

interface CreateUserProps {
  closeCreateUserModal: () => void;
  closeLoginModal: () => void;
}

const CreateUserModal: React.FC<CreateUserProps> = ({
  closeCreateUserModal,
  closeLoginModal,
}) => {
  const [createSuccess, setCreateSuccess] = useState<boolean | null>(null);

  const { t } = useTranslation();
  const { makeRequest, isLoading, data, error } = useRequestData();
  const {
    role,
    storeAuthToken,
    storeRoleToken,
    clearAuthToken,
    clearRoleToken,
  } = useAuth();

  async function handleCreateUser(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name || !email || !password) {
      showToastMessage(t("required_fields"));
      return;
    }

    if (profanityFilter(name as string)) {
      showToastMessage(t("profanityFilter"));
      return;
    }

    role === "admin" && console.log("formData: ", formData);

    await makeRequest(
      "users",
      "POST",
      { "Content-Type": "application/json" },
      { name, email, password }
    );
  }

  useEffect(() => {
    if (data) {
      setCreateSuccess(true);
      storeAuthToken(data.id);
      storeRoleToken(data.role);
      closeCreateUserModal();
      closeLoginModal();
    } else if (error) {
      setCreateSuccess(false);
      showToastMessage("User creation failed");
      clearAuthToken();
      clearRoleToken();
    }
  }, [error, data]);

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
        <Toast />
      </IonCard>
    </>
  );
};

export default CreateUserModal;
