import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useTranslation } from "react-i18next";
import "./TermsOfService.scss";

const TermsOfService: React.FC = () => {
  const { t } = useTranslation();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("terms_of_service.title")}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="terms-container">
        {[
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
        ].map((sectionKey) => (
          <section key={sectionKey} className="section">
            <h2>{t(`terms_of_service.${sectionKey}.title`)}</h2>
            <p>
              {sectionKey === "contact" ? (
                <>
                  {t(`terms_of_service.${sectionKey}.content`)}{" "}
                  <a href="mailto:mapjourney@biast12.info">
                    mapjourney@biast12.info
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
