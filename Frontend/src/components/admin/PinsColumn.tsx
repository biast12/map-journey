import { MouseEvent } from "react";
import { IonButton, IonCol, IonRow } from "@ionic/react";

import "./PinsColumn.scss";

type PinsColumnProps = {
  userData: UserData;
  pinData: PinData;
  onManageClick: (e: MouseEvent) => void;
}

const PinsColumn: React.FC<PinsColumnProps> = ({ userData, pinData, onManageClick }) => {

  return (
    <IonCol size="12" className="pinsColumn">
      <IonRow className="pinsCon">
        <IonCol size="12" className="pinsId">
          <IonRow>
            <IonCol size="12" sizeMd="6" sizeLg="4">{userData.role === "admin" && <p>Id: {pinData.id}</p>}</IonCol>
            <IonCol size="12" sizeMd="6" sizeLg="4"><p>Date: {new Date(pinData.date).toUTCString()}</p></IonCol>
          </IonRow>
        </IonCol>
        <div className="pinsInfo">
          <p>Title: {pinData.title}</p>
          {userData.role === "admin" && <p>User: {pinData.profile.name}</p>}
          <p>Status: {pinData.status}</p>
          <p>Description: {pinData.description}</p>
        </div>
      </IonRow>
      <IonButton onClick={onManageClick}>Manage</IonButton>
    </IonCol>
  );
};

export default PinsColumn;
