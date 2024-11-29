import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect, useState } from "react";
import ReportColumn from "./ReportColumn";

import "./ReportManagement.scss";
import Modal from "../Modal";
import ReportUserDisplay from "./ReportDisplays/ReportUserDisplay";
import ReportPinDisplay from "./ReportDisplays/ReportPinDisplay";
import Loader from "../Loader";
import useAuth from "../../hooks/ProviderContext"

type SearchOptions = {
  search: string;
  searchBy: "id" | "name" | "text";
  sortBy: "id" | "name" | "text";
};

const ReportManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: rpData, error: rpError, isLoading: rpIsLoading, makeRequest: rpMakeRequest } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<null | ReportData>(null);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({ search: "", searchBy: "name", sortBy: "name" });

  const { userID } = useAuth();

  async function handleReportAction(reportData: ReportData, action: "dismiss" | "warn" | "ban") {
    await rpMakeRequest(`reports/${userID}/${reportData.id}`, "POST", undefined, { action: action });

    makeRequest("reports/all/" + userID);
    setSelectedReport(null);
    setShowModal(false);
  }

  useEffect(() => {
    makeRequest("reports/all/" + userID);
  }, []);

  useEffect(()=>{
    console.log(data)
  }, [data])

  function filterData(reportData: ReportData) {
    if (searchOptions.search === "") {
      return true;
    }

    if (searchOptions.searchBy === "id") {
      return reportData.id.toString().toLowerCase().match(searchOptions.search.toLowerCase());
    }

    if (searchOptions.searchBy === "name") {
      return reportData.reporting_user.name.toLowerCase().match(searchOptions.search.toLowerCase());
    }

    if (searchOptions.searchBy === "text") {
      return reportData.text.toLowerCase().match(searchOptions.search.toLowerCase());
    }
  }

  return (
    <>
      {rpIsLoading && <Loader />}
      <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
        {selectedReport && (
          <IonGrid id="reportModalGrid">
            <IonRow>
              <IonCol id="reportModalTop" size="12">
                <p>Id: {selectedReport.id}</p>
                <p>Date: {new Date(selectedReport.date).toUTCString()}</p>
              </IonCol>
            </IonRow>
            <IonRow id="reportModalContent">
              <ReportUserDisplay header="Reporting User:" reportUser={selectedReport.reporting_user} />
              {selectedReport.reported_user ? (
                <ReportUserDisplay header="Reported User:" reportUser={selectedReport.reported_user} />
              ) : (
                selectedReport.reported_pin && <ReportPinDisplay reportPin={selectedReport.reported_pin} />
              )}
              <IonCol size="12">Reasoning: {selectedReport.text}</IonCol>
            </IonRow>
            <IonRow id="reportButtonsRow">
              <IonCol size="4" className="reportButtons">
                <IonButton
                  color={"success"}
                  onClick={(e) => {
                    handleReportAction(selectedReport, "dismiss");
                  }}
                >
                  Dismiss
                </IonButton>
              </IonCol>
              <IonCol size="4" className="reportButtons">
                <IonButton
                  color={"warning"}
                  onClick={(e) => {
                    handleReportAction(selectedReport, "warn");
                  }}
                >
                  Warn
                </IonButton>
              </IonCol>
              <IonCol size="4" className="reportButtons">
                <IonButton
                  color={"danger"}
                  onClick={(e) => {
                    handleReportAction(selectedReport, "ban");
                  }}
                >
                  Ban
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </Modal>
      <article className="searchOptions">
        <section>
          <label htmlFor="searchParams">Search </label>
          <input
            name="searchParams"
            type="text"
            placeholder="Search..."
            onChange={(e) => {
              setSearchOptions({ ...searchOptions, search: e.target.value });
            }}
          />
        </section>
        <section>
          <label htmlFor="searchByParams">Search by </label>
          <select
            name="searchByParams"
            id=""
            onChange={(e) => {
              const value = e.target.value as "id" | "name" | "text";
              setSearchOptions({ ...searchOptions, searchBy: value });
            }}
          >
            <option value="name">Name</option>
            <option value="id">Id</option>
            <option value="text">Text</option>
          </select>
        </section>
      </article>
      <IonRow id="reportsRow">
        {data &&
          data
            .sort((a: ReportData, b: ReportData) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter(filterData)
            .map((reportData: ReportData) => (
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
