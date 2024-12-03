import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import useRequestData from "../../hooks/useRequestData";
import { useEffect, useState } from "react";

import "./PinsManagement.scss";
import Modal from "../Modal";
import Loader from "../Loader";
import useAuth from "../../hooks/ProviderContext";
import PinsColumn from "./PinsColumn";

type PinSearchOptions = {
  search: string;
  searchBy: "id" | "name" | "text";
  sortBy: "id" | "name" | "text";
};

const PinsManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: rpData, error: rpError, isLoading: rpIsLoading, makeRequest: rpMakeRequest } = useRequestData();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPin, setSelectedPin] = useState<null | PinData>(null);
  const [searchOptions, setSearchOptions] = useState<PinSearchOptions>({
    search: "",
    searchBy: "name",
    sortBy: "name",
  });

  const { userID } = useAuth();

  useEffect(() => {
    makeRequest("pins/all/" + userID);
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      {rpIsLoading && <Loader />}
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
                <p>{selectedPin.description}</p>
              </section>
              <hr />
              <div>
                <p>{selectedPin.profile.name}</p>
                <p className="smallText">Id: {selectedPin.profile.id}</p>
              </div>
            </IonRow>
            <IonRow id="pinButtonsRow">
              <IonCol size="4" className="pinButtons">
                <IonButton color={"success"}>Dismiss</IonButton>
              </IonCol>
              <IonCol size="4" className="pinButtons">
                <IonButton color={"warning"}>Warn</IonButton>
              </IonCol>
              <IonCol size="4" className="pinButtons">
                <IonButton color={"danger"}>Ban</IonButton>
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
      <IonRow id="pinsRow">
        {data &&
          data.map((pinData: PinData) => (
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
