import { useEffect } from "react";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";

/* Hooks */
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";
import { changeLanguage, setDebugMode } from "../i18n";

/* Pages */
import Admin from "../pages/admin/Page";
import GlobalMap from "../pages/GlobalMap";
import OwnMap from "../pages/OwnMap";
import Settings from "../pages/settings";

/* Settings Pages */
import General from "../pages/settings/General";
import Account from "../pages/settings/Accounts";
import ErrorPage from "../pages/ErrorPage";

export const Routes = () => {
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID, role, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (userID && !loading) {
      makeRequest(`users/${userID}`);
    }
  }, [userID, loading]);

  useEffect(() => {
    if (data && !isLoading) {
      changeLanguage(data.settings.language);
      role === "admin" && setDebugMode(true);
    }
  }, [data, isLoading]);

  return (
    <Switch>
      <Route
        exact
        path="/globalmap"
        render={() => {
          const params = new URLSearchParams(location.search);
          const pinId = params.get("pin");
          return (
            userID && !loading && <GlobalMap userID={userID} pinId={pinId} />
          );
        }}
      />
      <Route
        exact
        path="/ownmap"
        render={() => userID && !loading && <OwnMap userID={userID} />}
      />
      <Route
        exact
        path="/admin"
        render={() => role === "admin" && <Admin />}
      />
      <Route exact path="/settings" render={() => userID && <Settings />} />
      <Route
        exact
        path="/settings/general"
        render={() => data && <General userData={data} />}
      />
      <Route
        exact
        path="/settings/account"
        render={() => data && <Account userData={data} />}
      />
      <Route exact path="/error" component={ErrorPage} />
      <Route exact path="/error/:status" component={ErrorPage} />
      <Route path="*">
        <Redirect to="/globalmap" />
      </Route>
    </Switch>
  );
};

export default Routes;
