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
      <div className="pixel-card">
        <h2 className="font-pixel text-2xl uppercase tracking-[0.35em] text-brand-gold drop-shadow-neon">
          Leaderboard
        </h2>
        <p className="mt-4 text-brand-cyan/80">
          Brightest guilds light up the NerdCon skyline. Keep hunting and defend
          your rank.
        </p>
      </div>

      <div className="pixel-card overflow-hidden">
        <div className="-mx-8 -mb-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-emerald/40">
            <thead className="bg-brand-obsidian/80">
              <tr className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-brand-emerald">
                <th className="px-6 py-4 text-left">Rank</th>
                <th className="px-6 py-4 text-left">Team</th>
                <th className="px-6 py-4 text-left">Score</th>
                <th className="px-6 py-4 text-left">Hint Index</th>
                <th className="px-6 py-4 text-left">Last Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-emerald/20 text-sm text-brand-cyan/90">
              {board.map((team, index) => {
                const timestamp = team.lastHintSubmittedAt
                  ? new Date(team.lastHintSubmittedAt).toLocaleString()
                  : "-";

                return (
                  <tr
                    key={team.name ?? index}
                    className="transition hover:bg-brand-emerald/10 hover:text-brand-emerald"
                  >
                    <td className="px-6 py-4 font-pixel text-[0.75rem] uppercase tracking-[0.25em] text-brand-gold">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-cyan">
                      {team.name}
                    </td>
                    <td className="px-6 py-4">{team.score}</td>
                    <td className="px-6 py-4">{team.currentHintIndex}</td>
                    <td className="px-6 py-4 text-brand-cyan/70">
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
