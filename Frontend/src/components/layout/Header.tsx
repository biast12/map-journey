import { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonImg,
  IonIcon,
  IonBadge,
} from "@ionic/react";
import { notifications, settings, shieldHalf, logIn } from "ionicons/icons";
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/AuthContext";

interface HeaderProps {
  openNotificationModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openNotificationModal }) => {
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID, loading } = useAuth();
  useEffect(() => {
    if (userID && !loading) {
      makeRequest(`users/${userID}`);
    }
  }, [userID, loading]);

  return (
    <IonHeader>
      <IonToolbar>
        <IonButton routerLink="/" fill="clear">
          <IonImg src="/icons/webp/logo1.webp" alt="Logo" />
        </IonButton>
        <div className="IonButtonContainer">
          {data && data.news_count >= 1 && (
            <IonButton fill="clear" onClick={openNotificationModal}>
              <IonIcon aria-hidden="true" icon={notifications} />
              <IonBadge color="danger">{data.news_count}</IonBadge>
            </IonButton>
          )}
          {data && data.role === "admin" && (
            <IonButton routerLink="/admin" fill="clear">
              <IonIcon aria-hidden="true" icon={shieldHalf} />
            </IonButton>
          )}
          {userID && (
            <IonButton routerLink="/settings" fill="clear">
              <IonIcon aria-hidden="true" icon={settings} />
            </IonButton>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
