import { useRef, useState, FormEvent } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonInput,
  IonInputPasswordToggle,
  IonToast,
} from "@ionic/react";
import useRequestData from "../hooks/useRequestData";
import "./CreateUserModal.scss";

interface CreateUserProps {
  closeCreateUserModal: () => void;
  closeLoginModal: () => void;
}

const CreateUserModal: React.FC<CreateUserProps> = ({
  closeCreateUserModal,
  closeLoginModal,
}) => {
  const [createSuccess, setCreateSuccess] = useState<boolean | null>(null);
  const toast = useRef<HTMLIonToastElement>(null);
  const { makeRequest, isLoading, data, error } = useRequestData();

  async function handleCreateUser(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    await makeRequest(
      "users",
      "POST",
      { "Content-Type": "application/json" },
      { name, email, password }
    );

    if (!error && data) {
      setCreateSuccess(true);
      toast.current?.present();
      closeCreateUserModal();
      closeLoginModal();
    } else {
      setCreateSuccess(false);
    }
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Create User</IonCardTitle>
      </IonCardHeader>
      <form action="" onSubmit={handleCreateUser}>
        <IonInput
          required
          id="nameInput"
          name="name"
          type="text"
          label="Name"
          labelPlacement="fixed"
          placeholder="Enter name here"
        ></IonInput>
        <IonInput
          required
          id="emailInput"
          name="email"
          type="email"
          label="Email"
          labelPlacement="fixed"
          placeholder="Enter email here"
        ></IonInput>
        <IonInput
          required
          id="passwordInput"
          name="password"
          type="password"
          labelPlacement="fixed"
          label="Password"
          placeholder="Enter password here"
        >
          <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
        </IonInput>
        {createSuccess === false && (
          <p id="createFailed">User creation failed! Check the inputs</p>
        )}
        <IonButton
          type="submit"
          id="createButton"
          expand="block"
          disabled={isLoading}
        >
          Create User
        </IonButton>
      </form>
      <IonButton
        id="closeButton"
        expand="block"
        color="medium"
        onClick={closeCreateUserModal}
      >
        Close
      </IonButton>
      <IonToast
        ref={toast}
        message="User created successfully"
        position="bottom"
        duration={1500}
      ></IonToast>
    </IonCard>
  );
};

export default CreateUserModal;
