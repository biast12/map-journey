import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { earth, pin, map } from "ionicons/icons";
import useAuth from "../../hooks/ProviderContext";
import { useTranslation } from "react-i18next";

interface FooterProps {
  openMakePinModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ openMakePinModal }) => {
  const { userID } = useAuth();
  const { t } = useTranslation();

  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="globalmap" href="/globalmap">
        <IonIcon aria-hidden="true" icon={earth} />
        <IonLabel>{t('header.global_map')}</IonLabel>
      </IonTabButton>
      <IonTabButton
        disabled={!userID}
        tab="makePinModal"
        onClick={openMakePinModal}
      >
        <IonIcon aria-hidden="true" icon={pin} />
        <IonLabel>{t('header.add_pin')}</IonLabel>
      </IonTabButton>
      <IonTabButton disabled={!userID} tab="ownmap" href="/ownmap">
        <IonIcon aria-hidden="true" icon={map} />
        <IonLabel>{t('header.own_map')}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Footer;