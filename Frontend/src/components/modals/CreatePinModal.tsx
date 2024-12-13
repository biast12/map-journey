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
  IonCheckbox,
} from "@ionic/react";
import { camera, locationSharp } from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import useRequestData from "../../hooks/useRequestData";
import useImageHandler from "../../hooks/useImageHandler";
import profanityFilter from "../../utils/profanityFilter";
import Toast, { showToastMessage } from "../Toast";
import Loader from "../Loader";

interface CreatePinModalProps {
  userData: UserData;
  onClose: () => void;
}

const CreatePinModal: React.FC<CreatePinModalProps> = ({ userData, onClose }) => {
  const { t } = useTranslation();

  /* States */
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<Coordinate | null>(null);
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<boolean>(userData.status === "public");
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
  const { photoUrl, loading, takePhoto, handleUpload } = useImageHandler();

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

    try {
      const { publicUrl } = await handleUpload();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location.address);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lon);
      formData.append("imgurls", publicUrl);
      formData.append("status", status.toString());
      userData.role === "admin" && console.log("formData:", formData);

      await makeRequest(`pins/${userData.id}`, "POST", undefined, formData);
      onClose();
      showToastMessage(t("modals.create_pin.successful"), "success");
      setIsSubmitting(false);
    } catch (error) {
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
      await new Promise((resolve) => setTimeout(resolve, 1001));
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
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const coordinates = fromLonLat([longitude, latitude]);
      const address = latitude.toString() + " " + longitude.toString();
      setCoordinates(coordinates);
      setLocation({ address, lat: latitude, lon: longitude });
      console.error("Error getting location:", error);
    }
  };

  useEffect(() => {
    getLocation(true);
  }, []);

  return (
    <IonCard className="create-pin">
      {loading && <Loader />}
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
        <p>
          {t("modals.create_pin.location")}: {location?.address}
        </p>
        <IonButton
          ref={locationButton}
          aria-label="Location"
          id="locationButton"
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
        <IonCheckbox
          checked={status}
          onIonChange={() => setStatus(!status)}
        >
          {t("modals.create_pin.public")}:
        </IonCheckbox>
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
