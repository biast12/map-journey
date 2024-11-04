import { useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/AuthContext";

/* Pages */
import Admin from "../pages/admin/Page";
import GlobalMap from "../pages/GlobalMap";
import OwnMap from "../pages/OwnMap";
import Settings from "../pages/Settings";

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
      <Route exact path="/globalmap" render={() => <GlobalMap />} />
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
    </>
  );
};
export default Routes;
