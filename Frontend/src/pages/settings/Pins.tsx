import { useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonGrid,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { useTranslation } from "react-i18next";

/* Components */
import PinsManagement from "../../components/admin/PinsManagement";

import "./Pins.scss";

const Pins = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Map Journey - Pins Settings";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t("pages.settings.pins.card_title")}</IonTitle>
          <IonButton slot="end" routerLink="/settings" fill="clear">
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid fixed>
          <PinsManagement url={"pins"} />
        </IonGrid>
      </IonContent>
    </>
  );
};

export default Pins;
