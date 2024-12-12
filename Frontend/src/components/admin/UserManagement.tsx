"use client";
import { FormEvent, useEffect, useState } from "react";
import { IonAlert, IonCol, IonRow } from "@ionic/react";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import EditUserModal from "../modals/EditUserModal";
import Toast, { showToastMessage } from "../Toast";
import UserColumn from "./UserColumn";
import Loader from "../Loader";

import "./UserManagement.scss";

type UserSearchOptions = {
  search: string;
  searchBy: "id" | "name";
  sortBy: "id" | "name";
  role: "all" | "user" | "admin";
  status: "all" | "public" | "private" | "reported" | "warning" | "banned";
};

const UserManagement = () => {
  const { makeRequest, data, isLoading } = useRequestData();
  const { makeRequest: delMakeRequest, isLoading: delIsLoading } = useRequestData();
  const { makeRequest: editMakeRequest, isLoading: editIsLoading } = useRequestData();

  const [selectedUser, setSelectedUser] = useState<null | UserData>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [handlingRequest, setHandlingRequest] = useState<boolean>(false);
  const [searchOptions, setSearchOptions] = useState<UserSearchOptions>({
    search: "",
    searchBy: "name",
    sortBy: "name",
    role: "all",
    status: "all",
  });

  const { userID } = useAuth();

  async function handleUserEdit(e: FormEvent, userData: UserData) {
    setHandlingRequest(true);
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const body = {
      name: form.username.value,
      role: form.userrole.value,
      status: form.status.value,
    };

    try {
      await editMakeRequest(`users/${userID}/${userData?.id}`, "PUT", undefined, body);
      await makeRequest(`users/all/${userID}`);

      setShowEditModal(false);
      setSelectedUser(null);
      setHandlingRequest(false);
    } catch (error) {
      showToastMessage("Failed to edit user", "error");
    }
  }
  async function handleUserDelete(userData: UserData) {
    setHandlingRequest(true);

    try {
      await delMakeRequest(`users/${userData?.id}`, "DELETE");
      await makeRequest(`users/all/${userID}`);

      setShowDeleteModal(false);
      setSelectedUser(null);
      setHandlingRequest(false);
    } catch (error) {
      showToastMessage("Failed to delete user", "error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await makeRequest(`users/all/${userID}`);
      } catch (error) {
        showToastMessage("Failed to fetch user data", "error");
      }
    };

    fetchData();
  }, []);

  function filterData(userData: UserData) {
    if (
      (searchOptions.role !== "all" && userData?.role !== searchOptions.role) ||
      (searchOptions.status !== "all" &&
        userData?.status !== searchOptions.status) ||
      userData?.id === userID
    ) {
      return false;
    }

    if (searchOptions.search === "") {
      return true;
    } else {
      return userData[searchOptions.searchBy]
        .toString()
        .toLowerCase()
        .match(
          searchOptions.search
            .toLowerCase()
            .replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        );
    }
  }

  return (
    <>
      {delIsLoading || editIsLoading && <Loader />}
      <Toast />
      {selectedUser && (
        <EditUserModal
          userData={selectedUser}
          showModal={showEditModal}
          setShowModal={setShowEditModal}
          onSubmit={handleUserEdit}
        />
      )}
      <IonAlert
        isOpen={showDeleteModal}
        onDidDismiss={() => setShowDeleteModal(false)}
        backdropDismiss={!handlingRequest}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={[
          "Cancel",
          { text: "Confirm", handler: () => handleUserDelete(selectedUser!) },
        ]}
      />

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
              const value = e.target.value as "id" | "name";
              setSearchOptions({ ...searchOptions, searchBy: value });
            }}
          >
            <option value="name">Name</option>
            <option value="id">Id</option>
          </select>
        </IonCol>
        <IonCol>
          <label htmlFor="roleParams">Role </label>
          <select
            name="roleParams"
            title="Role"
            onChange={(e) => {
              const value = e.target.value as "all" | "user" | "admin";
              setSearchOptions({ ...searchOptions, role: value });
            }}
          >
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </IonCol>
        <IonCol>
          <label htmlFor="statusParams">Status </label>
          <select
            name="statusParams"
            title="Status"
            onChange={(e) => {
              const value = e.target.value as
                | "all"
                | "public"
                | "private"
                | "reported"
                | "warning"
                | "banned";
              setSearchOptions({ ...searchOptions, status: value });
            }}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="reported">Reported</option>
            <option value="warning">Warned</option>
            <option value="banned">Banned</option>
          </select>
        </IonCol>
      </IonRow>
      <IonRow id="userRow">
        {data ? (
          data.filter(filterData).length === 0 ? (
            <p>No users found</p>
          ) : (
            data.filter(filterData).map((userData: UserData) => (
              <UserColumn
                key={userData?.id}
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

export default UserManagement;
