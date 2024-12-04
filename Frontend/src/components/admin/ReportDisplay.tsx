import { IonCol } from "@ionic/react";

import "./ReportDisplay.scss";

type ReportProps = {
  reportData: UserProfile | ReportPin;
};

const ReportDisplay: React.FC<ReportProps> = ({ reportData }) => {
  if ("avatar" in reportData) {
    // ReportUser
    return (
      <IonCol size="6" className="userDisplay">
        <h3>Reported User:</h3>
        <p className="userIdSmallText">Id: {reportData.id}</p>
        <figure>
          <img src={reportData.avatar} alt="Reported user image" />
        </figure>
        <h4>{reportData.name}</h4>
      </IonCol>
    );
  } else {
    // ReportPin
    return (
      <IonCol size="6" className="pinDisplay">
        <h3>Reported Pin:</h3>
        <p className="pinIdSmallText">Id: {reportData.id}</p>
        <h4>{reportData.title}</h4>
        <p>{reportData.description}</p>
        <figure>
          <img src={reportData.imgurls} alt="Reported pin image" />
        </figure>
        <p>{reportData.location}</p>
      </IonCol>
    );
  }
};

export default ReportDisplay;