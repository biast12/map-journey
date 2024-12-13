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
  const { userData, loading, storeUserDataToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      if (userData?.id) {
        try {
          await makeRequest(`users/${userData.id}`);
        } catch (error) {
          showToastMessage(t("header.error_message"), "error");
        }
      }
    };

    fetchData();
  }, [loading]);

  useEffect(() => {
    if (data && !isLoading) {
      storeUserDataToken(data);
      changeLanguage(data.settings.language);
      if (data.role === "admin") {
        console.log("Admin/Debug mode enabled");
        console.log("Your saved user data: ", data);
        setDebugMode(true);
      }
    }
  }, [data, isLoading]);

  return (
    <>
      <Toast />
      <Switch>
        <Route
          exact
          path="/globalmap"
          render={() => {
            const params = new URLSearchParams(location.search);
            const pinId = params.get("pin");
            return (
              userData && <GlobalMap userData={userData} pinId={pinId} />
            );
          }}
        />
        <Route
          exact
          path="/ownmap"
          render={() => userData && <OwnMap userData={userData} />}
        />
        <Route exact path="/admin" render={() => userData && userData.role === "admin" && <Admin />} />
        <Route exact path="/settings" render={() => <Settings />} />
        <Route
          exact
          path="/settings/general"
          render={() => userData && <General userData={userData} />}
        />
        <Route
          exact
          path="/settings/account"
          render={() => userData && <Account userData={userData} />}
        />
        <Route
          exact
          path="/settings/pins"
          render={() => userData && <Pins userData={userData} />}
        />
        <Route exact path="/privacy-policy" component={PrivacyPolicy} />
        <Route exact path="/terms-of-service" component={TermsOfService} />
        <Route exact path="/error" component={ErrorPage} />
        <Route exact path="/error/:status" component={ErrorPage} />
        <Route path="*">
          <Redirect to="/globalmap" />
        </Route>
      </Switch>
    </>
  );
};

export default Routes;
