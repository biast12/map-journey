import { useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
} from "@ionic/react";
import "./ShowPinModal.scss";

const ShowPin = () => {

  return (
    <>
        <IonCard id="showPinCard">
          <IonCardHeader>
            <IonCardTitle>My First Pin!</IonCardTitle>
            <div id="showPinLightbox">
            <img
              id="showPinImage"
              alt="Silhouette of mountains"
              src="https://ionicframework.com/docs/img/demos/card-media.png"
            />
            </div>
            <IonCardSubtitle>
              Acacia Street 14, Ironwood, Mystia
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste
              perferendis accusantium molestiae unde at, laborum maxime
              laudantium. Possimus error delectus ipsam repellendus fuga ducimus
              voluptatum quos sit excepturi eius, quam ut officiis? Voluptatibus
              quam iste, error rerum sed modi vitae numquam quos eum aliquam
              fuga iure maxime architecto nemo cumque?
            </p>
            <div>
              <img
                alt="Silhouette of mountains"
                src="https://ionicframework.com/docs/img/demos/card-media.png"
              />
              <p>(USERNAME)</p>
              <IonButton>Add</IonButton>
            </div>
          </IonCardContent>
          <div id="showPinCardButtons">
            <IonButton>Report</IonButton>
          </div>
        </IonCard>
    </>
  );
};

export default ShowPin;
