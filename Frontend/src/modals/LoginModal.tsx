"use client"
import { IonButton, IonInput, IonInputPasswordToggle, IonToast } from "@ionic/react";
import { FormEvent, useRef, useState } from "react";
import useRequestData from "../hooks/useRequestData";
import "./LoginModal.scss";

const LoginModal = () => {
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [canDismiss, setCanDismiss] = useState<boolean>(true);
  const toast = useRef<HTMLIonToastElement>(null);
  const { makeRequest, isLoading, data, error } = useRequestData();

  async function handleLogin(formEvent: FormEvent) {
    formEvent.preventDefault();

    // Disable backdropDismiss while handling request
    setCanDismiss(false);

    const formData = new FormData(formEvent.target as HTMLFormElement);
    const email = formData.get("email");
    const password = formData.get("password");

    await makeRequest("users/login", "POST", { "Content-Type": "application/json" }, { email, password });

    if (!error && data) {
      setLoginSuccess(true);
      toast.current?.present();
    } else {
      setLoginSuccess(false);
    }

    setTimeout(() => {
      setCanDismiss(true);
    }, 1500);
  }

  return (
    <div className="loginWrapper">
      <h1>Login</h1>
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
      <IonToast ref={toast} message="Login successful" position="bottom" duration={1500}></IonToast>
    </div>
  );
};

export default LoginModal;