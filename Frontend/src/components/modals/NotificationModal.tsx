import React, { useEffect, useState } from "react";
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

// components
import Loader from "../../components/Loader";
import Error from "../../components/Error";
import { getNewNotifications } from "../layout/Header";
import "./NotificationModal.scss";

const NotificationModal: React.FC = () => {
  const { t } = useTranslation();
  const { makeRequest, data, error, isLoading } = useRequestData();
  const {
    makeRequest: makeRequestReset,
    error: errorReset,
    isLoading: isLoadingReset,
  } = useRequestData();
  const { userID, role, loading } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    makeRequest(`notification/all/${userID}`);
  }, []);

  useEffect(() => {
    if (userID && !loading) {
      makeRequestReset(`notification/readall/${userID}`, "POST");
      role === "admin" && console.log("All notifications are now read");
    }
  }, [userID, loading]);

  useEffect(() => {
    const unreadArray = getNewNotifications();
    if (unreadArray && unreadArray.length > 0) {
      setUnreadNotifications(parseUnreadNotifications(unreadArray));
    }
  }, [data]);

  const parseUnreadNotifications = (unreadArray: string[]): Set<number> => {
    const unreadSet = new Set<number>();

    unreadArray.forEach((item) => {
      if (item.includes("-")) {
        const [start, end] = item.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          unreadSet.add(i);
        }
      } else {
        unreadSet.add(Number(item));
      }
    });

    return unreadSet;
  };

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
                <IonItem
                  key={index}
                  className={
                    unreadNotifications.has(notification.id)
                      ? "unread-notification"
                      : ""
                  }
                >
                  <IonLabel>
                    <h2>{notification.title}</h2>
                    <section>
                      {notification.text.split("\n").map((text: string)=><p>{text}</p>)}
                    </section>
                    <small>{new Date(notification.date).toDateString()}</small>
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
