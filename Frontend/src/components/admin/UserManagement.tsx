"use client";
import { FormEvent, useEffect, useState } from "react";
import { IonAlert, IonRow } from "@ionic/react";

import useRequestData from "../../hooks/useRequestData";
import UserColumn from "./UserColumn";

import "./UserManagement.scss";
import useAuth from "../../hooks/ProviderContext";
import EditUserModal from "../modals/EditUserModal";

type UserSearchOptions = {
  search: string;
  searchBy: "id" | "name";
  sortBy: "id" | "name";
  show: "all" | "public" | "private" | "reported" | "warning" | "banned";
};

const UserManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: delData, error: delError, isLoading: delIsLoading, makeRequest: delMakeRequest } = useRequestData();
  const { data: editData, error: editError, isLoading: editIsLoading, makeRequest: editMakeRequest } = useRequestData();

  const [selectedUser, setSelectedUser] = useState<null | UserData>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [handlingRequest, setHandlingRequest] = useState<boolean>(false);
  const [searchOptions, setSearchOptions] = useState<UserSearchOptions>({
    search: "",
    searchBy: "name",
    sortBy: "name",
    show: "all",
  });

  const { userID } = useAuth();

  async function handleUserEdit(e: FormEvent, userData: UserData) {
    setHandlingRequest(true);
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const body = {
      name: form.username.value,
      status: form.status.value,
      role: userID === userData.id ? undefined : form.userrole.value,
    };

    const res = await editMakeRequest(`users/${userID}/${userData.id}`, "PUT", undefined, body);
    makeRequest("users/all/" + userID);

    setShowEditModal(false);
    setSelectedUser(null);
    setHandlingRequest(false);
  }
  async function handleUserDelete(userData: UserData) {
    setHandlingRequest(true);

    const res = await delMakeRequest(`users/${userData.id}`, "DELETE");
    makeRequest("users/all/" + userID);

    setShowDeleteModal(false);
    setSelectedUser(null);
    setHandlingRequest(false);
  }

  useEffect(() => {
    makeRequest("users/all/" + userID);
  }, []);

  function filterData(userData: UserData) {
    if (searchOptions.show !== "all" && userData.status !== searchOptions.show) {
      return false;
    }

    if (searchOptions.search === "") {
      return true;
    } else {
      userData[searchOptions.searchBy]
        .toString()
        .toLowerCase()
        .match(searchOptions.search.toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    }
  }

  return (
    <>
      <EditUserModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        userData={selectedUser}
        onSubmit={handleUserEdit}
      />
      <IonAlert
        isOpen={showDeleteModal}
        onDidDismiss={() => setShowDeleteModal(false)}
        backdropDismiss={!handlingRequest}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={["Cancel", { text: "Confirm", handler: () => handleUserDelete(selectedUser!) }]}
      />

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
              const value = e.target.value as "id" | "name";
              setSearchOptions({ ...searchOptions, searchBy: value });
            }}
          >
            <option value="name">Name</option>
            <option value="id">Id</option>
          </select>
        </section>
        <section>
          <label htmlFor="showParams">Status </label>
          <select
            name="showParams"
            id=""
            onChange={(e) => {
              const value = e.target.value as "all" | "public" | "private" | "reported" | "warning" | "banned";
              setSearchOptions({ ...searchOptions, show: value });
            }}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="reported">Reported</option>
            <option value="warning">Warned</option>
            <option value="banned">Banned</option>
          </select>
        </section>
      </article>
      <IonRow id="userRow">
        {data &&
          data.filter(filterData).map((userData: UserData) => (
            <UserColumn
              key={userData.id}
              userData={userData}
              onEditUserClick={() => {
                if (handlingRequest) return;
                setSelectedUser(userData);
                setShowEditModal(true);
              }}
              onDeleteUserClick={() => {
                if (handlingRequest) return;
                setSelectedUser(userData);
                setShowDeleteModal(true);
              }}
            />
          ))}
      </IonRow>
    </>
  );
};

export default UserManagement;
