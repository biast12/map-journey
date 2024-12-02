import { IonButton, IonCol, IonIcon } from "@ionic/react";
import "./NotificationColumn.scss";
import { trashBin } from "ionicons/icons";
import { MouseEvent } from "react";

const NotificationColumn = ({ notifData, onDeleteUserClick }: { notifData: NotificationData, onDeleteUserClick: (e: MouseEvent, notifData: NotificationData) => void }) => {

  return (
    <IonCol class="notifColumn" size="12">
      <section className="notifCon">
        <div className="notifId">
          <p>Id: {notifData.id}</p>
          <p>Date: {new Date(notifData.date).toUTCString()}</p>
        </div>
        <div className="notifInfo">
          <p>Title: {notifData.title}</p>
          <p>Text: {notifData.text}</p>
        </div>
      </section>
      <section className="reportText"></section>
      <IonButton color="danger" onClick={(e) => onDeleteUserClick(e, notifData)}>
        <IonIcon aria-hidden="true" icon={trashBin} />
      </IonButton>
    </IonCol>
  );
};

export default NotificationColumn;
