import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { earth, pin, map } from "ionicons/icons";
import useAuth from "../../hooks/ProviderContext";
import { useTranslation } from "react-i18next";

interface FooterProps {
  openCreatePinModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ openCreatePinModal }) => {
  const { userID } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      {userID && (
        <IonTabBar slot="bottom">
          <IonTabButton tab="globalmap" href="/globalmap">
            <IonIcon aria-hidden="true" icon={earth} />
            <IonLabel>{t("footer.global_map")}</IonLabel>
          </IonTabButton>
          <IonTabButton
            disabled={!userID}
            tab="createPinModal"
            onClick={openCreatePinModal}
          >
            <IonIcon aria-hidden="true" icon={pin} />
            <IonLabel>{t("footer.add_pin")}</IonLabel>
          </IonTabButton>
          <IonTabButton disabled={!userID} tab="ownmap" href="/ownmap">
            <IonIcon aria-hidden="true" icon={map} />
            <IonLabel>{t("footer.own_map")}</IonLabel>
          </IonTabButton>
        </IonTabBar>
      )}
    </>
  );
};

export default Footer;
