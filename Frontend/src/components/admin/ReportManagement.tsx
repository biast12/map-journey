import {IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect } from "react";
import ReportColumn from "./ReportColumn";

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


const ReportManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();

  useEffect(() => {
    makeRequest("reports/all")
  }, []);

  useEffect(()=>{console.log(data)}, [data])

  return (
    <>
      <IonRow id="reportsRow">
        {
          data && data.map((reportData: ReportData)=> <ReportColumn reportData={reportData} />)
        }
      </IonRow>
    </>
  );
};

export default ReportManagement;