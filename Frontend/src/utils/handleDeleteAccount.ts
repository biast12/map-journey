interface DeleteAccountProps {
  data: {
    id: string;
    avatar: string;
  };
  makeRequest: (url: string, method: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  clearUserDataToken: () => Promise<void>;
  history: any;
}
const handleDeleteAccount = async ({
  data,
  makeRequest,
  clearAuthToken,
  clearUserDataToken,
  history,
}: DeleteAccountProps) => {
  try {
    await makeRequest(`users/${data.id}`, "DELETE");
    await clearAuthToken();
    await clearUserDataToken();
    history.push("/");
  } catch (error) {
    console.error("Error deleting account:", error);
  }
};

export default handleDeleteAccount;
