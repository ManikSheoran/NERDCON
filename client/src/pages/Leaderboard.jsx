import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Leaderboard() {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    axios
      .get("/game/leaderboard")
      .then((res) => setBoard(res.data.leaderboard));
  }, []);

  return (
    <div className="space-y-8">
      <div className="pixel-card overflow-hidden">
        <div className="mb-8 text-center">
          <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-primary">
            Leaderboard
          </h2>
          <div className="mt-3 h-1 w-32 mx-auto bg-brand-primary rounded-full border border-brand-pink-400"></div>
          <p className="mt-4 text-gray-300 text-sm font-medium">
            Top teams competing for glory in the Quest
          </p>
        </div>
        <div className="-mx-8 -mb-8 overflow-x-auto border-t-2 border-brand-gray-700">
          <table className="min-w-full divide-y-2 divide-brand-gray-700 border-separate border-spacing-0">
            <thead className="bg-brand-gray-800 border-b-2 border-brand-gray-700">
              <tr className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-brand-primary">
                <th className="px-6 py-5 text-left">Rank</th>
                <th className="px-6 py-5 text-left">Team</th>
                <th className="px-6 py-5 text-left">Hints Completed</th>
                <th className="px-6 py-5 text-left">Penalties</th>
                <th className="px-6 py-5 text-left">Last Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-700 text-sm text-gray-300">
              {board.map((team, index) => {
                const timestamp = team.lastHintSubmittedAt
                  ? new Date(team.lastHintSubmittedAt).toLocaleString()
                  : "-";

                const isTopThree = index < 3;
                const rankColors = [
                  "text-yellow-400 font-bold",
                  "text-gray-300 font-bold",
                  "text-orange-400 font-bold",
                ];

                const penalties = team.penalties ?? 0;
                const isPenaltyWarning = penalties >= 15;
                const isPenaltyMax = penalties >= 20;

                return (
                  <tr
                    key={team.name ?? index}
                    className={`transition-all hover:bg-brand-gray-800 ${
                      isTopThree ? "bg-brand-gray-800/50" : ""
                    }`}
                  >
                    <td
                      className={`px-6 py-5 font-pixel text-[0.75rem] uppercase tracking-[0.25em] ${
                        isTopThree ? rankColors[index] : "text-gray-400"
                      }`}
                    >
                      #{index + 1}
                    </td>
                    <td className="px-6 py-5 font-semibold text-gray-100">
                      <div className="flex items-center gap-3">
                        {isTopThree && (
                          <span className="text-xl">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                        )}
                        <span>{team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-block px-3 py-1 rounded-full bg-brand-primary text-white font-bold border-2 border-brand-pink-400">
                        {team.hintsCompleted || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold border-2 ${
                          isPenaltyMax
                            ? "bg-red-600 text-white border-red-400"
                            : isPenaltyWarning
                            ? "bg-orange-600 text-white border-orange-400"
                            : penalties > 0
                            ? "bg-yellow-600 text-white border-yellow-400"
                            : "bg-green-600 text-white border-green-400"
                        }`}
                      >
                        {penalties}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-400 text-xs">
                      {timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
