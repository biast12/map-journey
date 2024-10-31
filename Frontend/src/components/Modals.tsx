import { IonModal, IonButton, IonIcon } from "@ionic/react";
import { close } from "ionicons/icons";
import "./Modals.scss";

/* Modals */
import LoginModal from "../modals/LoginModal";
import MakePinModal from "../modals/MakePinModal";
import NotificationModal from "../modals/NotificationModal";

interface ModalsProps {
  showLoginModal: boolean;
  closeLoginModal: () => void;
  makePinModal: boolean;
  closeMakePinModal: () => void;
  showNotificationModal: boolean;
  closeNotificationModal: () => void;
}

const Modals: React.FC<ModalsProps> = ({
  showLoginModal,
  closeLoginModal,
  makePinModal,
  closeMakePinModal,
  showNotificationModal,
  closeNotificationModal,
}) => {
  return (
    <>
      <IonModal isOpen={showLoginModal} onDidDismiss={closeLoginModal}>
        <div className="modal-content">
          <IonButton
            className="close-button"
            onClick={closeLoginModal}
            fill="clear"
          >
            <IonIcon icon={close} />
          </IonButton>
          <LoginModal />
        </div>
      </IonModal>
      <IonModal isOpen={makePinModal} onDidDismiss={closeMakePinModal}>
        <div className="modal-content">
          <IonButton
            className="close-button"
            onClick={closeMakePinModal}
            fill="clear"
          >
            <IonIcon icon={close} />
          </IonButton>
          <MakePinModal />
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
