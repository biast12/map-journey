import { Dispatch, FormEvent, SetStateAction } from "react";
import Modal from "../Modal";
import "./EditUserModal.scss";
import { IonButton } from "@ionic/react";

type EditUserProps = {
    showModal: boolean,
    setShowModal: Dispatch<SetStateAction<boolean>>,
    userData?: UserData | null,
    onSubmit: (e: FormEvent, userData: UserData) => void,
}

const EditUserModal = ({showModal, setShowModal, userData, onSubmit}: EditUserProps) => {
  return (
    <Modal isOpen={showModal} onCloseModal={() => setShowModal(false)}>
      {userData && (
        <section id="editUserModal">
          <h3>Edit user</h3>
          <div>
            <figure>
              <img src={userData.banner} alt="User banner" />
            </figure>
            <figure>
              <img src={userData.avatar} alt="User avatar" />
            </figure>
          </div>
          <form onSubmit={(e) => onSubmit(e, userData)}>
            <label htmlFor="username">Name:</label>
            <input name="username" type="text" placeholder="Name" required defaultValue={userData.name} />
            <label htmlFor="userrole">Role:</label>
            <select defaultValue={userData.role} name="userrole" id="">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <label htmlFor="status">Status:</label>
            <select defaultValue={userData.status} name="status" id="">
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
  );
};

export default EditUserModal;
