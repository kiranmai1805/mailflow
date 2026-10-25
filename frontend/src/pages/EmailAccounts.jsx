
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://mailflow-gh75.onrender.com";

export default function EmailAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/email-accounts/`,
        { withCredentials: true }
      );

      setAccounts(response.data);
    } catch (error) {
      console.error(
        "Failed to load email accounts:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleDelete = async (account) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect ${account.email}?`
    );

    if (!confirmed) return;

    try {
      const endpoint =
        account.account_type === "google"
          ? `${API_URL}/email-accounts/google/${account.id}`
          : `${API_URL}/email-accounts/${account.id}`;

      await axios.delete(endpoint, {
        withCredentials: true,
      });

      await loadAccounts();

      alert("Email account disconnected successfully!");
    } catch (error) {
      console.error(
        "Failed to remove email account:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to remove email account"
      );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Email Accounts
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the email accounts connected to MailFlow.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">
            Loading email accounts...
          </p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <h2 className="text-lg font-semibold">
            No email accounts connected
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Connect a Google account or add an SMTP account
            to start sending campaigns.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={`${account.account_type}-${account.id}`}
              className="flex items-center justify-between rounded-lg border p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">
                    {account.email}
                  </h3>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {account.provider}
                  </span>
                </div>

                <p className="mt-1 text-sm text-green-600">
                  ● Connected
                </p>
              </div>

              <button
                onClick={() => handleDelete(account)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
