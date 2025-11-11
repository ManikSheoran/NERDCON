import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <header className="w-full">
      <nav
        className={`mx-auto w-full rounded-3xl border-2 border-brand-gray-700 bg-brand-secondary shadow-glow-dark transition-all duration-300 ease-out ${
          open ? "pb-4" : "pb-0"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link to="/game" className="flex items-center gap-3 group">
            <span className="font-pixel text-sm uppercase tracking-[0.3em] text-brand-primary md:text-lg group-hover:text-brand-pink-400 transition-colors">
              Of ends and beginnings
            </span>
            <span className="sr-only">Quest Home</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex font-pixel text-[0.7rem] uppercase tracking-[0.25em] text-gray-300">
            <Link
              to="/game"
              className="rounded-2xl border-2 border-transparent px-4 py-2 transition-all hover:border-brand-primary hover:text-brand-primary"
            >
              Game
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-2xl border-2 border-transparent px-4 py-2 transition-all hover:border-brand-primary hover:text-brand-primary"
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
              <Link
                to="/login"
                className="pixel-button px-4 py-2 text-[0.6rem]"
              >
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              aria-controls="mobile-nav"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-primary bg-brand-accent/10 text-brand-primary transition-all hover:bg-brand-accent/20 hover:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <svg
                className={`h-6 w-6 transform transition-all duration-300 ${
                  open ? "rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={`md:hidden px-4 transition-all duration-300 ease-out origin-top transform ${
            open
              ? "pointer-events-auto max-h-64 scale-y-100 opacity-100"
              : "pointer-events-none max-h-0 scale-y-95 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 font-pixel text-[0.85rem] uppercase tracking-[0.25em] text-nerd-dark items-center">
            <Link
              to="/game"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition-all hover:bg-brand-primary/10 hover:text-brand-primary text-center w-full"
            >
              Game
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition-all hover:bg-brand-accent/10 hover:text-brand-accent text-center w-full"
            >
              Leaderboard
            </Link>
            {token ? (
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="pixel-button w-full justify-center px-4 py-3 text-[0.65rem] mt-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="pixel-button w-full justify-center px-4 py-3 text-[0.65rem] mt-2"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </nav>
    </header>
  );
}
