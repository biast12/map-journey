import { useState, FormEvent, useEffect } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonText,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import Turnstile from 'react-turnstile';

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Utils */
import profanityFilter from "../../utils/profanityFilter";

/* Components */
import Toast, { showToastMessage } from "../Toast";
import Loader from "../Loader";

import "./CreateUserModal.scss";

interface CreateUserProps {
  closeCreateUserModal: () => void;
  closeLoginModal: () => void;
}

const CreateUserModal: React.FC<CreateUserProps> = ({
  closeCreateUserModal,
  closeLoginModal,
}) => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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

    if (!agreeToTerms) {
      showToastMessage(t("modals.create_user.agree_to_terms_required"), "warning");
      return;
    }

    if (!captchaToken) {
      showToastMessage(t("captcha_required"), "warning");
      return;
    }

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (profanityFilter(name as string)) {
      showToastMessage(t("profanityFilter"), "warning");
      return;
    }

    role === "admin" && console.log("formData: ", formData);

    try {
      await makeRequest(
        "users",
        "POST",
        { "Content-Type": "application/json" },
        { name, email, password }
      );
    } catch (error) {
      showToastMessage(t("modals.create_user.error_message"), "error");
    }
  }

  useEffect(() => {
    if (data) {
      storeAuthToken(data.id);
      storeRoleToken(data.role);
      closeCreateUserModal();
      closeLoginModal();
    } else if (error) {
      showToastMessage("User creation failed", "error");
      clearAuthToken();
      clearRoleToken();
    }
  }, [error, data]);

  return (
    <>
      {isLoading && <Loader />}
      <Toast />
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
          <Turnstile
            id="captcha"
            theme="dark"
            retry="never"
            sitekey={import.meta.env.VITE_CLOUDFLARE_CAPTCHA_KEY}
            onVerify={(token) => setCaptchaToken(token)}
          />
          <IonItem lines="none">
            <IonCheckbox
              slot="start"
              checked={agreeToTerms}
              onIonChange={() => setAgreeToTerms(!agreeToTerms)}
            />
            <IonLabel>
              {t("modals.create_user.agree_to_terms")}{" "}
              <a
                href="https://map-journey.com/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("modals.create_user.terms_of_service")}
              </a>
            </IonLabel>
          </IonItem>
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
      </IonCard>
    </>
  );
};

export default CreateUserModal;
