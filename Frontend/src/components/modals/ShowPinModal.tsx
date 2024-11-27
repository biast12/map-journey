import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonModal,
  IonIcon,
} from "@ionic/react";
import { Clipboard } from "@ionic-native/clipboard";
import { shareSocialOutline } from "ionicons/icons";
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
  const { userID, role } = useAuth();
  const [reportModal, setReportModal] = useState(false);
  const openReportModal = () => setReportModal(true);
  const closeReportModal = () => setReportModal(false);

  const copySharedLink = async () => {
    const domain = "localhost:8100";
    const url = `${domain}/globalmap?pin=${pinData.id}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        role === "admin" && console.log("Link copied to clipboard");
      } catch (err) {
        console.error("Error copying link to clipboard", err);
      }
    } else {
      Clipboard.copy(url)
        .then(() => {
          role === "admin" && console.log("Link copied to clipboard");
        })
        .catch((err) => {
          console.error("Error copying link to clipboard", err);
        });
    }
  };

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
          <IonButton onClick={copySharedLink}>
            <IonIcon icon={shareSocialOutline} />
          </IonButton>
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
