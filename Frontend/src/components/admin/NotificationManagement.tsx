import { IonAlert, IonButton, IonCol, IonRow } from "@ionic/react";
import "./NotificationManagement.scss";
import useRequestData from "../../hooks/useRequestData";
import { FormEvent, MouseEvent, useEffect, useState } from "react";
import useAuth from "../../hooks/ProviderContext";
import NotificationColumn from "./NotificationColumn";
import Loader from "../Loader";

type NotificationData = {
  date: string;
  id: number;
  text: string;
  title: string;
};

const NotificationManagement = () => {
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationData | null>(null);
  const { data, error, isLoading, makeRequest } = useRequestData();
  const { data: createData, error: createError, isLoading: createIsLoading, makeRequest: createMakeRequest} = useRequestData();
  const { data: delData, error: delError, isLoading: delIsLoading, makeRequest: delMakeRequest} = useRequestData();

  const { userID } = useAuth();

  async function handleCreateNews(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const body = {
        title: form.newsTitle.value,
        text: form.newsText.value
    }

    await createMakeRequest(`notification/${userID}`, "POST", undefined, body)

    setShowDeleteAlert(false)
    setSelectedNotif(null)
    makeRequest("notification/all/" + userID);
  }

  async function handleDeleteNews(notifData: NotificationData) {
    await delMakeRequest(`notification/${userID}/${notifData.id}`, "DELETE")
    makeRequest("notification/all/" + userID);
  }

  useEffect(() => {
    makeRequest("notification/all/" + userID);
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
      <>
      {createIsLoading && <Loader />}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Are you sure?"
        message="Deleting is a permanent action!"
        buttons={["Cancel", { text: "Confirm", handler: () => handleDeleteNews(selectedNotif!) }]}
      />
      <IonRow>
        <IonCol id="notifFormColumn" size="12">
          <h5>Create news</h5>
          <form action="" onSubmit={handleCreateNews}>
            <input name="newsTitle" type="text" placeholder="Title" />
            <textarea name="newsText"  placeholder="Text" />
            <IonButton type="submit">Create</IonButton>
          </form>
          {createData && !createIsLoading && <p className="successText">Successfully created news!</p>}
        </IonCol>
        <IonCol size="12">
          <IonRow id="notifRow">
            {data &&
              data.map((notifData: NotificationData) => (
                <NotificationColumn
                  onDeleteUserClick={() => {
                    setSelectedNotif(notifData);
                    setShowDeleteAlert(true);
                  }}
                  notifData={notifData}
                />
              ))}
          </IonRow>
        </IonCol>
      </IonRow>
    </>
  );
};

export default NotificationManagement;
