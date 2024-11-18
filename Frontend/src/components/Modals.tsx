import { IonModal, IonButton, IonIcon } from "@ionic/react";
import { close } from "ionicons/icons";
import "./Modals.scss";

import useAuth from "../hooks/ProviderContext";

/* Modals */
import LoginModal from "../modals/LoginModal";
import MakePinModal from "../modals/MakePinModal";
import NotificationModal from "../modals/NotificationModal";
import Modal from "./Modal";

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
  const { userID, loading } = useAuth();
  return (
    <>
    <Modal isOpen={showLoginModal} onCloseModal={closeLoginModal} backdropDismiss={false} hideCloseButton={!userID}>
      <LoginModal closeLoginModal={closeLoginModal} />
    </Modal>
    <Modal isOpen={makePinModal} onCloseModal={closeMakePinModal}>
      <MakePinModal />
    </Modal>
    <Modal isOpen={showNotificationModal} onCloseModal={closeNotificationModal}>
      <NotificationModal />
    </Modal>
    </>
  );
};

export default Modals;
