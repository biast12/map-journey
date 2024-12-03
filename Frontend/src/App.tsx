import { useEffect, useState } from "react";
import {
  setupIonicReact,
  IonApp,
  IonContent,
  IonTabs,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Switch, useLocation } from "react-router-dom";

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
import "@ionic/react/css/palettes/dark.always.css";
import "./App.scss";

/* Components */
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Modals from "./components/Modals";
import Routes from "./components/Routes";

/* Hooks */
import useAuth from "./hooks/ProviderContext";

/* App */
setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </IonApp>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
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

  // Define the paths for Public Routes
  const publicPaths = ["/privacy-policy", "/terms-of-service", "/error", "/error/:status"];

  useEffect(() => {
    if (!userID && !loading && !publicPaths.includes(location.pathname)) {
      openLoginModal();
    }
  }, [userID, loading, location.pathname]);

  return (
    <>
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
    </>
  );
};

export default App;
