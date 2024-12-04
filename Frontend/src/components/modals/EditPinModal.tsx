import React from 'react'
import { IonButton, IonCol, IonGrid, IonRow } from '@ionic/react'

import Modal from '../Modal'

import "./EditPinModal.scss"

interface EditPinModalProps {
  selectedPin: any
  showModal: boolean
  setShowModal: (value: boolean) => void
  setShowAlert: (value: boolean) => void
}

const EditPinModal: React.FC<EditPinModalProps> = ({ selectedPin, showModal, setShowModal, setShowAlert }) => {
  return (
    <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
      <IonGrid id="pinModalGrid">
        <IonRow>
          <IonCol id="pinModalTop" size="12">
            <p>Id: {selectedPin.id}</p>
            <p>Date: {new Date(selectedPin.date).toUTCString()}</p>
          </IonCol>
        </IonRow>
        <IonRow id="pinModalContent">
          <section>
            <h4>{selectedPin.title}</h4>
            <figure>
              <img src={selectedPin.imgurls} alt="" />
              <p>{selectedPin.location}</p>
            </figure>
            <p className="descriptionText">{selectedPin.description}</p>
          </section>
          <hr />
          <div>
            <section className="avatarSection">
              <figure>
                <img src={selectedPin.profile.avatar} alt="" />
              </figure>
            </section>
            <section>
              <p>{selectedPin.profile.name}</p>
              <p className="smallText">Id: {selectedPin.profile.id}</p>
            </section>
          </div>
        </IonRow>
        <IonRow id="pinButtonsRow">
          <IonCol size="4" className="pinButtons">
            <IonButton color={"danger"} onClick={() => setShowAlert(true)}>
              Delete
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </Modal>
  )
}

export default EditPinModal