import React from "react";
import { IonToast } from "@ionic/react";
import { alertCircle } from "ionicons/icons";
import "./Toast.scss";

interface ToastProps {
  showToast: boolean;
  toastMessage: string;
  setShowToast: (value: boolean) => void;
}

const Toast: React.FC<ToastProps> = ({
  showToast,
  toastMessage,
  setShowToast,
}) => {
  return (
    <>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        icon={alertCircle}
        position="middle"
        swipeGesture="vertical"
        text-wrap={true}
        className="custom-toast"
        duration={5000}
        buttons={[
          {
            text: "Dismiss",
            role: "cancel",
          },
        ]}
      />
    </>
  );
};

export default Toast;
