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
} from "@ionic/react";
import { camera, locationSharp } from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { useEffect, useState, useRef } from "react";
import { usePhotoGallery } from "./../hooks/usePhotoGallery";
import supabase from "../hooks/useSupabaseClient";
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";

interface MakePinModalProps {
  onClose: () => void;
}

const MakePinModal: React.FC<MakePinModalProps> = ({ onClose }) => {
  const [title, setTitle] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [location, setLocation] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<Coordinate | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const confirmButton = useRef<HTMLIonButtonElement>(null);
  const cancelButton = useRef<HTMLIonButtonElement>(null);
  const titleInput = useRef<HTMLIonInputElement>(null);
  const commentInput = useRef<HTMLIonTextareaElement>(null);
  const cameraButton = useRef<HTMLIonButtonElement>(null);
  const locationButton = useRef<HTMLIonButtonElement>(null);
  const { takePhoto, photo, uploadImageToStorage, blob } = usePhotoGallery();
  const { makeRequest } = useRequestData();
  const { userID } = useAuth();

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
    if (!title || !photo || !comment || !location || !coordinates) {
      console.error("All fields are required");
      return;
    }

    if (!blob) {
      console.error("No photo blob available");
      return;
    }

    setIsSubmitting(true);

    const time = new Date().getTime();
    const fileName = `userImage-${time}.jpg`;

    try {
      const uploadResult = await uploadImageToStorage(
        "user-images",
        fileName,
        blob,
        blob?.type as string
      );

      if (!uploadResult) {
        throw new Error("Failed to upload image");
      }

      const { data: publicData } = supabase.storage
        .from("user-images")
        .getPublicUrl(fileName);

      if (!publicData.publicUrl) {
        throw new Error("No public URL generated");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", comment);
      formData.append("location", location.address);
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lon);
      formData.append("imgurls", publicData.publicUrl);

      await makeRequest(`pins/${userID}`, "POST", undefined, formData);
      console.log("Pin uploaded successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading pin:", error);
      await removeImage(fileName);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = async (fileName: string) => {
    try {
      const removedImage = await supabase.storage
        .from("user-images")
        .remove([fileName]);
      if (removedImage.error) {
        console.error("Error removing image:", removedImage.error);
      } else {
        console.log("Image removed successfully");
      }
    } catch (removeError) {
      console.error("Error during image removal:", removeError);
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
    if (photo && photo.webViewPath) {
      setPhotoUrl(photo.webViewPath);
    }
  }, [photo]);

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
      <div id="confirmButton">
        <IonButton onClick={handleConfirm} ref={confirmButton}>
          Confirm
        </IonButton>
      </div>
    </IonCard>
  );
};

export default MakePinModal;
