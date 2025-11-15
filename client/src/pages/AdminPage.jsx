import { useState, useEffect } from "react";

export default function AdminPage() {
  const [downloading, setDownloading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [totalHints, setTotalHints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState(null);

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
        <h1 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-primary mb-8 text-center">
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
              completed clues.
            </p>

            <button
              onClick={downloadCSV}
              disabled={downloading}
              className="pixel-button w-full md:w-auto px-8 py-4 text-base group"
            >
              {downloading ? (
                <span className="flex items-center gap-3 justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                  Generating CSV...
                </span>
              ) : (
                <span className="group-hover:animate-pulse">
                  Download Teams CSV
                </span>
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
                className="pixel-button-sm bg-brand-gray-700 hover:bg-brand-gray-600 border-brand-gray-600 text-white px-4 py-2 group"
              >
                <span className="group-hover:animate-pulse">Refresh</span>
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
                        Clues Done
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
                      <th className="px-3 py-3 text-brand-primary font-bold bg-brand-gray-800 text-center">
                        Timing
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <>
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
                              {team.hintsCompleted || 0}
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
                            <td
                              key={hintIndex}
                              className="px-3 py-3 text-center"
                            >
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
                              ? new Date(
                                  team.lastSubmission
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() =>
                                setExpandedTeam(
                                  expandedTeam === team.name ? null : team.name
                                )
                              }
                              className="text-brand-primary hover:text-brand-secondary text-xl font-bold"
                            >
                              {expandedTeam === team.name ? "▼" : "▶"}
                            </button>
                          </td>
                        </tr>
                        {expandedTeam === team.name && (
                          <tr className="bg-brand-gray-900 border-b border-brand-gray-700">
                            <td colSpan={totalHints + 6} className="px-6 py-4">
                              <div className="text-gray-300">
                                <h3 className="font-bold text-brand-primary mb-3 flex items-center gap-2">
                                  ⏱️ Timing Data - {team.name}
                                </h3>
                                {team.hintTimestamps &&
                                team.hintTimestamps.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {team.hintTimestamps.map((ts, idx) => {
                                      const minutes = Math.floor(
                                        ts.timeTaken / 60
                                      );
                                      const seconds = ts.timeTaken % 60;
                                      const isFast =
                                        ts.timeTaken > 0 && ts.timeTaken < 120;

                                      return (
                                        <div
                                          key={idx}
                                          className={`p-3 rounded border ${
                                            isFast
                                              ? "bg-yellow-500/10 border-yellow-500/50"
                                              : "bg-brand-gray-800 border-brand-gray-700"
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-brand-primary">
                                              Clue {ts.hintId}
                                            </span>
                                            {isFast && (
                                              <span className="text-yellow-400 text-xs font-bold">
                                                ⚠️ FAST
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-400">
                                            Time taken:{" "}
                                            <span className="text-gray-200 font-semibold">
                                              {minutes > 0 && `${minutes}m `}
                                              {seconds}s
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            Solved:{" "}
                                            {new Date(
                                              ts.solvedAt
                                            ).toLocaleTimeString("en-IN", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 italic">
                                    No timing data available yet
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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
