import { IonButton, IonCol, IonIcon } from "@ionic/react";
import { MouseEvent } from "react";

import "./UserColumn.scss"
import { createOutline, trashBin } from "ionicons/icons";

interface UserColumnProps {
  userData: UserData;
  onEditUserClick: (e: MouseEvent, userData: UserData) => void;
  onDeleteUserClick: (e: MouseEvent, userData: UserData) => void;
}

const UserColumn: React.FC<UserColumnProps> = ({ userData, onEditUserClick, onDeleteUserClick }) => {
  return (
    <IonCol className="userColumn" size="12">
      <section className="">
        <div className="userIdCon">
          <p className="userIdText">Id: {userData.id}</p>
        </div>
        <div className="userInfoCon">
          <p>Name: {userData.name}</p>
          <p>Role: {userData.role}</p>
          <p>Status: {userData.status}</p>
        </div>
      </section>
      <IonButton color="warning" onClick={(e) => onEditUserClick(e, userData)}><IonIcon aria-hidden="true" icon={createOutline} /></IonButton>
      <IonButton color="danger" onClick={(e) => onDeleteUserClick(e, userData)}><IonIcon aria-hidden="true" icon={trashBin} /></IonButton>
    </IonCol>
  );
};

export default UserColumn;
