import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_sent: 0,
    total_failed: 0,
    total_attempted: 0,
    total_campaigns: 0,
    total_contacts: 0,
    success_rate: 0,
  });

  const [campaigns, setCampaigns] = useState([]);
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        statsResponse,
        campaignsResponse,
        contactsResponse,
        accountsResponse,
        historyResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/campaigns/stats`),
        axios.get(`${API_URL}/campaigns/`),
        axios.get(`${API_URL}/contacts/`),
        axios.get(`${API_URL}/email-accounts/`),
        axios.get(`${API_URL}/campaigns/history`),
      ]);

      setStats({
        ...statsResponse.data,
        total_contacts: contactsResponse.data.length,
        total_campaigns: campaignsResponse.data.length,
      });

      setCampaigns(campaignsResponse.data);
      setEmailAccounts(accountsResponse.data);
      setHistory(historyResponse.data);

    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">

      {/* --------------------------------------- */}
      {/* HEADER */}
      {/* --------------------------------------- */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome Back 👋
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your MailFlow account.
        </p>
      </div>


      {/* --------------------------------------- */}
      {/* STAT CARDS */}
      {/* --------------------------------------- */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* Contacts */}

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Contacts
            </CardTitle>

            <div className="rounded-lg bg-blue-100 px-3 py-2 text-xl">
              👥
            </div>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold">
              {loading
                ? "..."
                : stats.total_contacts}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Contacts in your database
            </p>
          </CardContent>
        </Card>


        {/* Campaigns */}

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Campaigns
            </CardTitle>

            <div className="rounded-lg bg-purple-100 px-3 py-2 text-xl">
              📣
            </div>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold">
              {loading
                ? "..."
                : stats.total_campaigns}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Campaigns created
            </p>
          </CardContent>
        </Card>


        {/* Emails Sent */}

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Emails Sent
            </CardTitle>

            <div className="rounded-lg bg-green-100 px-3 py-2 text-xl">
              📧
            </div>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold text-green-600">
              {loading
                ? "..."
                : stats.total_sent}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Successfully delivered attempts
            </p>
          </CardContent>
        </Card>


        {/* Failed */}

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Failed Emails
            </CardTitle>

            <div className="rounded-lg bg-red-100 px-3 py-2 text-xl">
              ❌
            </div>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold text-red-600">
              {loading
                ? "..."
                : stats.total_failed}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Failed sending attempts
            </p>
          </CardContent>
        </Card>

      </div>


      {/* --------------------------------------- */}
      {/* PERFORMANCE */}
      {/* --------------------------------------- */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Success Rate */}

        <Card className="border-0 shadow-sm lg:col-span-1">

          <CardHeader>
            <CardTitle>
              Email Performance
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="flex items-center justify-center py-6">

              <div className="text-center">

                <div className="text-5xl font-bold text-blue-600">
                  {loading
                    ? "..."
                    : `${stats.success_rate}%`}
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Success Rate
                </p>

              </div>

            </div>


            <div className="mt-4">

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">
                  Successful
                </span>

                <span className="font-medium">
                  {stats.total_sent}
                </span>
              </div>


              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${Math.min(
                      stats.success_rate,
                      100
                    )}%`,
                  }}
                />

              </div>


              <div className="mt-2 flex justify-between text-sm">

                <span className="text-gray-500">
                  Failed
                </span>

                <span className="font-medium text-red-600">
                  {stats.total_failed}
                </span>

              </div>

            </div>

          </CardContent>

        </Card>


        {/* Connected Email Accounts */}

        <Card className="border-0 shadow-sm lg:col-span-2">

          <CardHeader>
            <CardTitle>
              Connected Email Accounts
            </CardTitle>
          </CardHeader>

          <CardContent>

            {emailAccounts.length === 0 ? (

              <div className="rounded-lg border border-dashed p-8 text-center">

                <div className="text-3xl">
                  📧
                </div>

                <p className="mt-2 font-medium">
                  No email accounts connected
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Connect an email account to start sending campaigns.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {emailAccounts.map((account) => (

                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="rounded-full bg-blue-100 p-3">
                        📧
                      </div>

                      <div>

                        <p className="font-medium">
                          {account.email}
                        </p>

                        <p className="text-sm text-gray-500">
                          {account.provider}
                        </p>

                      </div>

                    </div>


                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Connected
                    </span>

                  </div>

                ))}

              </div>

            )}

          </CardContent>

        </Card>

      </div>


      {/* --------------------------------------- */}
      {/* RECENT CAMPAIGNS */}
      {/* --------------------------------------- */}

      <Card className="border-0 shadow-sm">

        <CardHeader>
          <CardTitle>
            Recent Campaigns
          </CardTitle>
        </CardHeader>

        <CardContent>

          {campaigns.length === 0 ? (

            <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
              No campaigns created yet.
            </div>

          ) : (

            <div className="space-y-3">

              {campaigns.slice(0, 5).map((campaign) => {

                const campaignHistory =
                  history.filter(
                    (item) =>
                      item.campaign_id === campaign.id
                  );

                const sent =
                  campaignHistory.filter(
                    (item) =>
                      item.status === "sent"
                  ).length;

                const failed =
                  campaignHistory.filter(
                    (item) =>
                      item.status === "failed"
                  ).length;

                return (

                  <div
                    key={campaign.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {campaign.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {campaign.subject}
                      </p>

                    </div>


                    <div className="flex items-center gap-3">

                      {sent > 0 && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          ✓ {sent} sent
                        </span>
                      )}

                      {failed > 0 && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          ✕ {failed} failed
                        </span>
                      )}

                      {sent === 0 &&
                        failed === 0 && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Not sent
                          </span>
                        )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </CardContent>

      </Card>


      {/* --------------------------------------- */}
      {/* SEND ACTIVITY */}
      {/* --------------------------------------- */}

      <Card className="border-0 shadow-sm">

        <CardHeader>
          <CardTitle>
            Recent Email Activity
          </CardTitle>
        </CardHeader>

        <CardContent>

          {history.length === 0 ? (

            <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
              No emails have been sent yet.
            </div>

          ) : (

            <div className="space-y-2">

              {history.slice(0, 10).map((item) => (

                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >

                  <div>

                    <p className="font-medium">
                      {item.recipient_email}
                    </p>

                    <p className="text-xs text-gray-500">
                      {item.sent_at
                        ? new Date(
                            item.sent_at
                          ).toLocaleString()
                        : "Unknown time"}
                    </p>

                  </div>


                  {item.status === "sent" ? (

                    <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      ✓ Sent
                    </span>

                  ) : (

                    <div className="text-right">

                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        ✕ Failed
                      </span>

                      {item.error && (
                        <p className="mt-1 max-w-xs text-xs text-red-500">
                          {item.error}
                        </p>
                      )}

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </CardContent>

      </Card>


      {/* --------------------------------------- */}
      {/* REFRESH */}
      {/* --------------------------------------- */}

      <div className="flex justify-end">

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh Dashboard"}
        </button>

      </div>

    </div>
  );
}