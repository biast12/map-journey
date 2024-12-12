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
import { shareSocialOutline, logoGoogle } from "ionicons/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/ProviderContext";

import "./ShowPinModal.scss";

/* Components */
import Toast, { showToastMessage } from "../Toast";
import ReportModal from "./ReportModal";

interface ShowPinModalProps {
  pinData: any;
}

const ShowPinModal: React.FC<ShowPinModalProps> = ({ pinData }) => {
  if (!pinData) return null;
  const { t } = useTranslation();
  const { userID, userData } = useAuth();
  const [reportPinModal, setReportPinModal] = useState(false);
  const openReportPinModal = () => setReportPinModal(true);
  const closeReportPinModal = () => setReportPinModal(false);
  const [reportUserModal, setReportUserModal] = useState(false);
  const openReportUserModal = () => setReportUserModal(true);
  const closeReportUserModal = () => setReportUserModal(false);

  const openGoogleCoordinates = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${pinData.latitude},${pinData.longitude}`;

    if (navigator.userAgent.match(/(Android)/)) {
      // Open in Google Maps app on mobile devices
      window.location.href = `geo:${pinData.latitude},${pinData.longitude}?q=${pinData.latitude},${pinData.longitude}`;
    } else {
      // Open in a new window on desktop
      window.open(url, "_blank");
    }
  };

  const copySharedLink = async () => {
    const domain = "https://map-journey.com";
    const url = `${domain}/globalmap?pin=${pinData.id}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        showToastMessage(t("modals.pin.link_copied"), "success");
      } catch (err) {
        showToastMessage(t("modals.pin.error_copying_link"), "error");
        console.error("Error copying link to clipboard", err);
      }
    } else {
      Clipboard.copy(url)
        .then(() => {
          showToastMessage(t("modals.pin.link_copied"), "success");
        })
        .catch((err) => {
          showToastMessage(t("modals.pin.error_copying_link"), "error");
          console.error("Error copying link to clipboard", err);
        });
    }
  };

  return (
    <IonCard>
      <Toast />
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
          <IonButton onClick={openGoogleCoordinates}>
            <IonIcon icon={logoGoogle} />
          </IonButton>
          <IonButton onClick={copySharedLink}>
            <IonIcon icon={shareSocialOutline} />
          </IonButton>
        </div>
        {userData?.role === "admin" && (
          <>
            <p>Pin ID: {pinData.id}</p>
            <p>User ID: {pinData.profile.id}</p>
          </>
        )}
      </IonCardContent>
      {!(userID == pinData.profile.id) && (
        <div id="showPinCardButtons">
          <IonButton disabled={pinData.reported} onClick={openReportUserModal}>
            {t("modals.pin.report_user")}
          </IonButton>
          <IonButton disabled={pinData.reported} onClick={openReportPinModal}>
            {t("modals.pin.report_pin")}
          </IonButton>
        </div>
      )}
      <IonModal isOpen={reportUserModal} onDidDismiss={closeReportUserModal}>
        <div className="modal-content">
          <ReportModal
            closeReportModal={closeReportUserModal}
            reported_id={pinData.profile.id}
            reportedType="user"
          />
        </div>
      </IonModal>
      <IonModal isOpen={reportPinModal} onDidDismiss={closeReportPinModal}>
        <div className="modal-content">
          <ReportModal
            closeReportModal={closeReportPinModal}
            reported_id={pinData.id}
            reportedType="pin"
          />
        </div>
      </IonModal>
    </IonCard>
  );
};

export default ShowPinModal;
