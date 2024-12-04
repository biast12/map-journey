import React from 'react'
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react'

/* Components */
import ReportDisplay from '../admin/ReportDisplay'
import Modal from '../Modal'

interface ReportActionModalProps {
  selectedReport: ReportData;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  handleReportAction: (selectedReport: ReportData, action: "dismiss" | "warn" | "ban") => void;
}

const ReportActionModal: React.FC<ReportActionModalProps> = ({ selectedReport, showModal, setShowModal, handleReportAction }) => {
  return (
    <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
      <IonGrid id="reportModalGrid">
        <IonRow>
          <IonCol id="reportModalTop" size="12">
            <p>Id: {selectedReport.id}</p>
            <p>Date: {new Date(selectedReport.date).toUTCString()}</p>
          </IonCol>
        </IonRow>
        <IonRow id="reportModalContent">
          {selectedReport.reported_user ? (
            <ReportDisplay reportData={selectedReport.reported_user} />
          ) : (
            selectedReport.reported_pin && <ReportDisplay reportData={selectedReport.reported_pin} />
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
    </Modal>
  )
}

export default ReportActionModal