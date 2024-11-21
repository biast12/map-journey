import { IonModal, IonButton, IonIcon } from "@ionic/react";
import { close } from "ionicons/icons";
import "./Modals.scss";

import useAuth from "../hooks/ProviderContext";

/* Modals */
import LoginModal from "./modals/LoginModal";
import CreatePinModal from "./modals/CreatePinModal";
import NotificationModal from "./modals/NotificationModal";

interface ModalsProps {
  showLoginModal: boolean;
  closeLoginModal: () => void;
  createPinModal: boolean;
  closeCreatePinModal: () => void;
  showNotificationModal: boolean;
  closeNotificationModal: () => void;
}

const Modals: React.FC<ModalsProps> = ({
  showLoginModal,
  closeLoginModal,
  createPinModal,
  closeCreatePinModal,
  showNotificationModal,
  closeNotificationModal,
}) => {
  const { userID, loading } = useAuth();
  return (
    <>
      <IonModal
        isOpen={showLoginModal}
        onDidDismiss={closeLoginModal}
        backdropDismiss={!!userID}
      >
        <div className="modal-content">
          <LoginModal closeLoginModal={closeLoginModal} />
        </div>
      </IonModal>
      <IonModal isOpen={createPinModal} onDidDismiss={closeCreatePinModal}>
        <div className="modal-content">
          <IonButton
            className="close-button"
            onClick={closeCreatePinModal}
            fill="clear"
          >
            <IonIcon icon={close} />
          </IonButton>
          <CreatePinModal onClose={closeCreatePinModal} />
        </div>
      </IonModal>
      <IonModal
        isOpen={showNotificationModal}
        onDidDismiss={closeNotificationModal}
      >
        <div className="modal-content">
          <IonButton
            className="close-button"
            onClick={closeNotificationModal}
            fill="clear"
          >
            <IonIcon icon={close} />
          </IonButton>
          <NotificationModal />
        </div>
      </IonModal>
    </>
  );
};

export default Modals;
