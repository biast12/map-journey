import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

const useAuth = () => {
  const [userID, setUserID] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<string>("");

  const storeToken = async (token: string) => {
    await Preferences.set({ key: "authToken", value: token });
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
    setUserID(parseInt(decodedToken.sub)); // Extract user ID from token
    setUserStatus(decodedToken.role || "user"); // Set user role from token or default to "user"
  };

  const clearToken = async () => {
    await Preferences.remove({ key: "authToken" });
    setUserID(null);
    setUserStatus("");
  };
  
  const getToken = async () => {
    const { value } = await Preferences.get({ key: "authToken" });
    return value;
  };

  useEffect(() => {
    async function checkAuthStatus() {
      const token = await getToken();
      if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setUserID(parseInt(decodedToken.sub));
        setUserStatus(decodedToken.role || "user");
      }
    }
    checkAuthStatus();
  }, []);

  return { userID, userStatus, storeToken, clearToken };
};

export default useAuth;