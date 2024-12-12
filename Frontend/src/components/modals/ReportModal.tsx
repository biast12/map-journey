import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import Toast, { showToastMessage } from "../Toast";
import Loader from "../Loader";

import "./ReportModal.scss";

interface ReportedProps {
  closeReportModal: () => void;
  reported_id: string;
  reportedType: "user" | "pin";
}

const ReportModal = ({
  closeReportModal,
  reported_id,
  reportedType,
}: ReportedProps) => {
  const { t } = useTranslation();

  /* States */
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* Refs */
  const confirmButton = useRef<HTMLIonButtonElement>(null);
  const cancelButton = useRef<HTMLIonButtonElement>(null);
  const textInput = useRef<HTMLIonInputElement>(null);

  /* Hooks */
  const { makeRequest, isLoading } = useRequestData();
  const { userID, userData } = useAuth();

  useEffect(() => {
    const refs = [confirmButton, cancelButton, textInput];

    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.disabled = isSubmitting;
      }
    });
  }, [isSubmitting]);

  async function handleReport(formEvent: FormEvent) {
    formEvent.preventDefault();
    setIsSubmitting(true);

    const payload = {
      text,
      [reportedType === "user" ? "reported_user_id" : "reported_pin_id"]:
        reported_id,
    };
    userData?.role === "admin" && console.log("Payload:", payload);
    try {
      await makeRequest(
        `reports/${userID}`,
        "POST",
        { "Content-Type": "application/json" },
        payload
      );
      
      closeReportModal();
      userData?.role === "admin" && console.log("Reported successfully");
    } catch (error) {
      showToastMessage(t("modals.report.failed", { type: reportedType }), "error");
    }
    setIsSubmitting(false);
  }

  return (
    <>
      {isLoading && <Loader />}
      <Toast />
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            {t("modals.report.card_title")} {reportedType}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <form onSubmit={handleReport}>
            <IonItem>
              <IonLabel position="stacked">{t("modals.report.text")}</IonLabel>
              <IonInput
                required
                ref={textInput}
                type="text"
                value={text}
                onIonChange={(e) => setText(e.detail.value!)}
              />
            </IonItem>
            <IonButton ref={confirmButton} type="submit" expand="block">
              {t("modals.report.submit")}
            </IonButton>
            <IonButton
              ref={cancelButton}
              id="closeButton"
              expand="block"
              color="medium"
              onClick={closeReportModal}
            >
              {t("modals.report.close")}
            </IonButton>
            <Toast />
          </form>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default ReportModal;
