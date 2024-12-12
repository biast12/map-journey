import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { earth, pin, map } from "ionicons/icons";
import { useTranslation } from "react-i18next";

type FooterProps = {
  userData: UserData
  openCreatePinModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ userData, openCreatePinModal }) => {
  const { t } = useTranslation();

  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="globalmap" href="/globalmap">
        <IonIcon aria-hidden="true" icon={earth} />
        <IonLabel>{t("footer.global_map")}</IonLabel>
      </IonTabButton>
      <IonTabButton
        disabled={!userData.id}
        tab="createPinModal"
        onClick={openCreatePinModal}
      >
        <IonIcon aria-hidden="true" icon={pin} />
        <IonLabel>{t("footer.add_pin")}</IonLabel>
      </IonTabButton>
      <IonTabButton disabled={!userData.id} tab="ownmap" href="/ownmap">
        <IonIcon aria-hidden="true" icon={map} />
        <IonLabel>{t("footer.own_map")}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Footer;
