import { IonContent, IonGrid, IonRow } from "@ionic/react";

import "./Page.scss";
import UserManagement from "../../components/admin/UserManagement";
import ReportManagement from "../../components/admin/ReportManagement";
import NotificationManagement from "../../components/admin/NotificationManagement";


const Page = () => {
  

  return (
    <IonContent id="adminContent">
      <IonGrid fixed >
        <h1>Dashboard</h1>

        <h3>Users</h3>
        <UserManagement />

        <h3>Reports</h3>
        <ReportManagement />

        <h3>News</h3>
        <NotificationManagement />
      </IonGrid>
    </IonContent>
  );
};

export default Page;
