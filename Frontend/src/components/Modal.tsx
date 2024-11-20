import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { close } from "ionicons/icons";
import React from "react";

import "./Modal.scss"

type ModalProps = {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onCloseModal: () => void;
  backdropDismiss?: boolean;
  hideCloseButton?: boolean;
};

const Modal = ({ id, className, children, isOpen = false, onCloseModal, backdropDismiss = true, hideCloseButton }: ModalProps) => {
  return (
    <IonModal id={id} className={className} isOpen={isOpen} onDidDismiss={onCloseModal} backdropDismiss={backdropDismiss}>
      <div className="modal-content">
        {!hideCloseButton && (
          <IonButton className="close-button" onClick={onCloseModal} fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        )}

        {children}
      </div>
    </IonModal>
  );
};

export default Modal;
