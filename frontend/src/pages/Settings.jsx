import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = "http://127.0.0.1:8000";

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [campaignNotifications, setCampaignNotifications] =
    useState(true);
  const [failureNotifications, setFailureNotifications] =
    useState(true);

  const [accounts, setAccounts] = useState([]);
  const [defaultSender, setDefaultSender] = useState("");

  const [loadingAccounts, setLoadingAccounts] = useState(true);

  /*
   * Load saved settings
   */
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("mailflow_theme") || "light";

    const savedCampaignNotifications =
      localStorage.getItem(
        "mailflow_campaign_notifications"
      );

    const savedFailureNotifications =
      localStorage.getItem(
        "mailflow_failure_notifications"
      );

    const savedDefaultSender =
      localStorage.getItem(
        "mailflow_default_sender"
      ) || "";

    setTheme(savedTheme);

    setCampaignNotifications(
      savedCampaignNotifications === null
        ? true
        : savedCampaignNotifications === "true"
    );

    setFailureNotifications(
      savedFailureNotifications === null
        ? true
        : savedFailureNotifications === "true"
    );

    setDefaultSender(savedDefaultSender);

    applyTheme(savedTheme);
  }, []);

  /*
   * Load connected email accounts
   */
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/email-accounts/`
        );

        setAccounts(response.data);
      } catch (error) {
        console.error(
          "Failed to load email accounts:",
          error
        );
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  /*
   * Apply theme
   */
  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;

    if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else if (selectedTheme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.classList.toggle(
        "dark",
        prefersDark
      );
    }
  };

  /*
   * Change theme
   */
  const handleThemeChange = (value) => {
    setTheme(value);

    localStorage.setItem(
      "mailflow_theme",
      value
    );

    applyTheme(value);
  };

  /*
   * Campaign notification
   */
  const handleCampaignNotifications = (value) => {
    setCampaignNotifications(value);

    localStorage.setItem(
      "mailflow_campaign_notifications",
      String(value)
    );
  };

  /*
   * Failure notification
   */
  const handleFailureNotifications = (value) => {
    setFailureNotifications(value);

    localStorage.setItem(
      "mailflow_failure_notifications",
      String(value)
    );
  };

  /*
   * Default sender
   */
  const handleDefaultSender = (value) => {
    setDefaultSender(value);

    localStorage.setItem(
      "mailflow_default_sender",
      value
    );
  };

  /*
   * Reset settings
   */
  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all MailFlow settings to their default values?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "mailflow_theme"
    );

    localStorage.removeItem(
      "mailflow_campaign_notifications"
    );

    localStorage.removeItem(
      "mailflow_failure_notifications"
    );

    localStorage.removeItem(
      "mailflow_default_sender"
    );

    setTheme("light");
    setCampaignNotifications(true);
    setFailureNotifications(true);
    setDefaultSender("");

    applyTheme("light");
  };

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Customize your MailFlow preferences.
        </p>
      </div>


      {/* =====================================================
          APPEARANCE
      ===================================================== */}

      <Card>

        <CardHeader>
          <CardTitle>
            Appearance
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div>
            <h3 className="font-medium">
              Theme
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Choose how MailFlow should look.
            </p>
          </div>


          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Light */}

            <button
              onClick={() =>
                handleThemeChange("light")
              }
              className={`rounded-xl border p-5 text-left transition ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >

              <div className="text-3xl">
                ☀️
              </div>

              <h3 className="mt-3 font-semibold">
                Light
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Use the light appearance.
              </p>

            </button>


            {/* Dark */}

            <button
              onClick={() =>
                handleThemeChange("dark")
              }
              className={`rounded-xl border p-5 text-left transition ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >

              <div className="text-3xl">
                🌙
              </div>

              <h3 className="mt-3 font-semibold">
                Dark
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Use the dark appearance.
              </p>

            </button>


            {/* System */}

            <button
              onClick={() =>
                handleThemeChange("system")
              }
              className={`rounded-xl border p-5 text-left transition ${
                theme === "system"
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >

              <div className="text-3xl">
                💻
              </div>

              <h3 className="mt-3 font-semibold">
                System
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Follow your device preference.
              </p>

            </button>

          </div>

        </CardContent>

      </Card>


      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      <Card>

        <CardHeader>
          <CardTitle>
            Notifications
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* Campaign sent */}

          <label className="flex cursor-pointer items-center justify-between gap-5">

            <div>

              <h3 className="font-medium">
                Campaign sent
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Show a notification when a campaign
                finishes sending.
              </p>

            </div>

            <input
              type="checkbox"
              checked={campaignNotifications}
              onChange={(e) =>
                handleCampaignNotifications(
                  e.target.checked
                )
              }
              className="h-5 w-5"
            />

          </label>


          <div className="border-t" />


          {/* Failed emails */}

          <label className="flex cursor-pointer items-center justify-between gap-5">

            <div>

              <h3 className="font-medium">
                Failed emails
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Show a notification when one or more
                emails fail to send.
              </p>

            </div>

            <input
              type="checkbox"
              checked={failureNotifications}
              onChange={(e) =>
                handleFailureNotifications(
                  e.target.checked
                )
              }
              className="h-5 w-5"
            />

          </label>

        </CardContent>

      </Card>


      {/* =====================================================
          SENDING
      ===================================================== */}

      <Card>

        <CardHeader>
          <CardTitle>
            Sending Preferences
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div>

            <label className="mb-2 block font-medium">
              Default Sender
            </label>

            <p className="mb-3 text-sm text-gray-500">
              This account can be selected as your
              preferred sender when creating campaigns.
            </p>

            {loadingAccounts ? (

              <p className="text-sm text-gray-500">
                Loading email accounts...
              </p>

            ) : accounts.length === 0 ? (

              <div className="rounded-lg border border-dashed p-5">

                <p className="font-medium">
                  No email accounts connected.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Connect an email account before
                  selecting a default sender.
                </p>

              </div>

            ) : (

              <select
                value={defaultSender}
                onChange={(e) =>
                  handleDefaultSender(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500 md:max-w-lg"
              >

                <option value="">
                  No default sender
                </option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.email} (
                    {account.provider})
                  </option>
                ))}

              </select>

            )}

          </div>

        </CardContent>

      </Card>


      {/* =====================================================
          RESET
      ===================================================== */}

      <Card>

        <CardHeader>
          <CardTitle>
            Preferences
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="font-medium">
                Reset Settings
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Restore MailFlow settings to their
                default values.
              </p>

            </div>

            <button
              onClick={handleReset}
              className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Reset Settings
            </button>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}