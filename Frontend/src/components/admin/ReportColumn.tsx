import { IonButton, IonCol } from "@ionic/react";
import "./ReportColumn.scss";

type ReportUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

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

interface ReportData {
  id: number;
  text: string;
  date: string;
  active: boolean;
  reporting_user: ReportUser;
  reported_user?: ReportUser;
  reported_pin?: ReportPin;
}

const ReportColumn = ({ reportData }: { reportData: ReportData }) => {
  const date = new Date(reportData.date);

  return (
    <IonCol class="reportColumn">
      <section className="reportCon">
        <div className="reportId">
          <p>Id: {reportData.id}</p>
        </div>
        <div className="reportInfo">
          <p>{reportData.reporting_user.name}</p>
          <p>Date: {date.toLocaleString()}</p>
          <p>Active: {reportData.active}</p>
        </div>
      </section>
      <section className="reportText">
        <p>{reportData.text}</p>
      </section>
      <IonButton>Manage</IonButton>
    </IonCol>
  );
};

export default ReportColumn;
