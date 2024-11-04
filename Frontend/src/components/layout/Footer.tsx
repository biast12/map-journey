import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/react";
import { earth, pin, map } from "ionicons/icons";
import useAuth from "../../hooks/AuthContext";

interface FooterProps {
  openMakePinModal: () => void;
}

const Footer: React.FC<FooterProps> = ({ openMakePinModal }) => {
  const { userID } = useAuth();
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="globalmap" href="/globalmap">
        <IonIcon aria-hidden="true" icon={earth} />
        <IonLabel>Global Map</IonLabel>
      </IonTabButton>
      <IonTabButton
        disabled={!userID}
        tab="makePinModal"
        onClick={openMakePinModal}
      >
        <IonIcon aria-hidden="true" icon={pin} />
        <IonLabel>Add Pin</IonLabel>
      </IonTabButton>
      <IonTabButton disabled={!userID} tab="ownmap" href="/ownmap">
        <IonIcon aria-hidden="true" icon={map} />
        <IonLabel>Own Map</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Footer;
