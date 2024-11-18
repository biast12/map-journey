"use client";
import { FormEvent, useEffect, useState } from "react";
import { IonButton, IonRow } from "@ionic/react";

import useRequestData from "../../hooks/useRequestData";
import UserColumn from "./UserColumn";
import Modal from "../Modal";

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

  function handleUserEdit(e: FormEvent , userData: UserData) {
    //Perform edit request based changes to their original data
    
    setShowEditModal(false)
    setSelectedUser(null)
  }
  function handleUserDelete(userData: UserData) {
    //Perform delete request
    //Update user list according to response

    setShowDeleteModal(false)
    setSelectedUser(null)
  }

  useEffect(() => {
    makeRequest("users/all");
  }, []);

  return (
    <>
      <Modal isOpen={showEditModal} onCloseModal={() => setShowEditModal(false)}>
        {selectedUser && Object.entries(selectedUser).map((value)=><p>{value.join(": ")}</p>)}
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
