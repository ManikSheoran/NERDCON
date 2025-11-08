import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-4 border-brand-emerald/80 bg-brand-obsidian/70 px-6 py-4 shadow-pixel backdrop-blur">
      <Link
        to="/game"
        className="font-pixel text-lg uppercase tracking-[0.35em] text-brand-gold drop-shadow-neon"
      >
        NerdCon Quest
      </Link>
      <div className="flex flex-wrap items-center gap-3 font-pixel text-[0.68rem] uppercase tracking-[0.3em] text-brand-cyan">
        <Link
          to="/game"
          className="rounded-2xl border-2 border-transparent px-4 py-2 transition hover:border-brand-emerald hover:text-brand-emerald hover:drop-shadow-emerald"
        >
          Game
        </Link>
        <Link
          to="/leaderboard"
          className="rounded-2xl border-2 border-transparent px-4 py-2 transition hover:border-brand-emerald hover:text-brand-emerald hover:drop-shadow-emerald"
        >
          Leaderboard
        </Link>
        {token ? (
          <button
            onClick={logout}
            type="button"
            className="pixel-button px-4 py-2 text-[0.6rem]"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="pixel-button px-4 py-2 text-[0.6rem]">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
