import { useState } from "react";
import { IonToast } from "@ionic/react";
import { checkmarkCircleOutline, alertCircle } from "ionicons/icons";
import "./Toast.scss";

type ToastType = "error" | "warning" | "success" | "default";

let showToastMessage: (message: string, type?: ToastType) => void;

const Toast = () => {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<ToastType>("default");

  showToastMessage = (message: string, type?: ToastType) => {
    setToastMessage(message);
    type && setToastType(type);
    setShowToast(true);
  };

  return (
    <IonToast
      isOpen={showToast}
      onDidDismiss={() => setShowToast(false)}
      message={toastMessage}
      icon={toastType === "success" ? checkmarkCircleOutline : alertCircle}
      position="middle"
      swipeGesture="vertical"
      text-wrap={true}
      className={`custom-toast ${toastType}-toast`}
      duration={5000}
      buttons={[
        {
          text: "Dismiss",
          role: "cancel",
        },
      ]}
    />
  );
};

export { showToastMessage };
export default Toast;
