import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect, useState } from "react";
import ReportColumn from "./ReportColumn";

import "./ReportManagement.scss";
import Modal from "../Modal";
import ReportUserDisplay from "./ReportDisplays/ReportUserDisplay";
import ReportPinDisplay from "./ReportDisplays/ReportPinDisplay";
import Loader from "../Loader";

type ReportUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

type ReportPin = {
  id: number;
  profile_id: string;
  title: string;
  description: string;
  imgurls: string;
  date: string;
  location: string;
  longitude: number;
  latitude: number;
};

interface ReportData {
  id: number;
  text: string;
  date: string;
  active: boolean;
  reporting_user: ReportUser;
  reported_user?: ReportUser;
  reported_pin?: ReportPin;
}

const ReportManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: rpData, error: rpError, isLoading: rpIsLoading, makeRequest: rpMakeRequest } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<null | ReportData>(null);

  async function handleReportAction(reportData: ReportData, action: "dismiss" | "warn" | "ban") {
    await rpMakeRequest(`reports/${reportData.id}/${reportData.id}`, "POST", undefined, { action: action });

    makeRequest("reports/all")
    setSelectedReport(null);
    setShowModal(false);
  }

  useEffect(() => {
    makeRequest("reports/all");
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      {rpIsLoading && <Loader />}
      <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
        {selectedReport && (
          <IonGrid id="reportModalGrid">
            <IonRow>
              <IonCol id="reportModalTop" size="12">
                <p>Id: {selectedReport.id}</p>
                <p>Date: {new Date(selectedReport.date).toUTCString()}</p>
              </IonCol>
            </IonRow>
            <IonRow id="reportModalContent">
              <ReportUserDisplay header="Reporting User:" reportUser={selectedReport.reporting_user} />
              {selectedReport.reported_user ? (
                <ReportUserDisplay header="Reported User:" reportUser={selectedReport.reported_user} />
              ) : (
                selectedReport.reported_pin && <ReportPinDisplay reportPin={selectedReport.reported_pin} />
              )}
              <IonCol size="12">Reasoning: {selectedReport.text}</IonCol>
            </IonRow>
            <IonRow id="reportButtonsRow">
              <IonCol size="4" className="reportButtons">
                <IonButton
                  color={"success"}
                  onClick={(e) => {
                    handleReportAction(selectedReport, "dismiss");
                  }}
                >
                  Dismiss
                </IonButton>
              </IonCol>
              <IonCol size="4" className="reportButtons">
                <IonButton
                  color={"warning"}
                  onClick={(e) => {
                    handleReportAction(selectedReport, "warn");
                  }}
                >
                  Warn
                </IonButton>
              </IonCol>
              <IonCol size="4" className="reportButtons">
                <IonButton
                  color={"danger"}
                  onClick={(e) => {
                    handleReportAction(selectedReport, "ban");
                  }}
                >
                  Ban
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </Modal>
      <IonRow id="reportsRow">
        {data &&
          data
            .sort((a: ReportData, b: ReportData) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((reportData: ReportData) => (
              <ReportColumn
                key={reportData.id}
                reportData={reportData}
                onManageClick={(e) => {
                  setSelectedReport(reportData);
                  setShowModal(true);
                }}
              />
            ))}
      </IonRow>
    </>
  );
};

export default ReportManagement;
