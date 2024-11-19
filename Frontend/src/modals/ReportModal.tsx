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
import { useRef, useState, FormEvent } from "react";
import "./ReportModal.scss";

import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";
import Error from "../components/Error";
import Loader from "../components/Loader";

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

    if (!error && !isLoading) {
      setReportSuccess(true);
      toast.current?.present();
      closeReportModal();
    } else {
      setReportSuccess(false);
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && <Error message={"Failed reporting!"} />}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Reporting {reportedType}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <form onSubmit={handleReport}>
            <IonItem>
              <IonLabel position="stacked">Report Text</IonLabel>
              <IonInput
                value={text}
                onIonChange={(e) => setText(e.detail.value!)}
                required
              />
            </IonItem>
            {reportSuccess === false && (
              <p id="reportFailed">
                Reporting {reportedType} failed! Check the inputs
              </p>
            )}
            <IonButton type="submit" expand="block">
              Submit Report
            </IonButton>
            <IonButton
              id="closeButton"
              expand="block"
              color="medium"
              onClick={closeReportModal}
            >
              Close
            </IonButton>
            <IonToast
              ref={toast}
              message="User created successfully"
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
