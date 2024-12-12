import { useEffect } from "react";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* Hooks */
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";
import { changeLanguage, setDebugMode } from "../utils/i18n";

/* Pages */
import Admin from "../pages/admin/Admin";
import GlobalMap from "../pages/GlobalMap";
import OwnMap from "../pages/OwnMap";
import Settings from "../pages/settings";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService"

import Toast, { showToastMessage } from "../components/Toast";

/* Settings Pages */
import General from "../pages/settings/General";
import Account from "../pages/settings/Account";
import Pins from "../pages/settings/Pins";
import ErrorPage from "../pages/ErrorPage";

export const Routes = () => {
  const { t } = useTranslation();
  const { makeRequest, data, isLoading } = useRequestData();
  const { userID, role, loading, storeAuthToken, storeRoleToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (userID && !loading) {
        try {
          await makeRequest(`users/${userID}`);
        } catch (error) {
          showToastMessage(t("header.error_message"), "error");
        }
      }
    };

    fetchData();
  }, [userID, loading]);

  

  useEffect(() => {
    if (data && !isLoading) {
      changeLanguage(data.settings.language);
      role === "admin" && setDebugMode(true);
      storeAuthToken(data.id);
      storeRoleToken(data.role);
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
      <Route exact path="/admin" render={() => role === "admin" && <Admin />} />
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
      <Route
        exact
        path="/settings/pins"
        render={() => <Pins />}
      />
      <Route exact path="/privacy-policy" component={PrivacyPolicy} />
      <Route exact path="/terms-of-service" component={TermsOfService} />
      <Route exact path="/error" component={ErrorPage} />
      <Route exact path="/error/:status" component={ErrorPage} />
      <Route path="*">
        <Redirect to="/globalmap" />
      </Route>
    </Switch>
  );
};

export default Routes;
