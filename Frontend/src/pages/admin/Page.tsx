import { IonContent, IonGrid, IonRow } from "@ionic/react";
import { MouseEvent } from "react";
import UserColumn from "../../components/admin/UserColumn";

import "./Page.scss";

const TEMP_USER_DATA = [
  {
    name: "Emil",
    id: "91c90bd3-1560-4e31-a978-49e27597bc6f",
    role: "admin",
    status: "public",
    reports: 31,
  },
  {
    name: "John",
    id: "91c903d3-1560-1234-9340-adgosndosidf",
    role: "default",
    status: "public",
    reports: 0,
  },
  {
    name: "Deer",
    id: "12345678-1560-4e31-a978-49e27597bc6f",
    role: "default",
    status: "private",
    reports: 4,
  },
  {
    name: "Emil",
    id: "91c90bd3-1560-4e31-a978-49e27597bc6f",
    role: "admin",
    status: "public",
    reports: 31,
  },
  {
    name: "John",
    id: "91c903d3-1560-1234-9340-adgosndosidf",
    role: "default",
    status: "public",
    reports: 0,
  },
  {
    name: "Deer",
    id: "12345678-1560-4e31-a978-49e27597bc6f",
    role: "default",
    status: "private",
    reports: 4,
  },
];

const Page = () => {
  function handleEditUser(e: MouseEvent, userData: any) { //Add actual type
    //Open modal for adjusting userdata as a form, and once done you can press "save" that sends a POST request.
    //If the request was successful, update the user with the new changes.
  } 
  function handleDeleteUser(e: MouseEvent, userData: any) {
    //Open confirmation prompt as a level of protection against accidents
  }

  return (
    <IonContent>
      <IonGrid>
        <h1>Dashboard</h1>

        <h3>Users</h3>
        <IonRow id="userRow">
          {TEMP_USER_DATA.map((userData) => (
            <UserColumn
              key={userData.id}
              userData={userData}
              onEditUserClick={handleEditUser}
              onDeleteUserClick={handleDeleteUser}
            />
          ))}
        </IonRow>

        <h3>Reports</h3>
        <IonRow id="reportsRow">

        </IonRow>

        <h3>News</h3>
        <IonRow id="newsRow">
          
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default Page;
