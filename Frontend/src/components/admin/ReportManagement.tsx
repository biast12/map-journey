import { IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect, useState } from "react";
import ReportColumn from "./ReportColumn";

import "./ReportManagement.scss";
import Modal from "../Modal";

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

const ReportManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<null | ReportData>(null);

  useEffect(() => {
    makeRequest("reports/all");
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
        {selectedReport && (
          <div id="reportModal">
            <p>Id: {selectedReport.id}</p>
            <p>Date: {new Date(selectedReport.date).toLocaleString()}</p>
            <p>Reporting User: {selectedReport.reporting_user.name}</p>
            {selectedReport.reported_user && <p>Reported User: {selectedReport.reported_user.name}</p>}
            {selectedReport.reported_pin && <p>Reported User: {selectedReport.reported_pin.title}</p>}
          </div>
        )}
      </Modal>
      <IonRow id="reportsRow">
        {data &&
          data.map((reportData: ReportData) => (
            <ReportColumn
              key={reportData.id}
              reportData={reportData}
              onManageClick={(e) => {
                setSelectedReport(reportData);
                setShowModal(true);
              }}
            />
          ))}
      </IonRow>
    </>
  );
};

export default ReportManagement;
