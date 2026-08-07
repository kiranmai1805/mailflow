import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [campaignResponse, contactResponse] =
        await Promise.all([
          axios.get(`${API_URL}/campaigns/`),
          axios.get(`${API_URL}/contacts/`),
        ]);

      setCampaigns(campaignResponse.data);
      setContacts(contactResponse.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleContactChange = (id) => {
    setSelectedContacts((current) =>
      current.includes(id)
        ? current.filter((contactId) => contactId !== id)
        : [...current, id]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name || !subject || !body) {
      alert("Please fill all fields");
      return;
    }

    if (selectedContacts.length === 0) {
      alert("Please select at least one contact");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/campaigns/`, {
        name,
        subject,
        body,
        contact_ids: selectedContacts,
      });

      setName("");
      setSubject("");
      setBody("");
      setSelectedContacts([]);

      await loadData();

      alert("Campaign created successfully!");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (campaignId) => {
    const confirmed = window.confirm(
      "Are you sure you want to send this campaign?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/campaigns/${campaignId}/send`
      );

      alert(
        `${response.data.message}\n\n` +
        `Sent: ${response.data.sent}\n` +
        `Failed: ${response.data.failed}`
      );

      await loadData();
    } catch (error) {
      console.error("Failed to send campaign:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to send campaign";

      alert(message);
    }
  };

  const handleDelete = async (campaignId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this campaign?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/campaigns/${campaignId}`
      );

      await loadData();

      alert("Campaign removed successfully!");
    } catch (error) {
      console.error("Failed to delete campaign:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to remove campaign";

      alert(message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Campaigns
      </h1>

      <div className="grid grid-cols-2 gap-8">

        {/* Create Campaign */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Create Campaign
          </h2>

          <form
            onSubmit={handleCreate}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Campaign name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-3"
            />

            <input
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border p-3"
            />

            <textarea
              placeholder="Email body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              className="w-full rounded-md border p-3"
            />

            {/* Contacts */}
            <div>
              <h3 className="mb-2 font-semibold">
                Select Recipients
              </h3>

              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No contacts available.
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(
                          contact.id
                        )}
                        onChange={() =>
                          handleContactChange(contact.id)
                        }
                      />

                      <span>{contact.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Campaign"}
            </button>
          </form>
        </div>

        {/* Campaign List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Your Campaigns
          </h2>

          {campaigns.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-gray-500">
              No campaigns created yet.
            </div>
          ) : (
            <div className="space-y-4">

              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-lg border p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {campaign.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {campaign.subject}
                      </p>
                    </div>

                    {/* Status */}
                    {campaign.status === "sent" && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        ✓ Sent
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm">
                    {campaign.body}
                  </p>

                  <div className="mt-4 flex gap-3">

                    {/* Send */}
                    {campaign.status === "sent" ? (
                      <button
                        disabled
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        ✓ Sent
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleSend(campaign.id)
                        }
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Send Campaign
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() =>
                        handleDelete(campaign.id)
                      }
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Remove
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}