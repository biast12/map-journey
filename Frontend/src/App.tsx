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
import { IonReactRouter } from "@ionic/react-router";
import { camera, earth, map, settings, shieldHalf } from "ionicons/icons";

/* Pages */
import Admin from "./pages/admin/Page";
import GlobalMap from "./pages/GlobalMap";
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
      <IonHeader>
        <IonToolbar>
          <IonButton
            routerLink="/"
            fill="clear"
          >
            <IonImg
              src="/icons/webp/logo1.webp"
              alt="Logo"
            />
          </IonButton>
          <div className="IonButtonContainer">
            {userstatus === "admin" && (
              <IonButton routerLink="/admin" fill="clear">
                <IonIcon aria-hidden="true" icon={shieldHalf} />
              </IonButton>
            )}
            <IonButton routerLink="/settings" fill="clear">
              <IonIcon aria-hidden="true" icon={settings} />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
      </IonContent>
    </IonReactRouter>
  </IonApp>
);

export default App;