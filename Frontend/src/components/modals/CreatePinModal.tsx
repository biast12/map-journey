import "./CreatePinModal.scss";
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonToggle,
} from "@ionic/react";
import { camera, locationSharp } from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import useImageHandler from "../../hooks/useImageHandler";
import profanityFilter from "../../utils/profanityFilter";
import Toast, { showToastMessage } from "../Toast";

interface CreatePinModalProps {
  onClose: () => void;
}

const CreatePinModal: React.FC<CreatePinModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  /* States */
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<Coordinate | null>(null);
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* Refs */
  const confirmButton = useRef<HTMLIonButtonElement>(null);
  const cancelButton = useRef<HTMLIonButtonElement>(null);
  const titleInput = useRef<HTMLIonInputElement>(null);
  const descriptionInput = useRef<HTMLIonInputElement>(null);
  const cameraButton = useRef<HTMLIonButtonElement>(null);
  const locationButton = useRef<HTMLIonButtonElement>(null);

  /* Hooks */
  const { makeRequest } = useRequestData();
  const { userID, role } = useAuth();
  const { photoUrl, takePhoto, handleUpload } = useImageHandler();

  useEffect(() => {
    const refs = [
      titleInput,
      descriptionInput,
      cameraButton,
      locationButton,
      confirmButton,
      cancelButton,
    ];

    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.disabled = isSubmitting;
      }
    });
  }, [isSubmitting]);

  const handleConfirm = async () => {
    if (!title || !photoUrl || !description || !location || !coordinates) {
      showToastMessage(t("required_fields"));
      return;
    }

    if (profanityFilter(title) || profanityFilter(description)) {
      showToastMessage(t("profanityFilter"), "warning");
      return;
    }

    setIsSubmitting(true);

    let fileName = "";

    try {
      const { fileName: imageName, publicUrl } = await handleUpload();
      fileName = imageName;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location.address);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lon);
      formData.append("imgurls", publicUrl);
      formData.append("status", status.toString());
      role === "admin" && console.log("formData:", formData);

      await makeRequest(`pins/${userID}`, "POST", undefined, formData);
      onClose();
      showToastMessage(t("modals.create_pin.successful"), "success");
      setIsSubmitting(false);
    } catch (error) {
      await removeImage(fileName);
      showToastMessage(t("modals.create_pin.error_message"), "error");
    }
  };

  const updateTitle = (event: any) => setTitle(event.detail.value);
  const updateDescription = (event: any) => setDescription(event.detail.value);

  const getLocation = async (useCurrentLocation: boolean = true) => {
    if (!useCurrentLocation) return;
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const coordinates = fromLonLat([longitude, latitude]);
      const locationResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse.php?lat=${latitude}&lon=${longitude}&format=jsonv2`
      );
      const locationData = await locationResponse.json();
      const address = [
        locationData.address.road,
        locationData.address.house_number,
        locationData.address.city,
        locationData.address.town,
        locationData.address.postcode,
        locationData.address.state,
        locationData.address.country,
      ]
        .filter(Boolean)
        .join(", ");
      setCoordinates(coordinates);
      setLocation({ address, lat: latitude, lon: longitude });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  useEffect(() => {
    getLocation(true);
  }, []);

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t("modals.create_pin.card_title")}</IonCardTitle>
      </IonCardHeader>
      <IonItem>
        <IonInput
          required
          ref={titleInput}
          onIonChange={updateTitle}
          label={`${t("modals.create_pin.title")}:`}
          placeholder={t("modals.create_pin.title_placeholder")}
        />
      </IonItem>
      <IonImg
        src={
          photoUrl || "https://ionicframework.com/docs/img/demos/card-media.png"
        }
        alt="User Photo"
      />
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
      <IonItem>
        <IonInput
          disabled
          required
          value={location?.address}
          label={`${t("modals.create_pin.location")}:`}
        />
        <IonButton
          ref={locationButton}
          aria-label="Location"
          onClick={() => getLocation(true)}
        >
          <IonIcon icon={locationSharp} />
        </IonButton>
      </IonItem>
      <IonItem>
        <IonInput
          required
          ref={descriptionInput}
          onIonChange={updateDescription}
          label={`${t("modals.create_pin.description")}:`}
          placeholder={t("modals.create_pin.description_placeholder")}
        />
      </IonItem>
      <IonItem>
        <IonToggle
          checked={status}
          enableOnOffLabels={true}
          onIonChange={(e) => setStatus(e.detail.checked)}
        >
          {status
            ? t("modals.create_pin.public")
            : t("modals.create_pin.private")}:
        </IonToggle>
      </IonItem>
      <div id="confirmButton">
        <IonButton onClick={handleConfirm} ref={confirmButton}>
          {t("modals.create_pin.submit")}
        </IonButton>
      </div>
      <Toast />
    </IonCard>
  );
};

export default CreatePinModal;
