import { RouteComponentProps } from "react-router";
import { useTranslation } from "react-i18next";
import "./ErrorPage.scss";

interface ErrorPageProps
  extends RouteComponentProps<{
    status?: string;
  }> {}

const ErrorPage: React.FunctionComponent<ErrorPageProps> = ({ match }) => {
  const { t } = useTranslation();
  console.log(match);
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
