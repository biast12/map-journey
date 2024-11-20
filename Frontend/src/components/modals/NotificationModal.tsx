import React, { useEffect } from "react";
import {
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";

// hooks
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import Loader from "../../components/Loader";
import Error from "../../components/Error";

const NotificationModal: React.FC = () => {
  const { makeRequest, data, error, isLoading } = useRequestData();
  const {
    makeRequest: makeRequestReset,
    error: errorReset,
    isLoading: isLoadingReset,
  } = useRequestData();
  const { userID, loading } = useAuth();

  useEffect(() => {
    makeRequest(`notification/all`);
  }, []);

  useEffect(() => {
    if (userID && !loading) {
      makeRequestReset(`notification/readall/${userID}`, "POST");
    }
  }, [userID, loading]);

  return (
    <>
      {(isLoading || isLoadingReset) && <Loader />}
      {!(isLoading || isLoadingReset) && (error || errorReset) && (
        <Error message="Failed reading notification!" />
      )}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle style={{ textAlign: "center" }}>
            Notifications
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {data &&
              data.map((notification: any, index: number) => (
                <IonItem key={index}>
                  <IonLabel>
                    <h2>{notification.title}</h2>
                    <p>{notification.text}</p>
                    <small>{notification.date}</small>
                  </IonLabel>
                </IonItem>
              ))}
          </IonList>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default NotificationModal;
