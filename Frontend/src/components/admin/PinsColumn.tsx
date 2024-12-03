import { IonButton, IonCol } from "@ionic/react";

import "./PinsColumn.scss";
import { MouseEvent } from "react";

const PinsColumn = ({ pinData, onManageClick }: { pinData: PinData; onManageClick: (e: MouseEvent) => void }) => {
  return (
    <IonCol size="12" className="pinsColumn">
      <section className="pinsCon">
        <div className="pinsId">
          <p>Id: {pinData.id}</p>
          <p>Date: {new Date(pinData.date).toUTCString()}</p>
        </div>
        <div className="pinsInfo">
          <p>Title: {pinData.title}</p>
          <p>Status: {pinData.status}</p>
          <p>User: {pinData.profile.name}</p>
          <p>Description: {pinData.description}</p>
        </div>
      </section>
      <IonButton onClick={onManageClick}>Manage</IonButton>
    </IonCol>
  );
};

export default PinsColumn;
