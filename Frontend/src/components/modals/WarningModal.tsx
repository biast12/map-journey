import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonAlert,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/ProviderContext";
import useRequestData from "../../hooks/useRequestData";
import useImageHandler from "../../hooks/useImageHandler";
import handleDeleteAccount from "../../utils/handleDeleteAccount";
import "./WarningModal.scss";

interface WarningModalProps {
  data: {
    status: string;
    id: string;
    avatar: string;
  };
  closeWarningModal: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  data,
  closeWarningModal,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { userID, clearAuthToken, clearRoleToken } = useAuth();
  const { makeRequest } = useRequestData();
  const { makeRequest: deleteMakeRequest } = useRequestData();
  const { removeImage } = useImageHandler();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (data.status === "warning") {
      makeRequest(`reports/seen/${userID}`, 'POST');
    }
  }, []);

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle className="warning-modal-title">
          {data.status === "banned"
            ? t("modals.warning.card_title_banned")
            : t("modals.warning.card_title")}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="warning-modal-content">
        <p>
          {data.status === "warning"
            ? t("modals.warning.warning")
            : data.status === "reported"
            ? t("modals.warning.reported")
            : data.status === "banned"
            ? t("modals.warning.banned")
            : null}
        </p>
        <p>{t("modals.warning.support")}</p>
      </IonCardContent>
      {data.status === "banned" ? (
        <IonButton
          className="ion-button"
          color="danger"
          onClick={() => setShowDeleteModal(true)}
        >
          <IonIcon icon={trashOutline}></IonIcon>
          {t("modals.warning.delete.header")}
        </IonButton>
      ) : (
        <IonButton
          className="ion-button"
          color="medium"
          onClick={closeWarningModal}
        >
          {t("modals.warning.close")}
        </IonButton>
      )}
      <IonModal
        isOpen={showDeleteModal}
        onDidDismiss={() => setShowDeleteModal(false)}
      >
        <IonAlert
          isOpen={showDeleteModal}
          onDidDismiss={() => setShowDeleteModal(false)}
          header={t("modals.warning.delete.header")}
          message={t("modals.warning.delete.message")}
          buttons={[
            {
              text: t("modals.warning.delete.cancel"),
              role: t("modals.warning.delete.cancel").toLocaleLowerCase(),
              handler: () => {
                setShowDeleteModal(false);
              },
            },
            {
              text: t("modals.warning.delete.header"),
              handler: () => {
                handleDeleteAccount({
                  data: { id: data.id, avatar: data.avatar },
                  makeRequest: deleteMakeRequest,
                  removeImage,
                  clearAuthToken,
                  clearRoleToken,
                  history,
                });
              },
            },
          ]}
        />
      </IonModal>
    </IonCard>
  );
};

export default WarningModal;
