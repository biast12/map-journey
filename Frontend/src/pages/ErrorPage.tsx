import { RouteComponentProps } from "react-router";
import "./ErrorPage.scss";

interface ErrorPageProps
  extends RouteComponentProps<{
    status?: string;
  }> {}

const ErrorPage: React.FunctionComponent<ErrorPageProps> = ({match}) => {
  console.log(match)
  return <div id="errorContainer">
    <h1>Error - {match.params.status || "404"}</h1>
    <p>Something went wrong!</p>
  </div>;
};

export default ErrorPage;
