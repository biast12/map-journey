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
import "./ReportModal.scss";

import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import Error from "../Error";
import Loader from "../Loader";
import Toast from "../Toast";

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  /* Refs */
  const confirmButton = useRef<HTMLIonButtonElement>(null);
  const cancelButton = useRef<HTMLIonButtonElement>(null);
  const textInput = useRef<HTMLIonInputElement>(null);

  /* Hooks */
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID, role } = useAuth();

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
    role === "admin" && console.log("Payload:", payload);
    try {
      await makeRequest(
        `reports/${userID}`,
        "POST",
        { "Content-Type": "application/json" },
        payload
      );
    } catch (error) {
      setToastMessage(t("modals.report.failed", { type: reportedType }));
      setShowToast(true);
    } finally {
      role === "admin" && console.log("Report created successfully");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (data) {
      setToastMessage(t("modals.report.success"));
      setShowToast(true);
      closeReportModal();
      role === "admin" && console.log("Reported successfully");
    } else if (error) {
      setToastMessage(t("modals.report.failed", { type: reportedType }));
      setShowToast(true);
    }
  }, [error, data]);

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && (
        <Error message={t("modals.report.error_page_message")} />
      )}
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
            <Toast
              showToast={showToast}
              toastMessage={toastMessage}
              setShowToast={setShowToast}
            />
          </form>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default ReportModal;
