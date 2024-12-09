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

const TermsOfService: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Map Journey - Terms Of Service";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  const sections = [
    "introduction",
    "description",
    "user_accounts",
    "user_generated_content",
    "prohibited_conduct",
    "privacy_policy",
    "intellectual_property",
    "service_availability",
    "termination",
    "disclaimers",
    "limitation_of_liability",
    "governing_law",
    "updates_to_terms",
    "contact",
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("terms_of_service.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="terms-container">
        {sections.map((sectionKey) => (
          <section key={sectionKey} className="section">
            <h2>{t(`terms_of_service.${sectionKey}.title`)}</h2>
            <p>
              {sectionKey === "contact" ? (
                <>
                  {t(`terms_of_service.${sectionKey}.content`)}{" "}
                  <a href="mailto:contact@map-journey.com">
                    contact@map-journey.com
                  </a>
                </>
              ) : (
                t(`terms_of_service.${sectionKey}.content`)
              )}
            </p>
          </section>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default TermsOfService;
