import "./MakePinModal.scss";
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonTextarea,
  IonToggle,
} from "@ionic/react";
import { camera, locationSharp } from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { useEffect, useState, useRef } from "react";
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";
import useImageHandler from "../hooks/useImageHandler";

interface MakePinModalProps {
  onClose: () => void;
}

const MakePinModal: React.FC<MakePinModalProps> = ({ onClose }) => {
  /* States */
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<Coordinate | null>(null);
  const [comment, setComment] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* Refs */
  const confirmButton = useRef<HTMLIonButtonElement>(null);
  const cancelButton = useRef<HTMLIonButtonElement>(null);
  const titleInput = useRef<HTMLIonInputElement>(null);
  const commentInput = useRef<HTMLIonTextareaElement>(null);
  const cameraButton = useRef<HTMLIonButtonElement>(null);
  const locationButton = useRef<HTMLIonButtonElement>(null);

  /* Hooks */
  const { makeRequest } = useRequestData();
  const { userID } = useAuth();
  const { photoUrl, takePhoto, handleUpload, removeImage } = useImageHandler();

  useEffect(() => {
    const refs = [
      titleInput,
      commentInput,
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
    if (!title || !photoUrl || !comment || !location || !coordinates) {
      console.error("All fields are required");
      return;
    }

    setIsSubmitting(true);

    let fileName = "";

    try {
      const { fileName: imageName, publicUrl } = await handleUpload();
      fileName = imageName;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", comment);
      formData.append("location", location.address);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lon);
      formData.append("imgurls", publicUrl);
      formData.append("status", status.toString());

      await makeRequest(`pins/${userID}`, "POST", undefined, formData);
      onClose();
    } catch (error) {
      await removeImage(fileName);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTitle = (event: any) => setTitle(event.detail.value);
  const updateComment = (event: any) => setComment(event.detail.value);

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
        <IonCardTitle>Map your Journey</IonCardTitle>
      </IonCardHeader>
      <IonItem>
        <IonInput
          onIonChange={updateTitle}
          ref={titleInput}
          label="Title:"
          placeholder="Your title here"
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
          value={location?.address}
          label="Location:"
          placeholder="Input address here"
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
        <IonTextarea
          ref={commentInput}
          onIonChange={updateComment}
          label="Comments:"
          placeholder="Type something here"
        />
      </IonItem>
      <IonItem>
        <label>Public?</label>
        <IonToggle
          checked={status}
          onIonChange={(e) => setStatus(e.detail.checked)}
        />
      </IonItem>
      <div id="confirmButton">
        <IonButton onClick={handleConfirm} ref={confirmButton}>
          Confirm
        </IonButton>
      </div>
    </IonCard>
  );
};

export default MakePinModal;
