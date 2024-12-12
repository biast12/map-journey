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
import handleDeleteAccount from "../../utils/handleDeleteAccount";
import "./WarningModal.scss";

interface WarningModalProps {
  userData: UserData;
  closeWarningModal: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  userData,
  closeWarningModal,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { clearUserDataToken } = useAuth();
  const { makeRequest } = useRequestData();
  const { makeRequest: deleteMakeRequest } = useRequestData();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userData.status === "warning") {
      makeRequest(`reports/seen/${userData.id}`, 'POST');
    }
  }, []);

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle className="warning-modal-title">
          {userData.status === "banned"
            ? t("modals.warning.card_title_banned")
            : t("modals.warning.card_title")}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="warning-modal-content">
        <p>
          {userData.status === "warning"
            ? t("modals.warning.warning")
            : userData.status === "reported"
            ? t("modals.warning.reported")
            : userData.status === "banned"
            ? t("modals.warning.banned")
            : null}
        </p>
        <p>{t("modals.warning.support")}</p>
      </IonCardContent>
      {userData.status === "banned" ? (
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
              role: "cancel",
              handler: () => {
                setShowDeleteModal(false);
              },
            },
            {
              text: t("modals.warning.delete.header"),
              handler: () => {
                handleDeleteAccount({
                  userID: userData.id!,
                  makeRequest: deleteMakeRequest,
                  clearUserDataToken,
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
