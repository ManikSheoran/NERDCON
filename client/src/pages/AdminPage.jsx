import { useState, useEffect } from "react";

export default function AdminPage() {
  const [downloading, setDownloading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [totalHints, setTotalHints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const fetchTeamsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api"
        }/admin/teams/data`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();
      setTeams(data.teams || []);
      setTotalHints(data.totalHints || 0);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      setDownloading(true);

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api"
        }/admin/teams/csv`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teams_progress_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("✅ CSV downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      alert("❌ Failed to download CSV.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pixel-card">
        <h1 className="font-pixel text-3xl uppercase tracking-[0.35em] text-brand-primary mb-8 text-center">
          Admin Dashboard
        </h1>

        <div className="space-y-6">
          {/* Download CSV Section */}
          <div className="bg-brand-gray-800 rounded-lg p-6 border-2 border-brand-gray-700">
            <h2 className="text-xl font-bold text-brand-primary mb-4">
              Team Progress Export
            </h2>
            <p className="text-gray-300 mb-6">
              Download a CSV file containing all teams' progress, scores, and
              completed hints.
            </p>

            <button
              onClick={downloadCSV}
              disabled={downloading}
              className="pixel-button w-full md:w-auto px-8 py-4 text-base"
            >
              {downloading ? (
                <span className="flex items-center gap-3 justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                  Generating CSV...
                </span>
              ) : (
                <span>Download Teams CSV</span>
              )}
            </button>
          </div>

          {/* Live Team Data Table */}
          <div className="bg-brand-gray-800 rounded-lg p-6 border-2 border-brand-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-primary">
                Live Team Progress
              </h2>
              <button
                onClick={fetchTeamsData}
                className="pixel-button-sm bg-brand-gray-700 hover:bg-brand-gray-600 text-white px-4 py-2"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
                <p className="text-gray-400">Loading team data...</p>
              </div>
            ) : teams.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No teams found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-brand-gray-800 z-20">
                    <tr className="border-b-2 border-brand-gray-700">
                      <th className="px-3 py-3 text-brand-primary font-bold sticky left-0 bg-brand-gray-800 z-30">
                        Rank
                      </th>
                      <th className="px-3 py-3 text-brand-primary font-bold sticky left-14 bg-brand-gray-800 z-30">
                        Team
                      </th>
                      <th className="px-3 py-3 text-brand-primary font-bold text-center bg-brand-gray-800">
                        Score
                      </th>
                      <th className="px-3 py-3 text-brand-primary font-bold text-center bg-brand-gray-800">
                        Penalties
                      </th>
                      {Array.from({ length: totalHints }, (_, i) => (
                        <th
                          key={i}
                          className="px-3 py-3 text-brand-primary font-bold text-center bg-brand-gray-800"
                        >
                          H{i + 1}
                        </th>
                      ))}
                      <th className="px-3 py-3 text-brand-primary font-bold bg-brand-gray-800">
                        Last Submission
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr
                        key={team.name}
                        className="border-b border-brand-gray-700 hover:bg-brand-gray-700/50 transition-colors"
                      >
                        <td className="px-3 py-3 text-gray-300 font-bold sticky left-0 bg-brand-gray-800">
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : `#${index + 1}`}
                        </td>
                        <td className="px-3 py-3 text-gray-100 font-semibold sticky left-14 bg-brand-gray-800">
                          {team.name}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded font-bold text-sm">
                            {team.score}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded font-bold text-sm ${
                              team.penalties >= 20
                                ? "bg-red-500/20 text-red-400"
                                : team.penalties >= 15
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {team.penalties}
                          </span>
                        </td>
                        {team.hintCompletion?.map((status, hintIndex) => (
                          <td key={hintIndex} className="px-3 py-3 text-center">
                            <span
                              className={`font-bold text-lg ${
                                status === 1
                                  ? "text-green-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {team.lastSubmission
                            ? new Date(team.lastSubmission).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
