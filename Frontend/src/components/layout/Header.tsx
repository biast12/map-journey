import { useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonImg,
  IonIcon,
  IonBadge,
} from "@ionic/react";
import { notifications, settings, shieldHalf } from "ionicons/icons";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import { useAuth, useNotificationsStatus } from "../../hooks/ProviderContext";

/* Components */
import Loader from "../Loader";
import Error from "../Error";

interface HeaderProps {
  openNotificationModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openNotificationModal }) => {
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID, loading } = useAuth();
  const { notificationsStatus, loading: settingsLoading } =
    useNotificationsStatus();

  useEffect(() => {
    if (userID && !loading) {
      makeRequest(`users/${userID}`);
    }
  }, [userID, loading, notificationsStatus, settingsLoading]);

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && error && <Error message={"Failed fetching user!"} />}
      <IonHeader>
        <IonToolbar>
          <IonButton routerLink="/" fill="clear">
            <IonImg src="/icons/webp/logo1.webp" alt="Logo" />
          </IonButton>
          <div className="IonButtonContainer">
            {notificationsStatus && (
              <IonButton fill="clear" onClick={openNotificationModal}>
                <IonIcon aria-hidden="true" icon={notifications} />
                {data && data.news_count >= 1 && (
                  <IonBadge color="danger">{data.news_count}</IonBadge>
                )}
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
    </>
  );
};

export default Header;
