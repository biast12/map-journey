import { useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/ProviderContext";

/* Pages */
import Admin from "../pages/admin/Page";
import GlobalMap from "../pages/GlobalMap";
import OwnMap from "../pages/OwnMap";
import Settings from "../pages/settings";

/* Settings Pages */
import General from "../pages/settings/General";
import Account from "../pages/settings/Accounts";

export const Routes = () => {
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { userID, loading } = useAuth();

  useEffect(() => {
    if (userID && !loading) {
      makeRequest(`users/${userID}`);
    }
  }, [userID, loading]);

  return (
    <>
      <Route exact path="/">
        <Redirect to="/globalmap" />
      </Route>
      <Route
        exact
        path="/globalmap"
        render={() => userID && !loading && <GlobalMap userID={userID} />}
      />
      <Route
        exact
        path="/ownmap"
        render={() => userID && !loading && <OwnMap userID={userID} />}
      />
      <Route
        exact
        path="/admin"
        render={() => data.status === "admin" && <Admin />}
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
    </>
  );
};
export default Routes;
