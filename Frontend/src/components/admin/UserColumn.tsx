import { IonButton, IonCol, IonIcon } from "@ionic/react";
import { MouseEvent } from "react";

import "./UserColumn.scss"
import { createOutline, trashBin } from "ionicons/icons";

type UserData = {
  name: string;
  id: string;
  role: string;
  reports: number; // Unsure?
  status: string;
};

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
          <p>Reports: {userData.reports}</p>
        </div>
      </section>
      <IonButton onClick={(e) => onEditUserClick(e, userData)}><IonIcon aria-hidden="true" icon={createOutline} /></IonButton>
      <IonButton onClick={(e) => onDeleteUserClick(e, userData)}><IonIcon aria-hidden="true" icon={trashBin} /></IonButton>
    </IonCol>
  );
};

export default UserColumn;
