import { useHistory } from "react-router-dom";
import useAuth from "./ProviderContext";
import useRequestData from "./useRequestData";
import useImageHandler from "./useImageHandler";

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
  const { removeImage } = useImageHandler();

  try {
    await makeRequest(`users/${data.id}`, "DELETE");
    if (
      !(
        data.avatar ===
        "https://ezjagphpkkbghjkxczwk.supabase.co/storage/v1/object/sign/assets/ProfileG5.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhc3NldHMvUHJvZmlsZUc1LnBuZyIsImlhdCI6MTczMDc5NjI5NCwiZXhwIjoxNzYyMzMyMjk0fQ.GBRbr_PMqO19m21c43HGX_L5NKxBdcpo6a6UQdwkXLA&t=2024-11-05T08%3A44%3A54.995Z"
      )
    ) {
      await removeImage(data.avatar);
    }
    await clearAuthToken();
    await clearRoleToken();
    history.push("/");
  } catch (error) {
    console.error("Error deleting account:", error);
  }
};

export default handleDeleteAccount;
