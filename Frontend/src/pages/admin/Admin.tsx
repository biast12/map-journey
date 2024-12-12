import { useEffect } from "react";
import { IonContent, IonGrid } from "@ionic/react";

import useAuth from "../../hooks/ProviderContext";

import UserManagement from "../../components/admin/UserManagement";
import PinsManagement from "../../components/admin/PinsManagement";
import ReportManagement from "../../components/admin/ReportManagement";
import NotificationManagement from "../../components/admin/NotificationManagement";

import "./Admin.scss";

const Page = () => {
  const { userData } = useAuth();

  useEffect(() => {
    document.title = "Admin Page";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <IonContent>
      {userData && (
        <IonGrid fixed>
          <h1>Dashboard</h1>

          <h3>Users</h3>
          <UserManagement userData={userData} />

          <h3>Pins</h3>
          <PinsManagement userData={userData} url={"pins/all"} />

          <h3>Reports</h3>
          <ReportManagement userData={userData} />

          <h3>News</h3>
          <NotificationManagement userData={userData} />

        </IonGrid>
      )}
    </IonContent>
  );
};

export default Page;
