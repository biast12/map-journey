import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonModal,
} from "@ionic/react";
import { useState } from "react";
import "./ShowPinModal.scss";

/* Modal */
import ReportModal from "../modals/ReportModal";

interface ShowPinModalProps {
  pinData: any;
}

const ShowPinModal: React.FC<ShowPinModalProps> = ({ pinData }) => {
  if (!pinData) return null;
  const [reportModal, setReportModal] = useState(false);
  const openReportModal = () => setReportModal(true);
  const closeReportModal = () => setReportModal(false);

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{pinData.title}</IonCardTitle>
        <div>
          <img alt={pinData.description} src={pinData.imgurls} />
        </div>
        <IonCardSubtitle>{pinData.location}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <p>{pinData.description}</p>
        <div>
          <img alt="User avatar" src={pinData.profile.avatar} />
          <p>{pinData.profile.name}</p>
          <IonButton>Add</IonButton>
        </div>
      </IonCardContent>
      <div id="showPinCardButtons">
        <IonButton disabled={pinData.reported} onClick={openReportModal}>
          Report pin
        </IonButton>
      </div>
      <IonModal isOpen={reportModal} onDidDismiss={closeReportModal}>
        <div className="modal-content">
          <ReportModal
            closeReportModal={closeReportModal}
            reported_id={pinData.id}
            reportedType="pin"
          />
        </div>
      </IonModal>
    </IonCard>
  );
};

export default ShowPinModal;
