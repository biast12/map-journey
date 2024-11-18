import { MouseEvent, useEffect } from "react";
import { IonRow } from "@ionic/react";

import useRequestData from "../../hooks/useRequestData";
import UserColumn from "./UserColumn";

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
  function handleEditUser(e: MouseEvent, userData: UserData) {
    //Add actual type
    //Open modal for adjusting userdata as a form, and once done you can press "save" that sends a POST request.
    //If the request was successful, update the user with the new changes.
  }
  function handleDeleteUser(e: MouseEvent, userData: UserData) {
    //Open confirmation prompt as a level of protection against accidents
  }

  const { data, error, isLoading, makeRequest } = useRequestData();

  useEffect(() => {
    makeRequest("users/all");
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <IonRow id="userRow">
      {data &&
        data.map((userData: UserData) => (
          <UserColumn
            key={userData.id}
            userData={userData}
            onEditUserClick={handleEditUser}
            onDeleteUserClick={handleDeleteUser}
          />
        ))}
    </IonRow>
  );
};

export default UserManagement;
