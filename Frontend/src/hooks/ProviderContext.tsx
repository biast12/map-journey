import React, { createContext, useContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

interface ProviderContextProps {
  userID: string | null;
  notificationsStatus: boolean | null;
  loading: boolean;
  storeAuthToken: (token: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  storeNotificationsStatusToken: (token: boolean) => Promise<void>;
  clearNotificationsStatusToken: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextProps | undefined>(
  undefined
);

export const ProviderContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userID, setUserID] = useState<string | null>(null);
  const [notificationsStatus, setNotificationsStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  /* Auth */
  const storeAuthToken = async (token: string) => {
    try {
      await Preferences.set({ key: "authToken", value: token });
      setUserID(token);
    } catch (error) {
      console.error("Failed to store auth token", error);
    }
  };

  const clearAuthToken = async () => {
    try {
      await Preferences.remove({ key: "authToken" });
      setUserID(null);
    } catch (error) {
      console.error("Failed to clear auth token", error);
    }
  };

  const getAuthToken = async () => {
    try {
      const { value } = await Preferences.get({ key: "authToken" });
      return value;
    } catch (error) {
      console.error("Failed to get auth token", error);
      return null;
    }
  };

  /* Notifications Status */
  const storeNotificationsStatusToken = async (token: boolean) => {
    try {
      await Preferences.set({ key: "notificationsStatusToken", value: token.toString() });
      setNotificationsStatus(token);
    } catch (error) {
      console.error("Failed to store notifications status token", error);
    }
  };

  const clearNotificationsStatusToken = async () => {
    try {
      await Preferences.remove({ key: "notificationsStatusToken" });
      setNotificationsStatus(null);
    } catch (error) {
      console.error("Failed to clear notifications status token", error);
    }
  };

  const getNotificationsStatusToken = async () => {
    try {
      const { value } = await Preferences.get({ key: "notificationsStatusToken" });
      return value === "true";
    } catch (error) {
      console.error("Failed to get notifications status token", error);
      return null;
    }
  };

  useEffect(() => {
    async function initialize() {
      try {
        const [authToken, notificationsStatusToken] = await Promise.all([
          getAuthToken(),
          getNotificationsStatusToken(),
        ]);
        if (authToken) setUserID(authToken);
        if (notificationsStatus !== null) setNotificationsStatus(notificationsStatus);
      } catch (error) {
        console.error("Failed to initialize tokens", error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  const contextValue = {
    userID,
    notificationsStatus,
    loading,
    storeAuthToken,
    clearAuthToken,
    storeNotificationsStatusToken,
    clearNotificationsStatusToken,
  };

  return (
    <ProviderContext.Provider value={contextValue}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a ProviderContextProvider");
  }
  return context;
};

export const useNotificationsStatus = () => {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationsStatus must be used within a ProviderContextProvider"
    );
  }
  return context;
};

export default useAuth;