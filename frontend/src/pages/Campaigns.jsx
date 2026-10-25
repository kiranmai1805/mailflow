import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://mailflow-gh75.onrender.com";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [emailAccounts, setEmailAccounts] = useState([]);

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [senderAccountId, setSenderAccountId] = useState("");

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================================
  // ADD EMAIL ACCOUNT
  // =========================================

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountProvider, setAccountProvider] = useState("");

  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecurity, setSmtpSecurity] = useState("tls");

  const [accountLoading, setAccountLoading] = useState(false);

  // =========================================
  // LOAD DATA
  // =========================================

  const loadData = async () => {
    try {
      const [
        campaignResponse,
        contactResponse,
        emailAccountResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/campaigns/`),
        axios.get(`${API_URL}/contacts/`),
        axios.get(`${API_URL}/email-accounts/`),
      ]);

      setCampaigns(campaignResponse.data);
      setContacts(contactResponse.data);
      setEmailAccounts(emailAccountResponse.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // CONTACT SELECTION
  // =========================================

  const handleContactChange = (id) => {
    setSelectedContacts((current) =>
      current.includes(id)
        ? current.filter((contactId) => contactId !== id)
        : [...current, id]
    );
  };

  // =========================================
  // CREATE CAMPAIGN
  // =========================================

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

    if (!senderAccountId) {
      alert("Please select a sender email");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/campaigns/`, {
        name,
        subject,
        body,
        contact_ids: selectedContacts,
        sender_account_id: Number(senderAccountId),
      });

      setName("");
      setSubject("");
      setBody("");
      setSelectedContacts([]);
      setSenderAccountId("");

      await loadData();

      alert("Campaign created successfully!");
    } catch (error) {
      console.error("Failed to create campaign:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to create campaign";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SEND CAMPAIGN
  // =========================================

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

  // =========================================
  // DELETE CAMPAIGN
  // =========================================

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

  // =========================================
  // ADD EMAIL ACCOUNT
  // =========================================

  const handleAddAccount = async (e) => {
    e.preventDefault();

    if (!accountEmail || !accountPassword) {
      alert("Please enter your email and password.");
      return;
    }

    if (!smtpHost || !smtpPort) {
      alert("Please enter your SMTP host and port.");
      return;
    }

    try {
      setAccountLoading(true);

      await axios.post(`${API_URL}/email-accounts/`, {
        email: accountEmail,
        provider: accountProvider,
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        username: accountEmail,
        password: accountPassword,
        use_tls: smtpSecurity === "tls",
      });

      alert("Email account connected successfully!");

      setAccountEmail("");
      setAccountPassword("");
      setSmtpHost("");
      setSmtpPort("587");
      setSmtpSecurity("tls");
      setAccountProvider("");

      setShowAddAccount(false);

      await loadData();
    } catch (error) {
      console.error(
        "Failed to add email account:",
        error
      );

      const message =
        error.response?.data?.detail ||
        "Failed to connect email account";

      alert(message);
    } finally {
      setAccountLoading(false);
    }
  };

  // =========================================
  // OPEN ADD ACCOUNT MODAL
  // =========================================

  const openAddAccount = () => {
    setShowAddAccount(true);
    setAccountProvider("");
  };

  // =========================================
  // CLOSE ADD ACCOUNT MODAL
  // =========================================

  const closeAddAccount = () => {
    setShowAddAccount(false);
    setAccountProvider("");

    setAccountEmail("");
    setAccountPassword("");

    setSmtpHost("");
    setSmtpPort("587");
    setSmtpSecurity("tls");
  };

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="p-6">

      {/* ========================================= */}
      {/* PAGE HEADER */}
      {/* ========================================= */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold">
          Campaigns
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create and send email campaigns.
        </p>

      </div>


      {/* ========================================= */}
      {/* MAIN GRID */}
      {/* ========================================= */}

      <div className="grid grid-cols-2 gap-8">

        {/* ========================================= */}
        {/* CREATE CAMPAIGN */}
        {/* ========================================= */}

        <div className="rounded-lg border p-6">

          <h2 className="mb-4 text-xl font-semibold">
            Create Campaign
          </h2>

          <form
            onSubmit={handleCreate}
            className="space-y-4"
          >

            {/* CAMPAIGN NAME */}

            <input
              type="text"
              placeholder="Campaign name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-md border p-3"
            />


            {/* SUBJECT */}

            <input
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              className="w-full rounded-md border p-3"
            />


            {/* BODY */}

            <textarea
              placeholder="Email body"
              value={body}
              onChange={(e) =>
                setBody(e.target.value)
              }
              rows={7}
              className="w-full rounded-md border p-3"
            />


            {/* ========================================= */}
            {/* SENDER EMAIL */}
            {/* ========================================= */}

            <div>

              

                <h3 className="font-semibold">
                  Sender Email
                </h3>

                

              


              {emailAccounts.length === 0 ? (

                <div className="rounded-md border p-4">

                  <p className="text-sm text-gray-500">
                    No email accounts connected.
                  </p>

                  <button
                    type="button"
                    onClick={openAddAccount}
                    className="mt-3 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    + Add Email Account
                  </button>

                </div>

              ) : (

                <div className="flex gap-2">

                  <select
                    value={senderAccountId}
                    onChange={(e) =>
                      setSenderAccountId(e.target.value)
                    }
                    className="flex-1 rounded-md border p-3"
                  >

                    <option value="">
                      Select sender email
                    </option>

                    {emailAccounts.map((account) => (

                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {account.email}
                        {account.provider
                          ? ` (${account.provider})`
                          : ""}
                      </option>

                    ))}

                  </select>


                  <button
                    type="button"
                    onClick={openAddAccount}
                    className="whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    + Add Email
                  </button>

                </div>

              )}

            </div>


            {/* ========================================= */}
            {/* RECIPIENTS */}
            {/* ========================================= */}

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
                          handleContactChange(
                            contact.id
                          )
                        }
                      />

                      <span>
                        {contact.email}
                      </span>

                    </label>

                  ))}

                </div>

              )}

            </div>


            {/* ========================================= */}
            {/* CREATE BUTTON */}
            {/* ========================================= */}

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


        {/* ========================================= */}
        {/* CAMPAIGN LIST */}
        {/* ========================================= */}

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

                  {/* CAMPAIGN HEADER */}

                  <div className="flex items-start justify-between">

                    <div>

                      <h3 className="font-semibold">
                        {campaign.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {campaign.subject}
                      </p>

                    </div>


                    {/* SENT STATUS */}

                    {campaign.status === "sent" && (

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        ✓ Sent
                      </span>

                    )}

                  </div>


                  {/* CAMPAIGN BODY */}

                  <p className="mt-3 text-sm">
                    {campaign.body}
                  </p>


                  {/* ========================================= */}
                  {/* CAMPAIGN BUTTONS */}
                  {/* ========================================= */}

                  <div className="mt-4 flex gap-3">

                    {/* SEND */}

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


                    {/* REMOVE */}

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


      {/* ===================================================== */}
      {/* ADD EMAIL ACCOUNT MODAL */}
      {/* ===================================================== */}

      {showAddAccount && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Connect Email Account
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to connect your email.
                </p>

              </div>


              <button
                type="button"
                onClick={closeAddAccount}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

            </div>


            {/* ================================================= */}
            {/* PROVIDER SELECTION */}
            {/* ================================================= */}

            {!accountProvider && (

              <div className="space-y-3">

                {/* GOOGLE */}

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      `${API_URL}/auth/google/login`;
                  }}
                  className="flex w-full items-center justify-between rounded-md border p-4 text-left hover:bg-gray-50"
                >

                  <div>

                    <p className="font-medium">
                      Google
                    </p>

                    <p className="text-sm text-gray-500">
                      Connect using your Google account
                    </p>

                  </div>

                  <span className="text-sm font-medium">
                    Continue →
                  </span>

                </button>


                {/* MICROSOFT */}

                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "Microsoft account connection will be available soon."
                    );
                  }}
                  className="flex w-full items-center justify-between rounded-md border p-4 text-left hover:bg-gray-50"
                >

                  <div>

                    <p className="font-medium">
                      Microsoft
                    </p>

                    <p className="text-sm text-gray-500">
                      Outlook / Microsoft 365
                    </p>

                  </div>

                  <span className="text-sm font-medium">
                    Continue →
                  </span>

                </button>


                {/* OTHER / SMTP */}

                <button
                  type="button"
                  onClick={() =>
                    setAccountProvider("other")
                  }
                  className="flex w-full items-center justify-between rounded-md border p-4 text-left hover:bg-gray-50"
                >

                  <div>

                    <p className="font-medium">
                      Other Email Provider
                    </p>

                    <p className="text-sm text-gray-500">
                      Yahoo, company email, custom mail server, etc.
                    </p>

                  </div>

                  <span className="text-sm font-medium">
                    Use SMTP →
                  </span>

                </button>

              </div>

            )}


            {/* ================================================= */}
            {/* SMTP FORM */}
            {/* ================================================= */}

            {accountProvider === "other" && (

              <form
                onSubmit={handleAddAccount}
                className="space-y-4"
              >

                {/* BACK */}

                <button
                  type="button"
                  onClick={() =>
                    setAccountProvider("")
                  }
                  className="text-sm text-gray-500 hover:text-black"
                >
                  ← Back
                </button>


                <div>

                  <h3 className="font-semibold">
                    SMTP Account
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the SMTP details provided by your email provider.
                  </p>

                </div>


                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={accountEmail}
                    onChange={(e) =>
                      setAccountEmail(e.target.value)
                    }
                    className="w-full rounded-md border p-3"
                    required
                  />

                </div>


                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Password / App Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter password"
                    value={accountPassword}
                    onChange={(e) =>
                      setAccountPassword(e.target.value)
                    }
                    className="w-full rounded-md border p-3"
                    required
                  />

                </div>


                {/* SMTP HOST */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    SMTP Host
                  </label>

                  <input
                    type="text"
                    placeholder="smtp.example.com"
                    value={smtpHost}
                    onChange={(e) =>
                      setSmtpHost(e.target.value)
                    }
                    className="w-full rounded-md border p-3"
                    required
                  />

                </div>


                {/* SMTP PORT */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    SMTP Port
                  </label>

                  <input
                    type="number"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) =>
                      setSmtpPort(e.target.value)
                    }
                    className="w-full rounded-md border p-3"
                    required
                  />

                </div>


                {/* SECURITY */}

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Security
                  </label>

                  <select
                    value={smtpSecurity}
                    onChange={(e) =>
                      setSmtpSecurity(e.target.value)
                    }
                    className="w-full rounded-md border p-3"
                  >

                    <option value="tls">
                      TLS
                    </option>

                    <option value="ssl">
                      SSL
                    </option>

                  </select>

                </div>


                {/* FORM BUTTONS */}

                <div className="flex justify-end gap-3 pt-2">

                  <button
                    type="button"
                    onClick={closeAddAccount}
                    className="rounded-md border px-4 py-2 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={accountLoading}
                    className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                  >

                    {accountLoading
                      ? "Connecting..."
                      : "Connect Account"}

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </div>
  );
}