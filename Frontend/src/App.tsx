/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";
/* Theme variables */
import "./theme/variables.scss";
import "./App.scss";

import { useEffect, useState } from "react";
import {
  setupIonicReact,
  IonApp,
  IonContent,
  IonTabs,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Components */
import Header from "./components/layout/Header";
import Routes from "./components/Routes";
import Footer from "./components/layout/Footer";
import Modals from "./components/Modals";


/* Hooks */
import useRequestData from "./hooks/useRequestData";
import useAuth from "./hooks/useAuth";

/* App */
setupIonicReact();

const App: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [makePinModal, setMakePinModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { userID } = useAuth();
  const { makeRequest, data, error, isLoading } = useRequestData();

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openMakePinModal = () => setMakePinModal(true);
  const closeMakePinModal = () => setMakePinModal(false);

  const openNotificationModal = () => setShowNotificationModal(true);
  const closeNotificationModal = () => setShowNotificationModal(false);

  useEffect(() => {
    if (userID) {
      makeRequest(`users/${userID}`);
    } else {
      openLoginModal();
    }
  }, [userID]);

  return (
    <IonApp>
      <IonReactRouter>
        <Header
          openNotificationModal={openNotificationModal}
          openLoginModal={openLoginModal}
        />
        <IonContent>
          <IonTabs>
            <IonRouterOutlet>
              <Routes />
            </IonRouterOutlet>
            <Footer openMakePinModal={openMakePinModal} />
          </IonTabs>
        </IonContent>
        <Modals
          showLoginModal={showLoginModal}
          closeLoginModal={closeLoginModal}
          makePinModal={makePinModal}
          closeMakePinModal={closeMakePinModal}
          showNotificationModal={showNotificationModal}
          closeNotificationModal={closeNotificationModal}
        />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
