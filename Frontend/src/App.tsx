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
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
  setupIonicReact,
  IonBadge,
  IonModal,
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import {
  pin,
  earth,
  map,
  notifications,
  settings,
  shieldHalf,
  logIn,
  close
} from "ionicons/icons";

/* Hooks */
import useRequestData from "./hooks/useRequestData";

/* Pages */
import Admin from "./pages/admin/Page";
import GlobalMap from "./pages/GlobalMap";
import OwnMap from "./pages/OwnMap";
import Settings from "./pages/Settings";

/* Modals */
import LoginModal from "./modals/LoginModal";
import MakePinModal from "./modals/MakePinModal";
import NotificationModal from "./modals/NotificationModal";

/* App */
setupIonicReact();

const userstatus: string = "admin";
const userID: number | null = null;
const NotificationNum: number = 1;

const App: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [makePinModal, setMakePinModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openMakePinModal = () => setMakePinModal(true);
  const closeMakePinModal = () => setMakePinModal(false);

  const openNotificationModal = () => setShowNotificationModal(true);
  const closeNotificationModal = () => setShowNotificationModal(false);

  const { makeRequest, data, error, isLoading } = useRequestData();
  useEffect(() => {
    if (!userID) {
      makeRequest(`users/${userID}`);
    }
  }, [userID]);

  return (
    <IonApp>
      <IonReactRouter>
        <IonHeader>
          <IonToolbar>
            <IonButton routerLink="/" fill="clear">
              <IonImg src="/icons/webp/logo1.webp" alt="Logo" />
            </IonButton>
            <div className="IonButtonContainer">
              {NotificationNum >= 1 && (
                <IonButton fill="clear" onClick={openNotificationModal} >
                  <IonIcon aria-hidden="true" icon={notifications} />
                  <IonBadge color="danger">{NotificationNum}</IonBadge>
                </IonButton>
              )}
              {userstatus === "admin" && (
                <IonButton routerLink="/admin" fill="clear">
                  <IonIcon aria-hidden="true" icon={shieldHalf} />
                </IonButton>
              )}
              {userID ? (
                <IonButton routerLink="/settings" fill="clear">
                  <IonIcon aria-hidden="true" icon={settings} />
                </IonButton>
              ) : (
                <IonButton onClick={openLoginModal} fill="clear">
                  <IonIcon aria-hidden="true" icon={logIn} />
                </IonButton>
              )}
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact={true} path="/">
                <Redirect to="/globalmap" />
              </Route>
              <Route
                exact={true}
                path="/globalmap"
                render={() => <GlobalMap />}
              />
              <Route exact={true} path="/ownmap" render={() => userID && <OwnMap userID={userID.toString()} />} />
              <Route exact={true} path="/admin" render={() => userstatus == "admin" && <Admin />} />
              <Route exact={true} path="/settings" render={() => userID && <Settings />} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="globalmap" href="/globalmap">
                <IonIcon aria-hidden="true" icon={earth} />
                <IonLabel>Global Map</IonLabel>
              </IonTabButton>
              <IonTabButton disabled={userID ? false : true} tab="makePinModal" onClick={openMakePinModal} >
                <IonIcon aria-hidden="true" icon={pin} />
                <IonLabel>Add pin</IonLabel>
              </IonTabButton>
              <IonTabButton disabled={userID ? false : true} tab="ownmap" href="/ownmap">
                <IonIcon aria-hidden="true" icon={map} />
                <IonLabel>Own Map</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonContent>
        <IonModal isOpen={showLoginModal} onDidDismiss={closeLoginModal}>
          <div className="modal-content">
            <IonButton className="close-button" onClick={closeLoginModal} fill="clear">
              <IonIcon icon={close} />
            </IonButton>
            <LoginModal />
          </div>
        </IonModal>
        <IonModal isOpen={makePinModal} onDidDismiss={closeMakePinModal}>
          <div className="modal-content">
            <IonButton className="close-button" onClick={closeMakePinModal} fill="clear">
              <IonIcon icon={close} />
            </IonButton>
            <MakePinModal />
          </div>
        </IonModal>
        <IonModal isOpen={showNotificationModal} onDidDismiss={closeNotificationModal}>
          <div className="modal-content">
            <IonButton className="close-button" onClick={closeNotificationModal} fill="clear">
              <IonIcon icon={close} />
            </IonButton>
            <NotificationModal />
          </div>
        </IonModal>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
