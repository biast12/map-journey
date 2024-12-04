import React, { createContext, useContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

interface ProviderContextProps {
  userID: string | null;
  role: string | null;
  loading: boolean;
  storeAuthToken: (token: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  storeRoleToken: (token: string) => Promise<void>;
  clearRoleToken: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextProps | undefined>(
  undefined
);

export const ProviderContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userID, setUserID] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
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

  /* Role */
  const storeRoleToken = async (token: string) => {
    try {
      await Preferences.set({ key: "roleToken", value: token });
      setRole(token);
    } catch (error) {
      console.error("Failed to store role token", error);
    }
  };

  const clearRoleToken = async () => {
    try {
      await Preferences.remove({ key: "roleToken" });
      setRole(null);
    } catch (error) {
      console.error("Failed to clear role token", error);
    }
  };

  const getRoleToken = async () => {
    try {
      const { value } = await Preferences.get({ key: "roleToken" });
      return value;
    } catch (error) {
      console.error("Failed to get role token", error);
      return null;
    }
  };

  useEffect(() => {
    async function initialize() {
      try {
        const authToken = await getAuthToken();
        if (authToken) setUserID(authToken);
        const roleToken = await getRoleToken();
        if (roleToken) setRole(roleToken);
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
    role,
    loading,
    storeAuthToken,
    clearAuthToken,
    storeRoleToken,
    clearRoleToken,
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
