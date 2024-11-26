import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
} from "@ionic/react";
import { useRef, useState, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ReportModal.scss";

import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import Error from "../../components/Error";
import Loader from "../../components/Loader";

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
  const [reportSuccess, setReportSuccess] = useState<boolean | null>(null);
  const toast = useRef<HTMLIonToastElement>(null);
  const { t } = useTranslation();
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID } = useAuth();
  const [text, setText] = useState("");

  async function handleReport(formEvent: FormEvent) {
    formEvent.preventDefault();

    const payload = {
      text,
      [reportedType === "user" ? "reported_user_id" : "reported_pin_id"]:
        reported_id,
    };

    makeRequest(
      `reports/${userID}`,
      "POST",
      { "Content-Type": "application/json" },
      payload
    );
  }

  useEffect(() => {
    if (data) {
      setReportSuccess(true);
      toast.current?.present();
      closeReportModal();
    } else if (error) {
      setReportSuccess(false);
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
                value={text}
                onIonChange={(e) => setText(e.detail.value!)}
              />
            </IonItem>
            {reportSuccess === false && (
              <p id="reportFailed">
                {t("modals.report.failed", { type: reportedType })}
              </p>
            )}
            <IonButton type="submit" expand="block">
              {t("modals.report.submit")}
            </IonButton>
            <IonButton
              id="closeButton"
              expand="block"
              color="medium"
              onClick={closeReportModal}
            >
              {t("modals.report.close")}
            </IonButton>
            <IonToast
              ref={toast}
              message={t("modals.report.successful")}
              position="bottom"
              duration={1500}
            ></IonToast>
          </form>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default ReportModal;
