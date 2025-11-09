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
          <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-secondary">
            Leaderboard
          </h2>
          <div className="mt-3 h-1 w-32 mx-auto bg-brand-accent"></div>
          <p className="mt-4 text-nerd-dark text-sm font-medium">
            Top teams competing for glory in the Quest
          </p>
        </div>
        <div className="-mx-8 -mb-8 overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-brand-primary">
            <thead className="bg-brand-primary">
              <tr className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-white">
                <th className="px-6 py-5 text-left">Rank</th>
                <th className="px-6 py-5 text-left">Team</th>
                <th className="px-6 py-5 text-left">Score</th>
                <th className="px-6 py-5 text-left">Penalties</th>
                <th className="px-6 py-5 text-left">Last Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/20 text-sm text-nerd-dark">
              {board.map((team, index) => {
                const timestamp = team.lastHintSubmittedAt
                  ? new Date(team.lastHintSubmittedAt).toLocaleString()
                  : "-";

                const isTopThree = index < 3;
                const rankColors = [
                  "text-brand-highlight font-bold",
                  "text-brand-accent font-bold",
                  "text-brand-secondary font-bold",
                ];

                const penalties = team.penalties ?? 0;
                const isPenaltyWarning = penalties >= 15;
                const isPenaltyMax = penalties >= 20;

                return (
                  <tr
                    key={team.name ?? index}
                    className={`transition-all hover:bg-brand-accent/10 ${
                      isTopThree ? "bg-brand-highlight/5" : ""
                    }`}
                  >
                    <td
                      className={`px-6 py-5 font-pixel text-[0.75rem] uppercase tracking-[0.25em] ${
                        isTopThree ? rankColors[index] : "text-nerd-dark"
                      }`}
                    >
                      #{index + 1}
                    </td>
                    <td className="px-6 py-5 font-semibold text-nerd-darker">
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
                      <span className="inline-block px-3 py-1 rounded-full bg-brand-primary text-white font-bold">
                        {team.score}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold ${
                          isPenaltyMax
                            ? "bg-red-500 text-white"
                            : isPenaltyWarning
                            ? "bg-orange-500 text-white"
                            : penalties > 0
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {penalties}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-nerd-dark/70 text-xs">
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
