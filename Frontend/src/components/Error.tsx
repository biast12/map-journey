import React from "react";
import "./Error.scss";

interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <div className="error">
      <h1>Error</h1>
      <p>{message}</p>
    </div>
  );
};

export default Error;
