/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';
/* Theme variables */
import './theme/variables.scss';
import './App.scss';

import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { camera, earth, map } from 'ionicons/icons';

import GlobalMap from './pages/GlobalMap';
import { IonReactRouter } from '@ionic/react-router';
import OwnMap from './pages/OwnMap';
import Settings from './pages/Settings';

/* App */



/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */



setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/globalmap">
            <GlobalMap />
          </Route>
          <Route exact path="/takepicture">

          </Route>
          <Route path="/ownmap">
            <OwnMap />
          </Route>
          <Route exact path="/">
            <Redirect to="/globalmap" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="globalmap" href="/">
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
