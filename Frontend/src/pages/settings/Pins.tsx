import { useEffect } from "react";
import { IonContent, IonGrid } from "@ionic/react";

/* Components */
import PinsManagement from "../../components/admin/PinsManagement";

import "./Pins.scss";

const Pins = () => {
  useEffect(() => {
    document.title = "Map Journey - Pins Settings";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <IonContent>
      <IonGrid fixed>
        <h1>Your Pins</h1>
        <PinsManagement url={"pins"} />
      </IonGrid>
    </IonContent>
  );
};

export default Pins;
