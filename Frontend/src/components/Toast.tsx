import { useState } from "react";
import { IonToast } from "@ionic/react";
import { alertCircle } from "ionicons/icons";
import "./Toast.scss";

let showToastMessage: (message: string) => void;

const Toast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

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

export { showToastMessage };
export default Toast;
