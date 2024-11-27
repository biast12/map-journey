import { IonCol } from "@ionic/react";
import "./ReportPinDisplay.scss";

type ReportPin = {
  id: number;
  profile_id: string;
  title: string;
  description: string;
  imgurls: string;
  date: string;
  location: string;
  longitude: number;
  latitude: number;
};

const ReportPinDisplay = ({ reportPin }: { reportPin: ReportPin }) => {
  return (
    <IonCol size="6" className="userDisplay">
      <h3>Reported Pin:</h3>
      <p className="userIdSmallText">Id: {reportPin.id}</p>
      <figure>
        <img src={reportPin.imgurls} />
      </figure>
      <h4>{reportPin.title}</h4>
    </IonCol>
  );
};

export default ReportPinDisplay;
