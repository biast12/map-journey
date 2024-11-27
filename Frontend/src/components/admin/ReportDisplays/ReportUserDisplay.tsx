import { IonCol } from "@ionic/react";

import "./ReportUserDisplay.scss";

type ReportUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

const ReportUserDisplay = ({ reportUser, header }: { reportUser: ReportUser; header: string }) => {
  return (
    <IonCol size="6" className="userDisplay">
      <h3>{header}</h3>
      <p className="userIdSmallText">Id: {reportUser.id}</p>
      <figure>
        <img src={reportUser.avatar} />
      </figure>
      <h4>{reportUser.name}</h4>
    </IonCol>
  );
};

export default ReportUserDisplay;
