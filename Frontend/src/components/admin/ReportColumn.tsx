import { IonCol } from "@ionic/react";
import "./ReportColumn.scss";

type ReportUser = {
    id: string;
    name: string;
    email: string;
    avatar: string;
  }
  
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
  }
  
  interface ReportData {
    id: number;
    text: string;
    date: string;
    active: boolean;
    reporting_user: ReportUser;
    reported_user?: ReportUser;
    reported_pin?: ReportPin;
  }

const ReportColumn = ({reportData}: {reportData: ReportData}) => {
  return (
    <IonCol>
      <p></p>
    </IonCol>
  );
};

export default ReportColumn;
