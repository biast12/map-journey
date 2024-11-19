"use client";
import { FormEvent, useEffect, useState } from "react";
import { IonButton, IonRow } from "@ionic/react";

import useRequestData from "../../hooks/useRequestData";
import UserColumn from "./UserColumn";
import Modal from "../Modal";

import "./UserManagement.scss"

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
  const { data: allUsers, error, isLoading, makeRequest } = useRequestData();

  const [selectedUser, setSelectedUser] = useState<null | UserData>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  function handleUserEdit(e: FormEvent, userData: UserData) {
    //Perform edit request based changes to their original data
    setShowEditModal(false);
    setSelectedUser(null);
  }
  function handleUserDelete(userData: UserData) {
    //Perform delete request
    //Update user list according to response

    setShowDeleteModal(false);
    setSelectedUser(null);
  }

  useEffect(() => {
    makeRequest("users/all");
  }, []);

  return (
    <>
      <Modal isOpen={showEditModal} onCloseModal={() => setShowEditModal(false)}>
        {selectedUser && (
          <section id="editUserModal">
            <h3>Edit user</h3>
            <figure>
              <img src={selectedUser.banner} alt="User banner" />
            </figure>
            <figure>
              <img src={selectedUser.avatar} alt="User avatar" />
            </figure>
            <form>
              <input name="name" type="text" placeholder="Name" required defaultValue={selectedUser.name} />
              <select name="role" id="">
                <option selected={selectedUser.role === "user"} value="user">
                  User
                </option>
                <option selected={selectedUser.role === "admin"} value="admin">
                  Admin
                </option>
              </select>
              <select name="status" id="">
                <option selected={selectedUser.status === "public"} value="public">
                  Public
                </option>
                <option selected={selectedUser.status === "private"} value="private">
                  Private
                </option>
                <option selected={selectedUser.status === "reported"} value="reported">
                  Reported
                </option>
              </select>
            </form>
          </section>
        )}
      </Modal>
      <Modal isOpen={showDeleteModal} onCloseModal={() => setShowDeleteModal(false)}>
        {selectedUser && <IonButton onClick={() => handleUserDelete(selectedUser)}>Are you sure?</IonButton>}
      </Modal>
      <IonRow id="userRow">
        {allUsers &&
          allUsers.map((userData: UserData) => (
            <UserColumn
              key={userData.id}
              userData={userData}
              onEditUserClick={() => {
                setSelectedUser(userData);
                setShowEditModal(true);
              }}
              onDeleteUserClick={() => {
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
