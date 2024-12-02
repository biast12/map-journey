import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonImg,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./PrivacyPolicy.scss";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("privacy_policy.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <section>
          <h2>{t("privacy_policy.introduction.title")}</h2>
          <p>{t("privacy_policy.introduction.content")}</p>
        </section>
        <section>
          <h2>{t("privacy_policy.data_collection.title")}</h2>
          <p>{t("privacy_policy.data_collection.content")}</p>
        </section>
        <section>
          <h2>{t("privacy_policy.data_usage.title")}</h2>
          <p>{t("privacy_policy.data_usage.content")}</p>
        </section>
        <section>
          <h2>{t("privacy_policy.data_sharing.title")}</h2>
          <p>{t("privacy_policy.data_sharing.content")}</p>
        </section>
        <section>
          <h2>{t("privacy_policy.user_rights.title")}</h2>
          <p>{t("privacy_policy.user_rights.content")}</p>
        </section>
        <section>
          <h2>{t("privacy_policy.contact.title")}</h2>
          <p>
            {t("privacy_policy.contact.content")}
            <a href="mailto:mapjourney.biast12.info">mapjourney.biast12.info</a>
          </p>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default PrivacyPolicy;
