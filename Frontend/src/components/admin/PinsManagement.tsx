import React, { useEffect, useState } from "react";
import { IonCol, IonRow } from "@ionic/react";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";

/* Components */
import EditPinModal from "../modals/EditPinModal";
import Toast, { showToastMessage } from "../Toast";
import PinsColumn from "./PinsColumn";

import "./PinsManagement.scss";

type PinsManagementProps = {
  userData: UserData;
  url: string;
};

type PinSearchOptions = {
  search: string;
  searchBy: "id" | "title" | "description";
  sortBy: "id" | "title" | "description";
  status: "all" | "public" | "private";
};

const PinsManagement: React.FC<PinsManagementProps> = ({ userData, url }) => {
  const { makeRequest, data, isLoading } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<null | PinData>(null);
  const [searchOptions, setSearchOptions] = useState<PinSearchOptions>({
    search: "",
    searchBy: "title",
    sortBy: "title",
    status: "all",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await makeRequest(`${url}/${userData.id}`);
      } catch (error) {
        showToastMessage("Failed to fetch user data", "error");
      }
    };

    fetchData();
  }, []);

  function filterData(pinData: PinData) {
    if (
      searchOptions.status !== "all" &&
      pinData.status !== searchOptions.status
    ) {
      return false;
    }

    if (searchOptions.search === "") {
      return true;
    } else {
      return pinData[searchOptions.searchBy]
        .toString()
        .toLowerCase()
        .match(
          searchOptions.search
            .toLowerCase()
            .replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        );
    }
  }

  async function onDelete(isSuccess: boolean) {
    if (isSuccess) {
      setSelectedPin(null);
      setShowModal(false);
      showToastMessage("Successfully delete pin", "success");
      await makeRequest(`${url}/${userData.id}`);
    } else {
      showToastMessage("Failed to delete pin", "error");
    }
  }

  async function onEdit(isSuccess: boolean) {
    if (isSuccess) {
      setSelectedPin(null);
      setShowModal(false);
      showToastMessage("Successfully updated pin", "success");
      await makeRequest(`${url}/${userData.id}`);
    } else {
      showToastMessage("Failed to edit pin", "error");
    }
  }

  return (
    <>
      <Toast />
      {selectedPin && (
        <EditPinModal
          userData={userData}
          pinData={selectedPin}
          showModal={showModal}
          setShowModal={setShowModal}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
      <IonRow className="searchOptions">
        <IonCol>
          <label htmlFor="searchParams">Search </label>
          <input
            name="searchParams"
            type="text"
            placeholder="Search..."
            onChange={(e) => {
              setSearchOptions({ ...searchOptions, search: e.target.value });
            }}
          />
        </IonCol>
        <IonCol>
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
            {userData.role === "admin" && <option value="id">Id</option>}
            <option value="description">Description</option>
          </select>
        </IonCol>
        <IonCol>
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
        </IonCol>
      </IonRow>
      <IonRow id="pinsRow">
        {data && !isLoading ? (
          data.filter(filterData).length === 0 ? (
            <p>No pins found</p>
          ) : (
            data.filter(filterData).map((pinData: PinData) => (
              <PinsColumn
                userData={userData}
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
