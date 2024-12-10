import { useEffect, useState } from "react";
import { IonRow } from "@ionic/react";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import EditPinModal from "../modals/EditPinModal";
import Toast, { showToastMessage } from "../Toast";
import PinsColumn from "./PinsColumn";

import "./PinsManagement.scss";

const PinsManagement = ({ url }: { url: string }) => {
  const { makeRequest, data, isLoading } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<null | PinData>(null);
  const [searchOptions, setSearchOptions] = useState<PinSearchOptions>({
    search: "",
    searchBy: "title",
    sortBy: "title",
    status: "all",
  });

  const { userID, role } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (userID) {
        try {
          await makeRequest(`${url}/${userID}`);
        } catch (error) {
          showToastMessage("Failed to fetch user data", "error");
        }
      }
    };

    fetchData();
  }, [userID]);

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

  async function onDelete(isSuccess: boolean) {
    if (isSuccess) {
      setSelectedPin(null);
      setShowModal(false);
      await makeRequest(`${url}/${userID}`);
    } else {
      showToastMessage("Failed to delete pin", "error");
    }
  }

  async function onEdit(isSuccess: boolean) {}

  return (
    <>
      <Toast />
      {selectedPin && (
        <EditPinModal
          pinData={selectedPin}
          showModal={showModal}
          setShowModal={setShowModal}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
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
          data.filter(filterData).length === 0 ? (
            <p>No pins found</p>
          ) : (
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
          )
        ) : isLoading ? (
          <p>Loading...</p>
        ) : (
          <p>No data</p>
        )}
      </IonRow>
    </>
  );
};

export default PinsManagement;
