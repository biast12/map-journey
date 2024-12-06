interface DeleteAccountProps {
  data: {
    id: string;
    avatar: string;
  };
  makeRequest: (url: string, method: string) => Promise<void>;
  removeImage: (fileName: string) => void;
  clearAuthToken: () => Promise<void>;
  clearRoleToken: () => Promise<void>;
  history: any;
}

const handleDeleteAccount = async ({
  data,
  makeRequest,
  removeImage,
  clearAuthToken,
  clearRoleToken,
  history,
}: DeleteAccountProps) => {
  try {
    await makeRequest(`users/${data.id}`, "DELETE");
    if (
      data.avatar !==
      "https://ezjagphpkkbghjkxczwk.supabase.co/storage/v1/object/sign/assets/ProfileG5.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhc3NldHMvUHJvZmlsZUc1LnBuZyIsImlhdCI6MTczMDc5NjI5NCwiZXhwIjoxNzYyMzMyMjk0fQ.GBRbr_PMqO19m21c43HGX_L5NKxBdcpo6a6UQdwkXLA&t=2024-11-05T08%3A44%3A54.995Z"
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
