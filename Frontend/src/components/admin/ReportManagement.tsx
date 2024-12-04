import { useEffect, useState } from "react";
import { IonRow } from "@ionic/react";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import ReportActionModal from "../modals/ReportActionModal";
import ReportColumn from "./ReportColumn";
import Loader from "../Loader";
import Error from "../Error";

import "./ReportManagement.scss";

type ReportSearchOptions = {
  search: string;
  searchBy: "id" | "name" | "text";
  sortBy: "id" | "name" | "text";
};

const ReportManagement = () => {
  const { makeRequest, data, error, isLoading } = useRequestData();
  const { makeRequest: rpMakeRequest, error: rpError, isLoading: rpIsLoading } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<null | ReportData>(null);
  const [searchOptions, setSearchOptions] = useState<ReportSearchOptions>({
    search: "",
    searchBy: "name",
    sortBy: "name",
  });

  const { userID } = useAuth();

  async function handleReportAction(reportData: ReportData, action: "dismiss" | "warn" | "ban") {
    await rpMakeRequest(`reports/${userID}/${reportData.id}`, "POST", undefined, { action: action });

    makeRequest(`reports/all/${userID}`);
    setSelectedReport(null);
    setShowModal(false);
  }

  useEffect(() => {
    makeRequest(`reports/all/${userID}`);
  }, []);

  function filterData(reportData: ReportData) {
    if (searchOptions.search === "") {
      return true;
    }

    if (searchOptions.searchBy === "id") {
      return reportData.id
        .toString()
        .toLowerCase()
        .match(searchOptions.search.toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    }

    if (searchOptions.searchBy === "name") {
      return reportData.reporting_user.name
        .toLowerCase()
        .match(searchOptions.search.toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    }

    if (searchOptions.searchBy === "text") {
      return reportData.text
        .toLowerCase()
        .match(searchOptions.search.toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    }
  }

  return (
    <>
      {error || rpError && <Error message="Error" />}
      {rpIsLoading && <Loader />}
      {selectedReport && <ReportActionModal selectedReport={selectedReport} showModal={showModal} setShowModal={setShowModal} handleReportAction={handleReportAction} />}
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
            title="SearchBy"
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
        {data ? (
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
            ))
        ) : (
          isLoading ? <p>Loading...</p> : <p>No data</p>
        )}
      </IonRow>
    </>
  );
};

export default ReportManagement;
