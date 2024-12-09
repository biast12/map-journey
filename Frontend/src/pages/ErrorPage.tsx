import { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/ProviderContext";
import "./ErrorPage.scss";

interface ErrorPageProps
  extends RouteComponentProps<{
    status?: string;
  }> {}

const ErrorPage: React.FunctionComponent<ErrorPageProps> = ({ match }) => {
  const { t } = useTranslation();
  const { role } = useAuth();
  role === "admin" && console.log(match);

  useEffect(() => {
    document.title = "Map Journey - Error!";

    return () => {
      document.title = "Map Journey";
    };
  }, []);

  return (
    <div id="errorContainer">
      <h1>
        {t("pages.errorpage.error")} - {match.params.status || "404"}
      </h1>
      <p>{t("pages.errorpage.errormessage")}</p>
    </div>
  );
};

export default ErrorPage;
