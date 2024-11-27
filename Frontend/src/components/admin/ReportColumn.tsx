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

const ReportColumn = ({
  reportData,
  onManageClick,
}: {
  reportData: ReportData;
  onManageClick: (e: MouseEvent) => void;
}) => {
  const date = new Date(reportData.date);

  return (
    <IonCol class="reportColumn" size="12">
      <section className="reportCon">
        <div className="reportId">
          <p>Id: {reportData.id}</p>
          <p>Date: {date.toUTCString()}</p>
        </div>
        <div className="reportInfo">
          <p>Active: {reportData.active ? "True" : "False"}</p>
          <p>Type: {reportData.reported_user ? "User" : "Pin"}</p>
          <p>Reporter: {reportData.reporting_user.name}</p>
          <p>Text: {reportData.text}</p>
        </div>
      </section>
      <section className="reportText"></section>
      <IonButton onClick={onManageClick}>Manage</IonButton>
    </IonCol>
  );
};

export default ReportColumn;
