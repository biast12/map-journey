import { FormEvent, useEffect, useState } from "react";
import { IonAlert, IonButton, IonCol, IonRow } from "@ionic/react";

/* Hooks */
import useRequestData from "../../hooks/useRequestData";
import useAuth from "../../hooks/ProviderContext";

/* Components */
import NotificationColumn from "./NotificationColumn";
import Toast, { showToastMessage } from "../Toast";
import Loader from "../Loader";

import "./NotificationManagement.scss";

type NotificationSearchOptions = {
  search: string;
  searchBy: "title" | "text" | "id";
};

const NotificationManagement = () => {
  const [searchOptions, setSearchOptions] = useState<NotificationSearchOptions>({
    search: "",
    searchBy: "title",
  });
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationData | null>(null);
  const { makeRequest, data, isLoading } = useRequestData();
  const {
    makeRequest: createMakeRequest,
    data: createData,
    error: createError,
    isLoading: createIsLoading
  } = useRequestData();
  const { makeRequest: delMakeRequest, isLoading: delIsLoading } = useRequestData();

  const { userID } = useAuth();

  async function handleCreateNews(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const body = {
      title: form.newsTitle.value,
      text: form.newsText.value,
    };

    try {
      await createMakeRequest(`notification/${userID}`, "POST", undefined, body);

      setShowDeleteAlert(false);
      setSelectedNotif(null);
      await makeRequest("notification/all/" + userID);
    } catch (error) {
      showToastMessage("Failed to create news", "error");
    }
  }

  async function handleDeleteNews(notifData: NotificationData) {
    try {
      await delMakeRequest(`notification/${userID}/${notifData.id}`, "DELETE");
      await makeRequest("notification/all/" + userID);
    } catch (error) {
      showToastMessage("Failed to delete news", "error");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await makeRequest("notification/all/" + userID);
      } catch (error) {
        showToastMessage("Failed to fetch news", "error");
      }
    };
  
    fetchData();
  }, []);

  return (
    <>
      {createIsLoading || delIsLoading && <Loader />}
      <Toast />
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
            <textarea name="newsText" placeholder="Text" />
            <IonButton type="submit">Create</IonButton>
          </form>
          {createData && !createIsLoading && <p className="successText">Successfully created news!</p>}
          {createError && !createIsLoading && <p className="errorText">Failed to create news!</p>}
        </IonCol>
        <IonCol size="12">
          <IonRow>
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
                  title="searchBy"
                  onChange={(e) => {
                    const value = e.target.value as "title" | "text";
                    setSearchOptions({ ...searchOptions, searchBy: value });
                  }}
                >
                  <option value="title">Title</option>
                  <option value="text">Text</option>
                  <option value="id">Id</option>
                </select>
              </section>
            </article>
          </IonRow>
          <IonRow id="notifRow">
            {data ? (
              data
                .sort((a: NotificationData, b: NotificationData) => b.id - a.id)
                .filter((notifData: NotificationData) => {
                  if (searchOptions.search === "") {
                    return true;
                  } else {
                    return notifData[searchOptions.searchBy]
                      .toString()
                      .toLowerCase()
                      .match(searchOptions.search.toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
                  }
                })
                .map((notifData: NotificationData) => (
                  <NotificationColumn
                    key={notifData.id}
                    onDeleteUserClick={() => {
                      setSelectedNotif(notifData);
                      setShowDeleteAlert(true);
                    }}
                    notifData={notifData}
                  />
                ))
            ) : (
              isLoading ? <p>Loading...</p> : <p>No data</p>
            )}
          </IonRow>
        </IonCol>
      </IonRow>
    </>
  );
};

export default NotificationManagement;
