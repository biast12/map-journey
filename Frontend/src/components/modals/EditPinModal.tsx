import React, {
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IonAlert,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonInput,
  IonRow,
  IonTextarea,
} from "@ionic/react";

import Modal from "../Modal";

import "./EditPinModal.scss";
import useImageHandler from "../../hooks/useImageHandler";
import { camera } from "ionicons/icons";
import useRequestData from "../../hooks/useRequestData";
import Loader from "../Loader";

type EditPinModalProps = {
  userData: UserData;
  pinData: PinData;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  onDelete: (isSuccess: boolean) => void;
  onEdit: (isSuccess: boolean) => void;
};

type FormValues = {
  title: string;
  description: string;
  status: string;
};

const EditPinModal: React.FC<EditPinModalProps> = ({
  userData,
  pinData,
  showModal,
  setShowModal,
  onDelete,
  onEdit,
}) => {
  const { makeRequest: delMakeRequest, isLoading: delIsLoading } =
    useRequestData();
  const { makeRequest: editMakeRequest, isLoading: editIsLoading } =
    useRequestData();
  const { photoUrl, takePhoto, handleUpload } = useImageHandler();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showEditAlert, setShowEditAlert] = useState<boolean>(false);
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [debounce, setDebounce] = useState<boolean>(false);

  const [formValues, setFormValues] = useState<FormValues>({
    title: pinData.title,
    description: pinData.description,
    status: pinData.status,
  });

  const cameraButton = useRef<HTMLIonButtonElement>(null);

  function checkForChanges() {
    if (
      photoUrl === "" &&
      formValues.title === pinData.title &&
      formValues.description === pinData.description &&
      formValues.status === pinData.status
    ) {
      setChangesMade(false);
      return;
    }
    setChangesMade(true);
  }

  async function handleDeletePin() {
    if (debounce) return;
    setDebounce(true);
    setShowAlert(false);

    try {
      await delMakeRequest(`pins/${pinData.id}/${userData.id}`, "DELETE");

      onDelete(true);
    } catch (error) {
      onDelete(false);
    }
    setDebounce(false);
  }

  async function handleEditPin() {
    if (debounce) return;
    setDebounce(true);
    setShowEditAlert(false);

    const body: {
      imgurls: string | undefined;
      title: string;
      description: string;
      status: boolean;
    } = {
      imgurls: undefined,
      title: formValues.title,
      description: formValues.description,
      status: formValues.status == "public" ? true : false,
    };

    if (photoUrl) {
      const { publicUrl } = await handleUpload();
      body.imgurls = publicUrl;
    }

    try {
      await editMakeRequest(
        `pins/${pinData.id}/${userData.id}`,
        "PUT",
        undefined,
        body
      );

      onEdit(true);
    } catch {
      onEdit(false);
    }

    setDebounce(false);
  }

  useEffect(checkForChanges, [photoUrl, formValues]);
  useEffect(() => {
    setFormValues({
      title: pinData.title,
      description: pinData.description,
      status: pinData.status,
    });
  }, [showModal]);

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
        {(editIsLoading || delIsLoading) && <Loader />}
        <IonGrid id="pinModalGrid">
          <IonRow>
            <IonCol id="pinModalTop" size="12">
              <p>Id: {pinData.id}</p>
              <p>Date: {new Date(pinData.date).toUTCString()}</p>
            </IonCol>
          </IonRow>
          <IonRow id="pinModalContent">
            <section>
              <form>
                <IonInput
                  name="pinTitle"
                  placeholder={pinData.title}
                  value={formValues.title}
                  onIonInput={(e) =>
                    setFormValues({
                      ...formValues,
                      title: String(e.target.value!),
                    })
                  }
                />
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
                  fill="solid"
                  placeholder={pinData.description}
                  value={formValues.description}
                  className="descriptionText"
                  onIonInput={(e) =>
                    setFormValues({
                      ...formValues,
                      description: e.target.value!,
                    })
                  }
                />
                <select
                  onChange={(e) =>
                    setFormValues({ ...formValues, status: e.target.value! })
                  }
                  defaultValue={pinData.status}
                  name="status"
                  title="Status"
                >
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
              <IonButton
                disabled={debounce || !changesMade}
                color={"warning"}
                onClick={() => setShowEditAlert(true)}
              >
                Edit
              </IonButton>
            </IonCol>
            <IonCol size="4" className="pinButtons">
              <IonButton
                disabled={debounce}
                color={"danger"}
                onClick={() => setShowAlert(true)}
              >
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
