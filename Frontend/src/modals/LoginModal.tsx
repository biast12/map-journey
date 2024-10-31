import { IonCard, IonCardHeader, IonCardTitle, IonInput, IonInputPasswordToggle, IonButton, IonToast, IonModal, IonIcon } from "@ionic/react";
import { close } from "ionicons/icons";
import { FormEvent, useRef, useState } from "react";
import useRequestData from "../hooks/useRequestData";
import useAuth from "../hooks/useAuth";
import "./LoginModal.scss";

/* Modal */
import CreateUserModal from "../modals/CreateUserModal";

const LoginModal = () => {
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [createUserModal, setCreateUserModal] = useState(false);
  const toast = useRef<HTMLIonToastElement>(null);
  const { makeRequest, isLoading, data, error } = useRequestData();
  const { storeToken } = useAuth();

  async function handleLogin(formEvent: FormEvent) {
    formEvent.preventDefault();

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    await makeRequest("users/login", "POST", { "Content-Type": "application/json" }, { email, password });

    if (!error && data) {
      setLoginSuccess(true);
      toast.current?.present();
      storeToken(data.token);
    } else {
      setLoginSuccess(false);
    }
  }

  const openCreateUserModal = () => setCreateUserModal(true);
  const closeCreateUserModal = () => setCreateUserModal(false);

  return (
    <IonCard className="loginWrapper">
      <IonCardHeader>
        <IonCardTitle>Login</IonCardTitle>
      </IonCardHeader>
      <form action="" onSubmit={handleLogin}>
        <IonInput id="emailInput" name="email" type="email" label="Email" labelPlacement="fixed" placeholder="Enter email here"></IonInput>
        <IonInput id="passwordInput" name="password" type="password" labelPlacement="fixed" label="Password" placeholder="Enter password here">
          <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
        </IonInput>
        {loginSuccess == false && <p id="loginFailed">Login failed! Check email or password</p>}
        <IonButton type="submit" id="loginButton" expand="block" disabled={isLoading}>
          Login
        </IonButton>
      </form>
      <IonButton id="createUserButton" expand="block" onClick={openCreateUserModal}>
        Create User
      </IonButton>
      <IonToast ref={toast} message="Login successful" position="bottom" duration={1500}></IonToast>
      <IonModal isOpen={createUserModal} onDidDismiss={closeCreateUserModal}>
        <div className="modal-content">
          <IonButton
          className="close-button"
          onClick={closeCreateUserModal}
          fill="clear"
          >
            <IonIcon icon={close} />
            </IonButton>
          <CreateUserModal onDidDismiss={closeCreateUserModal}/>
        </div>
      </IonModal>
    </IonCard>
  );
};

export default LoginModal;