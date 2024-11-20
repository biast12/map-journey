"use client";
import { FormEvent, useEffect, useState } from "react";
import { IonButton, IonRow } from "@ionic/react";

import useRequestData from "../../hooks/useRequestData";
import UserColumn from "./UserColumn";
import Modal from "../Modal";

import "./UserManagement.scss";

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

const UserManagement = () => {
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: delData, error: delError, isLoading: delIsLoading, makeRequest: delMakeRequest } = useRequestData();
  const { data: editData, error: editError, isLoading: editIsLoading, makeRequest: editMakeRequest} = useRequestData();

  const [selectedUser, setSelectedUser] = useState<null | UserData>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [handlingRequest, setHandlingRequest] = useState<boolean>(false);

  async function handleUserEdit(e: FormEvent, userData: UserData) {
    setHandlingRequest(true);
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    const body = {
      name: form.username.value,
      status: form.status.value,
      role: form.userrole.value
    }

    const res = await editMakeRequest(`users/${userData.id}`, "PUT", undefined, body)

    //LACKS AN UPDATE TO LIST

    setShowEditModal(false);
    setSelectedUser(null);
    setHandlingRequest(false);
  }
  async function handleUserDelete(userData: UserData) {
    setHandlingRequest(true);

    const res = await delMakeRequest(`users/${userData.id}`, "DELETE");
    makeRequest("users/all");

    setShowDeleteModal(false);
    setSelectedUser(null);
    setHandlingRequest(false);
  }

  useEffect(() => {
    makeRequest("users/all");
  }, []);

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
      <Modal id="deleteUserModal" isOpen={showDeleteModal} onCloseModal={() => setShowDeleteModal(false)} backdropDismiss={!handlingRequest}>
        {selectedUser && <IonButton onClick={() => handleUserDelete(selectedUser)}>Are you sure?</IonButton>}
      </Modal>

      <IonRow id="userRow">
        {data &&
          data.map((userData: UserData) => (
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
