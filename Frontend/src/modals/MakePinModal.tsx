import { useState } from "react";
import {
  IonCard,
  IonItem,
  IonInput,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonButton,
  IonTextarea,
} from "@ionic/react";
import { locationSharp, add, close, camera, image } from "ionicons/icons";
import "./MakePinModal.scss";

function MakePinModal() {
  const [expanded, setExpanded] = useState(false);

  const insertLocation = (): void => {
    console.log("insertLocation");
  };

  const toggleExpand = (): void => {
    setExpanded(!expanded);
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Map your Journey</IonCardTitle>
      </IonCardHeader>
      <IonItem>
        <IonInput label="Title:" placeholder="Your title here"></IonInput>
      </IonItem>
      <img
        alt="Silhouette of mountains"
        src="https://ionicframework.com/docs/img/demos/card-media.png"
      />
      <div className="addimagebutton"
      >
        <IonButton
          size="large"
          onClick={toggleExpand}
        >
          <IonIcon icon={expanded ? close : add} />
        </IonButton>
        {expanded && (
          <>
            <IonButton
              size="large"
              className="fade-in"
            >
              <IonIcon icon={camera} />
            </IonButton>
            <IonButton
              size="large"
              className="fade-in"
            >
              <IonIcon icon={image} />
            </IonButton>
          </>
        )}
      </div>

      <IonItem>
        <IonInput label="Location:" placeholder="Input address here"></IonInput>
        <IonButton aria-label="Location" onClick={insertLocation}>
          <IonIcon icon={locationSharp}></IonIcon>
        </IonButton>
      </IonItem>
      <IonItem>
        <IonTextarea
          label="Comments:"
          placeholder="Type something here"
        ></IonTextarea>
      </IonItem>
      <div id="confirmButton">
        <IonButton>Confirm</IonButton>
      </div>
    </IonCard>
  );
}

export default MakePinModal;
