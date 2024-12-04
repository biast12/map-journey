import { MouseEvent } from "react";
import { IonButton, IonCol } from "@ionic/react";

import useAuth from "../../hooks/ProviderContext";

import "./PinsColumn.scss";

const PinsColumn = ({ pinData, onManageClick }: { pinData: PinData; onManageClick: (e: MouseEvent) => void }) => {
  const { role } = useAuth();

  return (
    <IonCol size="12" className="pinsColumn">
      <section className="pinsCon">
        <div className="pinsId">
          {role === "admin" && (
            <p>Id: {pinData.id}</p>
          )}
          <p>Date: {new Date(pinData.date).toUTCString()}</p>
        </div>
        <div className="pinsInfo">
          <p>Title: {pinData.title}</p>
          {role === "admin" && (
            <p>User: {pinData.profile.name}</p>
          )}
          <p>Status: {pinData.status}</p>
          <p>Description: {pinData.description}</p>
        </div>
      </section>
      <IonButton onClick={onManageClick}>Manage</IonButton>
    </IonCol>
  );
};

export default PinsColumn;
