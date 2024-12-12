import React, { createContext, useContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

interface ProviderContextProps {
  userID: string | null;
  userData: UserData | null;
  loading: boolean;
  storeAuthToken: (token: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  storeUserDataToken: (token: UserData) => Promise<void>;
  clearUserDataToken: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextProps | undefined>(
  undefined
);

export const ProviderContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userID, setUserID] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
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

  /* userData */
  const storeUserDataToken = async (token: UserData) => {
    try {
      const tokenString = JSON.stringify(token);
      await Preferences.set({ key: "userDataToken", value: tokenString });
      setUserData(token);
    } catch (error) {
      console.error("Failed to store userData token", error);
    }
  };

  const clearUserDataToken = async () => {
    try {
      await Preferences.remove({ key: "userDataToken" });
      setUserData(null);
    } catch (error) {
      console.error("Failed to clear userData token", error);
    }
  };

  const getUserDataToken = async () => {
    try {
      const { value } = await Preferences.get({ key: "userDataToken" });
      if (value) {
        return JSON.parse(value) as UserData;
      }
      return null;
    } catch (error) {
      console.error("Failed to get userData token", error);
      return null;
    }
  };

  useEffect(() => {
    async function initialize() {
      try {
        const authToken = await getAuthToken();
        if (authToken) setUserID(authToken);
        const userDataToken = await getUserDataToken();
        if (userDataToken) setUserData(userDataToken);
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
    userData,
    loading,
    storeAuthToken,
    clearAuthToken,
    storeUserDataToken,
    clearUserDataToken,
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

export default useAuth;
