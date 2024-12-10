import React, { FormEvent, MouseEvent, useRef, useState } from "react";
import { IonAlert, IonButton, IonCol, IonGrid, IonIcon, IonImg, IonInput, IonRow, IonTextarea } from "@ionic/react";

import Modal from "../Modal";

import "./EditPinModal.scss";
import useImageHandler from "../../hooks/useImageHandler";
import { camera } from "ionicons/icons";
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

interface EditPinModalProps {
  pinData: PinData;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  onDelete: (isSuccess: boolean) => void;
  onEdit: (isSuccess: boolean) => void;
}

const EditPinModal: React.FC<EditPinModalProps> = ({ pinData, showModal, setShowModal, onDelete, onEdit }) => {
  const { makeRequest: delMakeRequest, isLoading: delIsLoading } = useRequestData();
  const { makeRequest: editMakeRequest, isLoading: editIsLoading } = useRequestData();
  const { photoUrl, takePhoto, handleUpload } = useImageHandler();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showEditAlert, setShowEditAlert] = useState<boolean>(false);

  const cameraButton = useRef<HTMLIonButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { userID } = useAuth();

  async function handleDeletePin() {
    try {
      await delMakeRequest(`pins/${pinData.id}/${userID}`, "DELETE");

      onDelete(true);
    } catch (error) {
      onDelete(false);
    }
  }

  async function handleEditPin() {
    console.log("RUNS");
    const form = formRef.current as HTMLFormElement;

    const body: { imgurls: string | undefined; title: string; description: string; status: boolean } = {
      imgurls: undefined,
      title: form.pinTitle.value,
      description: form.pinDescription.value,
      status: form.status.value == "public" ? true : false,
    };

    if (photoUrl) {
      const { fileName: imageName, publicUrl } = await handleUpload();
      body.imgurls = publicUrl;
    }

    try {
      await editMakeRequest(`pins/${userID}/${pinData.id}`, "PUT", undefined, body);

      onEdit(true);
    } catch {
      onEdit(false);
    }
  }

  return (
    <>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={["Cancel", { text: "Confirm", handler: handleDeletePin }]}
      />
      <IonAlert
        isOpen={showEditAlert}
        onDidDismiss={() => setShowEditAlert(false)}
        header="Are you sure?"
        message="Editing is a permanent action!"
        buttons={["Cancel", { text: "Confirm", handler: handleEditPin }]}
      />
      <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
        <IonGrid id="pinModalGrid">
          <IonRow>
            <IonCol id="pinModalTop" size="12">
              <p>Id: {pinData.id}</p>
              <p>Date: {new Date(pinData.date).toUTCString()}</p>
            </IonCol>
          </IonRow>
          <IonRow id="pinModalContent">
            <section>
              <form ref={formRef}>
                <IonInput name="pinTitle" placeholder={pinData.title} defaultValue={pinData.title} />
                <figure>
                  <IonImg src={photoUrl || pinData.imgurls} alt="User Photo" />
                  <p>{pinData.location}</p>
                </figure>
                <div className="add-image-button">
                  <IonButton
                    ref={cameraButton}
                    size="large"
                    className="fade-in"
                    aria-label="Take Photo"
                    onClick={takePhoto}
                  >
                    <IonIcon icon={camera} aria-hidden="true" />
                  </IonButton>
                </div>
                <IonTextarea
                  name="pinDescription"
                  placeholder={pinData.description}
                  className="descriptionText"
                  
                ></IonTextarea>
                <select defaultValue={pinData.status} name="status" title="Status">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </form>
            </section>
            <hr />
            <div>
              <section className="avatarSection">
                <figure>
                  <img src={pinData.profile.avatar} alt="" />
                </figure>
              </section>
              <section>
                <p>{pinData.profile.name}</p>
                <p className="smallText">Id: {pinData.profile.id}</p>
              </section>
            </div>
          </IonRow>
          <IonRow id="pinButtonsRow">
            <IonCol size="4" className="pinButtons">
              <IonButton color={"warning"} onClick={() => setShowEditAlert(true)}>
                Edit
              </IonButton>
            </IonCol>
            <IonCol size="4" className="pinButtons">
              <IonButton color={"danger"} onClick={() => setShowAlert(true)}>
                Delete
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </Modal>
    </>
  );
};

export default EditPinModal;
