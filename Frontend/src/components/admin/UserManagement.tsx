"use client";
import { FormEvent, useEffect, useState } from "react";
import { IonAlert, IonButton, IonRow } from "@ionic/react";

import useRequestData from "../../hooks/useRequestData";
import UserColumn from "./UserColumn";
import Modal from "../Modal";

import "./UserManagement.scss";
import useAuth from "../../hooks/ProviderContext";

type UserData = {
  avatar: string;
  banner: string;
  email: string;
  id: string;
  name: string;
  new_notifications: string[];
  news_count: number;
  role: "user" | "admin";
  settings_id: number;
  status: "public" | "private" | "reported";
};

type SearchOptions = {
  search: string;
  searchBy: "id" | "name" | "role" | "status";
  sortBy: "id" | "name" | "role" | "status";
};

const UserManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: delData, error: delError, isLoading: delIsLoading, makeRequest: delMakeRequest } = useRequestData();
  const { data: editData, error: editError, isLoading: editIsLoading, makeRequest: editMakeRequest } = useRequestData();

  const [selectedUser, setSelectedUser] = useState<null | UserData>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [handlingRequest, setHandlingRequest] = useState<boolean>(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({ search: "", searchBy: "name", sortBy: "name" });

  const {userID} = useAuth();

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
    makeRequest("users/all/"+userID);

    setShowEditModal(false);
    setSelectedUser(null);
    setHandlingRequest(false);
  }
  async function handleUserDelete(userData: UserData) {
    setHandlingRequest(true);

    const res = await delMakeRequest(`users/${userData.id}`, "DELETE");
    makeRequest("users/all/"+userID);

    setShowDeleteModal(false);
    setSelectedUser(null);
    setHandlingRequest(false);
  }

  useEffect(() => {
    makeRequest("users/all/"+userID);
  }, []);

  function filterData(userData: UserData) {
    if (searchOptions.search === "") {
      return true;
    }

    return userData[searchOptions.searchBy].toLowerCase().match(searchOptions.search.toLowerCase());
  }

  return (
    <>
      <Modal isOpen={showEditModal} onCloseModal={() => setShowEditModal(false)} backdropDismiss={!handlingRequest}>
        {selectedUser && (
          <section id="editUserModal">
            <h3>Edit user</h3>
            <div>
              <figure>
                <img src={selectedUser.banner} alt="User banner" />
              </figure>
              <figure>
                <img src={selectedUser.avatar} alt="User avatar" />
              </figure>
            </div>
            <form onSubmit={(e) => handleUserEdit(e, selectedUser)}>
              <label htmlFor="username">Name:</label>
              <input name="username" type="text" placeholder="Name" required defaultValue={selectedUser.name} />
              <label htmlFor="userrole">Role:</label>
              <select defaultValue={selectedUser.role} name="userrole" id="">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <label htmlFor="status">Status:</label>
              <select defaultValue={selectedUser.status} name="status" id="">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="reported">Reported</option>
              </select>
              <IonButton className="submitButton" type="submit">
                Save changes
              </IonButton>
            </form>
          </section>
        )}
      </Modal>
      <IonAlert
        isOpen={showDeleteModal}
        onDidDismiss={() => setShowDeleteModal(false)}
        backdropDismiss={!handlingRequest}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={["Cancel", {text: "Confirm", handler: () => handleUserDelete(selectedUser!)}]}
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
              const value = e.target.value as "id" | "name" | "role" | "status";
              setSearchOptions({ ...searchOptions, searchBy: value });
            }}
          >
            <option value="name">Name</option>
            <option value="id">Id</option>
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
