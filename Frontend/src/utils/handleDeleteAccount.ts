interface DeleteAccountProps {
  data: {
    id: string;
    avatar: string;
  };
  makeRequest: (url: string, method: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  clearRoleToken: () => Promise<void>;
  history: any;
}
const handleDeleteAccount = async ({
  data,
  makeRequest,
  clearAuthToken,
  clearRoleToken,
  history,
}: DeleteAccountProps) => {
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
