import { IonContent, IonGrid, IonRow } from "@ionic/react";

import "./Page.scss";
import UserManagement from "../../components/admin/UserManagement";


const Page = () => {
  

  return (
    <IonContent>
      <IonGrid>
        <h1>Dashboard</h1>

        <h3>Users</h3>
        <UserManagement />

        <h3>Reports</h3>
        <IonRow id="reportsRow">

        </IonRow>

        <h3>News</h3>
        <IonRow id="newsRow">
          
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default Page;
