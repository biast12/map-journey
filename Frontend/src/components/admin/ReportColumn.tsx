import { IonButton, IonCol } from "@ionic/react";
import "./ReportColumn.scss";
import { MouseEvent } from "react";

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

const ReportColumn = ({ reportData, onManageClick }: { reportData: ReportData, onManageClick: (e: MouseEvent)=>void }) => {
  const date = new Date(reportData.date);

  return (
    <IonCol class="reportColumn" size="12">
      <section className="reportCon">
        <div className="reportId">
          <p>Id: {reportData.id}</p>
        </div>
        <div className="reportInfo">
          <p>Reporting User: {reportData.reporting_user.name}</p>
          <p>Date: {date.toLocaleString()}</p>
          <p>Active: {String(reportData.active)}</p>
        </div>
      </section>
      <section className="reportText">
        <p>Report text: {reportData.text}</p>
      </section>
      <IonButton onClick={onManageClick}>Manage</IonButton>
    </IonCol>
  );
};

export default ReportColumn;
