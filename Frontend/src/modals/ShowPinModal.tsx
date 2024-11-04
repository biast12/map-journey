import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
} from "@ionic/react";
import "./ShowPinModal.scss";

interface ShowPinModalProps {
  pinData: any;
}

const ShowPinModal: React.FC<ShowPinModalProps> = ({ pinData }) => {
  if (!pinData) return null;

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{pinData.title}</IonCardTitle>
        <div>
          <img
            alt={pinData.description}
            src={pinData.imgurls}
          />
        </div>
        <IonCardSubtitle>{pinData.location}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <p>{pinData.description}</p>
        <div>
          <img alt="User avatar" src={pinData.profile.avatar} />
          <p>{pinData.profile.name}</p>
          <IonButton>Add</IonButton>
        </div>
      </IonCardContent>
      <div id="showPinCardButtons">
        <IonButton>Report</IonButton>
      </div>
    </IonCard>
  );
};

export default ShowPinModal;
