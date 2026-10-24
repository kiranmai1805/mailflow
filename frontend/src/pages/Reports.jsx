import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = "http://mailflow-gh75.onrender.com";

export default function Reports() {
  const [campaigns, setCampaigns] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);

      const [campaignResponse, historyResponse] =
        await Promise.all([
          axios.get(`${API_URL}/campaigns/`),
          axios.get(`${API_URL}/campaigns/history`),
        ]);

      setCampaigns(campaignResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  /*
   * Filter email history
   */
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesCampaign =
        selectedCampaign === "all" ||
        String(item.campaign_id) === String(selectedCampaign);

      const matchesStatus =
        selectedStatus === "all" ||
        item.status === selectedStatus;

      const recipient =
        item.recipient_email?.toLowerCase() || "";

      const matchesSearch =
        search.trim() === "" ||
        recipient.includes(search.toLowerCase().trim());

      return (
        matchesCampaign &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    history,
    selectedCampaign,
    selectedStatus,
    search,
  ]);

  /*
   * Campaign performance
   */
  const campaignReports = useMemo(() => {
    return campaigns.map((campaign) => {
      const campaignHistory = history.filter(
        (item) =>
          item.campaign_id === campaign.id
      );

      const sent = campaignHistory.filter(
        (item) => item.status === "sent"
      ).length;

      const failed = campaignHistory.filter(
        (item) => item.status === "failed"
      ).length;

      const attempted = sent + failed;

      const successRate =
        attempted > 0
          ? Math.round((sent / attempted) * 100)
          : 0;

      return {
        ...campaign,
        attempted,
        sent,
        failed,
        successRate,
      };
    });
  }, [campaigns, history]);

  /*
   * Filtered summary
   */
  const filteredSent = filteredHistory.filter(
    (item) => item.status === "sent"
  ).length;

  const filteredFailed = filteredHistory.filter(
    (item) => item.status === "failed"
  ).length;

  const filteredTotal =
    filteredSent + filteredFailed;

  const filteredSuccessRate =
    filteredTotal > 0
      ? Math.round(
          (filteredSent / filteredTotal) * 100
        )
      : 0;

  /*
   * Find campaign name
   */
  const getCampaignName = (campaignId) => {
    const campaign = campaigns.find(
      (item) => item.id === campaignId
    );

    return campaign
      ? campaign.name
      : `Campaign #${campaignId}`;
  };

  return (
    <div className="space-y-8">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Analyze campaign performance and email activity.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh Reports"}
        </button>

      </div>


      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>
            Filter Email Activity
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Campaign */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Campaign
              </label>

              <select
                value={selectedCampaign}
                onChange={(e) =>
                  setSelectedCampaign(e.target.value)
                }
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              >
                <option value="all">
                  All Campaigns
                </option>

                {campaigns.map((campaign) => (
                  <option
                    key={campaign.id}
                    value={campaign.id}
                  >
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Status */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="sent">
                  Sent
                </option>

                <option value="failed">
                  Failed
                </option>
              </select>
            </div>


            {/* Search */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Search Recipient
              </label>

              <input
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>


          {/* Clear filters */}

          {(selectedCampaign !== "all" ||
            selectedStatus !== "all" ||
            search !== "") && (
            <button
              onClick={() => {
                setSelectedCampaign("all");
                setSelectedStatus("all");
                setSearch("");
              }}
              className="mt-4 text-sm font-medium text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}

        </CardContent>
      </Card>


      {/* ================================================= */}
      {/* FILTERED RESULTS SUMMARY */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <Card>
          <CardContent className="p-6">

            <p className="text-sm font-medium text-gray-500">
              Emails in Result
            </p>

            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : filteredTotal}
            </p>

          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-6">

            <p className="text-sm font-medium text-gray-500">
              Successfully Sent
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {loading ? "..." : filteredSent}
            </p>

          </CardContent>
        </Card>


        <Card>
          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Failed
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {loading ? "..." : filteredFailed}
                </p>
              </div>

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Success Rate
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {loading
                    ? "..."
                    : `${filteredSuccessRate}%`}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

      </div>


      {/* ================================================= */}
      {/* CAMPAIGN PERFORMANCE */}
      {/* ================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>
            Campaign Performance
          </CardTitle>
        </CardHeader>

        <CardContent>

          {campaignReports.length === 0 ? (

            <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
              No campaigns available.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">

                    <th className="p-4 font-medium">
                      Campaign
                    </th>

                    <th className="p-4 font-medium">
                      Subject
                    </th>

                    <th className="p-4 font-medium">
                      Attempted
                    </th>

                    <th className="p-4 font-medium">
                      Sent
                    </th>

                    <th className="p-4 font-medium">
                      Failed
                    </th>

                    <th className="p-4 font-medium">
                      Success Rate
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {campaignReports.map(
                    (campaign) => (
                      <tr
                        key={campaign.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        <td className="p-4">
                          <p className="font-semibold">
                            {campaign.name}
                          </p>
                        </td>

                        <td className="p-4 text-sm text-gray-500">
                          {campaign.subject}
                        </td>

                        <td className="p-4">
                          {campaign.attempted}
                        </td>

                        <td className="p-4 font-medium text-green-600">
                          {campaign.sent}
                        </td>

                        <td className="p-4 font-medium text-red-600">
                          {campaign.failed}
                        </td>

                        <td className="p-4">

                          {campaign.attempted === 0 ? (

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Not sent
                            </span>

                          ) : (

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                campaign.successRate === 100
                                  ? "bg-green-100 text-green-700"
                                  : campaign.successRate >= 70
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {campaign.successRate}%
                            </span>

                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </CardContent>
      </Card>


      {/* ================================================= */}
      {/* DETAILED EMAIL HISTORY */}
      {/* ================================================= */}

      <Card>

        <CardHeader>
          <div className="flex items-center justify-between">

            <div>
              <CardTitle>
                Detailed Email History
              </CardTitle>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredHistory.length} email
                {filteredHistory.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

          </div>
        </CardHeader>

        <CardContent>

          {filteredHistory.length === 0 ? (

            <div className="rounded-lg border border-dashed p-10 text-center">

              <p className="font-medium text-gray-600">
                No email activity found.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Try changing your filters.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b text-left text-sm text-gray-500">

                    <th className="p-4 font-medium">
                      Recipient
                    </th>

                    <th className="p-4 font-medium">
                      Campaign
                    </th>

                    <th className="p-4 font-medium">
                      Status
                    </th>

                    <th className="p-4 font-medium">
                      Date
                    </th>

                    <th className="p-4 font-medium">
                      Details
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredHistory.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        <td className="p-4 font-medium">
                          {item.recipient_email}
                        </td>

                        <td className="p-4 text-sm text-gray-600">
                          {getCampaignName(
                            item.campaign_id
                          )}
                        </td>

                        <td className="p-4">

                          {item.status === "sent" ? (

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              ✓ Sent
                            </span>

                          ) : (

                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              ✕ Failed
                            </span>

                          )}

                        </td>

                        <td className="p-4 text-sm text-gray-500">
                          {item.sent_at
                            ? new Date(
                                item.sent_at
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td className="max-w-xs p-4 text-sm">

                          {item.status === "failed" &&
                          item.error ? (
                            <span className="text-red-500">
                              {item.error}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              —
                            </span>
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </CardContent>
      </Card>

    </div>
  );
}