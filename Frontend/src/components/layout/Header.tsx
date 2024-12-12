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

/* Hooks */
import { useAuth } from "../../hooks/ProviderContext";

/* Components */
import WarningModal from "../modals/WarningModal";

interface HeaderProps {
  userData: UserData
  openNotificationModal: () => void;
}

let getNewNotifications: () => string[] | null;

const Header: React.FC<HeaderProps> = ({ userData, openNotificationModal }) => {
  const { loading } = useAuth();
  const [hasWarningModalOpened, setHasWarningModalOpened] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const openWarningModal = () => setShowWarningModal(true);
  const closeWarningModal = () => setShowWarningModal(false);

  useEffect(() => {
    if (
      userData &&
      (userData.status === "warning" ||
        userData.status === "reported" ||
        userData.status === "banned") &&
      !loading &&
      !hasWarningModalOpened
    ) {
      openWarningModal();
      setHasWarningModalOpened(true);
    }
  }, [userData]);

  const handleOpenNotificationModal = () => {
    if (userData) {
      userData.news_count = 0;
      openNotificationModal();
    }
  };

  getNewNotifications = () => {
    return userData && userData.new_notifications ? userData.new_notifications : null;
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButton routerLink="/globalmap" fill="clear">
            <IonImg src="/icons/logo.webp" alt="Logo" />
          </IonButton>
          <div className="IonButtonContainer">
            {userData.settings.notification && (
              <IonButton fill="clear" onClick={handleOpenNotificationModal}>
                <IonIcon aria-hidden="true" icon={notifications} />
                {userData.news_count >= 1 && (
                  <IonBadge color="danger">{userData.news_count}</IonBadge>
                )}
              </IonButton>
            )}
            {userData.role === "admin" && (
              <IonButton routerLink="/admin" fill="clear">
                <IonIcon aria-hidden="true" icon={shieldHalf} />
              </IonButton>
            )}
            <IonButton routerLink="/settings" fill="clear">
              <IonIcon aria-hidden="true" icon={settings} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonModal isOpen={showWarningModal} backdropDismiss={false}>
        <div className="modal-content">
          <WarningModal userData={userData} closeWarningModal={closeWarningModal} />
        </div>
      </IonModal>
    </>
  );
};

export { getNewNotifications };
export default Header;
