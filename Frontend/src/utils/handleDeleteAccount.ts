import { useHistory } from "react-router-dom";
import useAuth from "../hooks/ProviderContext";
import useRequestData from "../hooks/useRequestData";

interface DeleteAccountProps {
  data: {
    id: string;
    avatar: string;
  };
}

const handleDeleteAccount = async ({ data }: DeleteAccountProps) => {
  const history = useHistory();
  const { clearAuthToken, clearRoleToken } = useAuth();
  const { makeRequest } = useRequestData();

  try {
    await makeRequest(`users/${data.id}`, "DELETE");
    await clearAuthToken();
    await clearRoleToken();
    history.push("/");
  } catch (error) {
    console.error("Error deleting account:", error);
  }
};

export default handleDeleteAccount;
