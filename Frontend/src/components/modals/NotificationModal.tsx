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
import { useTranslation } from "react-i18next";

// hooks
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";
import Loader from "../../components/Loader";
import Error from "../../components/Error";

const NotificationModal: React.FC = () => {
  const { t } = useTranslation();
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
        <Error message={t("modals.notification.error_page_message")} />
      )}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle style={{ textAlign: "center" }}>
            {t("modals.notification.card_title")}
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
