import React, { createContext, useContext, useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

interface AuthContextProps {
  userID: string | null;
  loading: boolean;
  storeToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  return (
    <AuthContext.Provider value={{ userID, loading, storeToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
