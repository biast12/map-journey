import { IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect } from "react";

const ReportManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();

  useEffect(() => {
    makeRequest("reports/all")
  }, []);

  useEffect(()=>{console.log(data)}, [data])

  return (
    <>
      <IonRow>

      </IonRow>
    </>
  );
};

export default ReportManagement;
