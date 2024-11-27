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
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/ProviderContext";
import useRequestData from "../../hooks/useRequestData";
import handleDeleteAccount from "../../hooks/useDeleteAccount";
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
  const { userID } = useAuth();
  const { makeRequest, error } = useRequestData();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (data.status === "warning") {
      makeRequest(`users/seen/${userID}`);
    }
  }, []);

  if (error) {
    console.error("Failed to update user status");
  }

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
