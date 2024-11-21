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
import useAuth from "./hooks/ProviderContext";

/* App */
setupIonicReact();

const App: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [createPinModal, setCreatePinModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { userID, loading } = useAuth();

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openCreatePinModal = () => setCreatePinModal(true);
  const closeCreatePinModal = () => setCreatePinModal(false);

  const openNotificationModal = () => setShowNotificationModal(true);
  const closeNotificationModal = () => setShowNotificationModal(false);

  useEffect(() => {
    if (!userID && !loading) {
      openLoginModal();
    }
  }, [userID, loading]);

  return (
    <IonApp>
      <IonReactRouter>
        <Header openNotificationModal={openNotificationModal} />
        <IonContent>
          <IonTabs>
            <IonRouterOutlet>
              <Routes />
            </IonRouterOutlet>
            <Footer openCreatePinModal={openCreatePinModal} />
          </IonTabs>
        </IonContent>
        <Modals
          showLoginModal={showLoginModal}
          closeLoginModal={closeLoginModal}
          createPinModal={createPinModal}
          closeCreatePinModal={closeCreatePinModal}
          showNotificationModal={showNotificationModal}
          closeNotificationModal={closeNotificationModal}
        />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
