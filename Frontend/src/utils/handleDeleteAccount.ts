interface DeleteAccountProps {
  userID: string;
  makeRequest: (url: string, method: string) => Promise<void>;
  clearUserDataToken: () => Promise<void>;
  history: any;
}
const handleDeleteAccount = async ({
  userID,
  makeRequest,
  clearUserDataToken,
  history,
}: DeleteAccountProps) => {
  try {
    await makeRequest(`users/${userID}`, "DELETE");
    await clearUserDataToken();
    history.push("/");
  } catch (error) {
    console.error("Error deleting account:", error);
  }
};

export default handleDeleteAccount;
