import React from "react";
import "./General.scss";

interface UserDataProps {
  userData: any;
}

const General: React.FC<UserDataProps> = ({ userData }) => {
  return <div>General</div>;
};

export default General;
