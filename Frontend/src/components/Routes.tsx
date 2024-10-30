import { Route, Redirect } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/* Pages */
import Admin from "../pages/admin/Page";
import GlobalMap from "../pages/GlobalMap";
import OwnMap from "../pages/OwnMap";
import Settings from "../pages/Settings";

export const Routes = () => {
  const { userID, userStatus } = useAuth();
  return (
    <>
      <Route exact path="/">
        <Redirect to="/globalmap" />
      </Route>
      <Route exact path="/globalmap" render={() => <GlobalMap />} />
      <Route
        exact
        path="/ownmap"
        render={() => userID && <OwnMap userID={userID.toString()} />}
      />
      <Route
        exact
        path="/admin"
        render={() => userStatus === "admin" && <Admin />}
      />
      <Route exact path="/settings" render={() => userID && <Settings />} />
    </>
  );
};
export default Routes;
