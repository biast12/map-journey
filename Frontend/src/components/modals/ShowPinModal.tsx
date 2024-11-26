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
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/ProviderContext";

import "./ShowPinModal.scss";

/* Modal */
import ReportModal from "./ReportModal";

interface ShowPinModalProps {
  pinData: any;
}

const ShowPinModal: React.FC<ShowPinModalProps> = ({ pinData }) => {
  if (!pinData) return null;
  const { t } = useTranslation();
  const { userID } = useAuth();
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
          <img alt={t("modals.pin.img_alt")} src={pinData.profile.avatar} />
          <p>{pinData.profile.name}</p>
          <IonButton>{t("modals.pin.add")}</IonButton>
        </div>
      </IonCardContent>
      {!(userID == pinData.profile.id) && (
        <div id="showPinCardButtons">
        <IonButton disabled={pinData.reported} onClick={openReportModal}>
          {t("modals.pin.report")}
        </IonButton>
      </div>
      )}
      
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
