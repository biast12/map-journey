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

// components
import Toast, { showToastMessage } from "../Toast";
import { getNewNotifications } from "../layout/Header";
import Loader from "../Loader";
import "./NotificationModal.scss";

const NotificationModal = ({ userData }: { userData: UserData }) => {
  const { t } = useTranslation();
  const { makeRequest, data, isLoading } = useRequestData();
  const {
    makeRequest: makeRequestReset,
    isLoading: isLoadingReset,
  } = useRequestData();
  const [unreadNotifications, setUnreadNotifications] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await makeRequest(`notification/all/${userData.id}`);
      } catch (error) {
        showToastMessage(t("modals.notification.error_message"), "error");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
          await makeRequestReset(`notification/readall/${userData.id}`, "POST");
          userData.role === "admin" && console.log("All notifications are now read");
        } catch (error) {
          showToastMessage(t("modals.notification.error_read_message"), "error");
        }
    };

    fetchData();
  }, []);

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
      <Toast />
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
                      {notification.text.split("\n").map((text: string, index: number) => <p key={index}>{text}</p>)}
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
