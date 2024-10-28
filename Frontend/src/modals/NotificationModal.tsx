import React from 'react';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import notificationsData from "../data/notiftest.json";

const NotificationModal: React.FC = () => {
  return (
  <IonCard>
    <IonCardHeader>
    <IonCardTitle style={{ textAlign: 'center' }}> 
      Notifications
      </IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
    <IonList>
          {notificationsData.map((notification, index) => (
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
  );
};

export default NotificationModal;
