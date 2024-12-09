import { useEffect, useState } from "react";
import { IonAlert, IonRow } from "@ionic/react";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import EditPinModal from "../modals/EditPinModal";
import Toast, { showToastMessage } from "../Toast";
import PinsColumn from "./PinsColumn";
import Loader from "../Loader";

import "./PinsManagement.scss";

const PinsManagement = ({ url }: { url: string }) => {
  const { makeRequest, data, isLoading } = useRequestData();
  const { makeRequest: delMakeRequest, isLoading: delIsLoading } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<null | PinData>(null);
  const [searchOptions, setSearchOptions] = useState<PinSearchOptions>({
    search: "",
    searchBy: "title",
    sortBy: "title",
    status: "all",
  });

  const { userID, role } = useAuth();

  async function handleDeletePin(pinData: PinData) {
    try {
      await delMakeRequest(`pins/${pinData.id}/${userID}`, "DELETE")

      setSelectedPin(null);
      setShowModal(false);
      await makeRequest(`${url}/${userID}`);
    } catch (error) {
      showToastMessage("Failed to delete pin", "error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await makeRequest(`${url}/${userID}`);
      } catch (error) {
        showToastMessage("Failed to fetch user data", "error");
      }
    };

    fetchData();
  }, []);

  function filterData(pinData: PinData) {
    if (searchOptions.status !== "all" && pinData.status !== searchOptions.status) {
      return false;
    }

    if (searchOptions.search === "") {
      return true;
    } else {
      return pinData[searchOptions.searchBy]
        .toString()
        .toLowerCase()
        .match(searchOptions.search.toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    }
  }

  return (
    <>
      {delIsLoading && <Loader />}
      <Toast />
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={["Cancel", { text: "Confirm", handler: () => handleDeletePin(selectedPin!) }]}
      />
      {selectedPin && <EditPinModal selectedPin={selectedPin} showModal={showModal} setShowModal={setShowModal} setShowAlert={setShowAlert} />}
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
            title="searchBy"
            onChange={(e) => {
              const value = e.target.value as "id" | "title" | "description";
              setSearchOptions({ ...searchOptions, searchBy: value });
            }}
          >
            <option value="title">Title</option>
            {role === "admin" && <option value="id">Id</option>}
            <option value="description">Description</option>
          </select>
        </section>
        <section>
          <label htmlFor="statusParams">Status </label>
          <select
            name="statusParams"
            title="Status"
            onChange={(e) => {
              const value = e.target.value as "all" | "public" | "private";
              setSearchOptions({ ...searchOptions, status: value });
            }}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </section>
      </article>
      <IonRow id="pinsRow">
        {data ? (
          data.filter(filterData).map((pinData: PinData) => (
            <PinsColumn
              key={pinData.id}
              pinData={pinData}
              onManageClick={() => {
                setSelectedPin(pinData);
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

export default PinsManagement;
