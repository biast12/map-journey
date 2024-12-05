import React, { useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./TOS&PP.scss";

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Map Journey - Privacy Policy";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  const sections = [
    "introduction",
    "data_collection",
    "data_usage",
    "data_sharing",
    "user_rights",
    "contact",
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("privacy_policy.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="terms-container">
        {sections.map((sectionKey) => (
          <section key={sectionKey} className="section">
            <h2>{t(`privacy_policy.${sectionKey}.title`)}</h2>
            <p>
              {sectionKey === "contact" ? (
                <>
                  {t(`privacy_policy.${sectionKey}.content`)}{" "}
                  <a href="mailto:contact@map-journey.com">
                    contact@map-journey.com
                  </a>
                </>
              ) : (
                t(`privacy_policy.${sectionKey}.content`)
              )}
            </p>
          </section>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default PrivacyPolicy;
