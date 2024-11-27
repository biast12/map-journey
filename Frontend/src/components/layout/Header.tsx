import { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonImg,
  IonIcon,
  IonBadge,
  IonModal,
} from "@ionic/react";
import { notifications, settings, shieldHalf } from "ionicons/icons";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import { useAuth } from "../../hooks/ProviderContext";

/* Components */
import WarningModal from "../modals/WarningModal";
import Loader from "../Loader";
import Error from "../Error";

interface HeaderProps {
  openNotificationModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  openNotificationModal,
}) => {
  const { t } = useTranslation();
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID, role, loading } = useAuth();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [hasWarningModalOpened, setHasWarningModalOpened] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const openWarningModal = () => setShowWarningModal(true);
  const closeWarningModal = () => setShowWarningModal(false);

  useEffect(() => {
    if (userID && !loading) {
      makeRequest(`users/${userID}`);
    }
  }, [userID, loading, isNotificationModalOpen]);

  useEffect(() => {
    if (
      data &&
      (data.status === "warning" ||
        data.status === "reported" ||
        data.status === "banned") &&
      !loading &&
      !hasWarningModalOpened
    ) {
      openWarningModal();
      setHasWarningModalOpened(true);
    }
  }, [data, isLoading, hasWarningModalOpened]);

  const handleOpenNotificationModal = () => {
    setIsNotificationModalOpen(true);
    openNotificationModal();
  };

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && (
        <Error message={t("header.error_page_message")} />
      )}
      <IonHeader>
        <IonToolbar>
          <IonButton routerLink="/" fill="clear">
            <IonImg src="/icons/webp/logo1.webp" alt="Logo" />
          </IonButton>
          <div className="IonButtonContainer">
            <IonButton fill="clear" onClick={handleOpenNotificationModal}>
              <IonIcon aria-hidden="true" icon={notifications} />
              {data && data.news_count >= 1 && (
                <IonBadge color="danger">{data.news_count}</IonBadge>
              )}
            </IonButton>
            {role === "admin" && (
              <IonButton routerLink="/admin" fill="clear">
                <IonIcon aria-hidden="true" icon={shieldHalf} />
              </IonButton>
            )}
            {userID && (
              <IonButton routerLink="/settings" fill="clear">
                <IonIcon aria-hidden="true" icon={settings} />
              </IonButton>
            )}
          </div>
        </IonToolbar>
      </IonHeader>
      <IonModal isOpen={showWarningModal} backdropDismiss={false}>
        <div className="modal-content">
          <WarningModal data={data} closeWarningModal={closeWarningModal} />
        </div>
      </IonModal>
    </>
  );
};

export default Header;
