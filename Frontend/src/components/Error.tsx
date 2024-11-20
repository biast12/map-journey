import React from "react";
import { useTranslation } from "react-i18next";
import "./Error.scss";

interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div className="error">
      <h1>{t("pages.errorpage.error")}</h1>
      <p>{message}</p>
    </div>
  );
};

export default Error;
