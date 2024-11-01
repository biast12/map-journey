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
import useAuth from "../../hooks/useAuth";

interface HeaderProps {
  openNotificationModal: () => void;
  openLoginModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  openNotificationModal,
  openLoginModal,
}) => {
  const [notificationNum, setNotificationNum] = useState<number>(1);

  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID } = useAuth();
  useEffect(() => {
    if (userID) {
      makeRequest(`users/${userID}`);
    }
  }, [userID]);
  
  return (
    <IonHeader>
      <IonToolbar>
        <IonButton routerLink="/" fill="clear">
          <IonImg src="/icons/webp/logo1.webp" alt="Logo" />
        </IonButton>
        <div className="IonButtonContainer">
          {notificationNum >= 1 && (
            <IonButton fill="clear" onClick={openNotificationModal}>
              <IonIcon aria-hidden="true" icon={notifications} />
              <IonBadge color="danger">{notificationNum}</IonBadge>
            </IonButton>
          )}
          {data === "admin" && (
            <IonButton routerLink="/admin" fill="clear">
              <IonIcon aria-hidden="true" icon={shieldHalf} />
            </IonButton>
          )}
          {userID ? (
            <IonButton routerLink="/settings" fill="clear">
              <IonIcon aria-hidden="true" icon={settings} />
            </IonButton>
          ) : (
            <IonButton onClick={openLoginModal} fill="clear">
              <IonIcon aria-hidden="true" icon={logIn} />
            </IonButton>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
