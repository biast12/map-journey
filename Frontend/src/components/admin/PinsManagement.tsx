import { IonAlert, IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect, useState } from "react";

import "./PinsManagement.scss";
import Modal from "../Modal";
import Loader from "../Loader";
import useAuth from "../../hooks/ProviderContext";
import PinsColumn from "./PinsColumn";

type PinSearchOptions = {
  search: string;
  searchBy: "id" | "title" | "description";
  sortBy: "id" | "title" | "description";
};

const PinsManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: delData, error: delError, isLoading: delIsLoading, makeRequest: delMakeRequest } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<null | PinData>(null);
  const [searchOptions, setSearchOptions] = useState<PinSearchOptions>({
    search: "",
    searchBy: "title",
    sortBy: "title",
  });

  const { userID } = useAuth();

  async function handleDeletePin(pinData: PinData) {
    await delMakeRequest(`pins/${pinData.id}/${userID}`, "DELETE")

    setSelectedPin(null);
    setShowModal(false);
  }

  useEffect(() => {
    makeRequest("pins/all/" + userID);
  }, []);

  function filterData(pinData: PinData) {
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
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={["Cancel", { text: "Confirm", handler: () => handleDeletePin(selectedPin!) }]}
      />
      <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
        {selectedPin && (
          <IonGrid id="pinModalGrid">
            <IonRow>
              <IonCol id="pinModalTop" size="12">
                <p>Id: {selectedPin.id}</p>
                <p>Date: {new Date(selectedPin.date).toUTCString()}</p>
              </IonCol>
            </IonRow>
            <IonRow id="pinModalContent">
              <section>
                <h4>{selectedPin.title}</h4>
                <figure>
                  <img src={selectedPin.imgurls} alt="" />
                  <p>{selectedPin.location}</p>
                </figure>
                <p className="descriptionText">{selectedPin.description}</p>
              </section>
              <hr />
              <div>
                <section className="avatarSection">
                  <figure>
                    <img src={selectedPin.profile.avatar} alt="" />
                  </figure>
                </section>
                <section>
                  <p>{selectedPin.profile.name}</p>
                  <p className="smallText">Id: {selectedPin.profile.id}</p>
                </section>
              </div>
            </IonRow>
            <IonRow id="pinButtonsRow">
              <IonCol size="4" className="pinButtons">
                <IonButton color={"danger"} onClick={()=>setShowAlert(true)}>
                  Delete
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
              const value = e.target.value as "id" | "title" | "description";
              setSearchOptions({ ...searchOptions, searchBy: value });
            }}
          >
            <option value="title">Title</option>
            <option value="id">Id</option>
            <option value="description">Description</option>
          </select>
        </section>
      </article>
      <IonRow id="pinsRow">
        {data &&
          data.filter(filterData).map((pinData: PinData) => (
            <PinsColumn
              key={pinData.id}
              pinData={pinData}
              onManageClick={() => {
                setSelectedPin(pinData);
                setShowModal(true);
              }}
            />
          ))}
      </IonRow>
    </>
  );
};

export default PinsManagement;
