import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

const useAuth = () => {
  const [userID, setUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const storeToken = async (token: string) => {
    await Preferences.set({ key: "authToken", value: token });
    setUserID(token);
  };

  const clearToken = async () => {
    await Preferences.remove({ key: "authToken" });
    setUserID(null);
  };

  const getToken = async () => {
    const { value } = await Preferences.get({ key: "authToken" });
    return value;
  };

  useEffect(() => {
    async function checkAuthStatus() {
      const token = await getToken();
      if (token) {
        setUserID(token);
      }
      setLoading(false);
    }

    checkAuthStatus();
  }, []);

  return { userID, loading, storeToken, clearToken };
};

export default useAuth;
