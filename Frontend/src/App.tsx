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
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { camera, earth, map, settings, shieldHalf } from "ionicons/icons";

import Admin from "./pages/admin/Page";
/* Pages */
import GlobalMap from "./pages/GlobalMap";
import { IonReactRouter } from "@ionic/react-router";
import OwnMap from "./pages/OwnMap";
import Settings from "./pages/Settings";

/* App */

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

setupIonicReact();

const userstatus = "admin";

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact={true} path="/">
            <Redirect to="/globalmap" />
          </Route>
          <Route exact={true} path="/globalmap" render={() => <GlobalMap />} />
          <Route exact={true} path="/takepicture"></Route>
          <Route exact={true} path="/ownmap" render={() => <OwnMap />} />
          <Route exact={true} path="/admin" render={() => <Admin />} />
          <Route exact={true} path="/settings" render={() => <Settings />} />
        </IonRouterOutlet>
        <IonHeader>
          <IonToolbar>
            <IonButton
              routerLink="/"
              fill="clear"
              style={{
                padding: 0,
                margin: 0,
                height: "50px",
                display: "flex",
                float: "left",
              }}
            >
              <IonImg
                src="../public/icons/webp/logo1.webp"
                alt="Logo"
                style={{ height: "50px" }}
              />
            </IonButton>
            <div style={{ display: "flex", float: "right" }}>
              {userstatus === "admin" && (
                <IonTabButton tab="admin" href="/admin">
                  <IonIcon aria-hidden="true" icon={shieldHalf} />
                  <IonLabel>Admin</IonLabel>
                </IonTabButton>
              )}
              <IonTabButton tab="settings" href="/settings">
                <IonIcon aria-hidden="true" icon={settings} />
                <IonLabel>Settings</IonLabel>
              </IonTabButton>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonTabBar slot="bottom">
          <IonTabButton tab="globalmap" href="/globalmap">
            <IonIcon aria-hidden="true" icon={earth} />
            <IonLabel>Global Map</IonLabel>
          </IonTabButton>
          <IonTabButton tab="takepicture" href="/takepicture">
            <IonIcon aria-hidden="true" icon={camera} />
            <IonLabel>Take Picture</IonLabel>
          </IonTabButton>
          <IonTabButton tab="ownmap" href="/ownmap">
            <IonIcon aria-hidden="true" icon={map} />
            <IonLabel>Own Map</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
