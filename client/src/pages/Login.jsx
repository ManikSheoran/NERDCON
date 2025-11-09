import { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      navigate("/game");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="pixel-card w-full max-w-xl text-center">
        <div className="mb-6 inline-block">
          <h2 className="font-pixel text-2xl uppercase tracking-[0.35em] text-brand-secondary drop-shadow-accent">
            Team Login
          </h2>
          <div className="mt-3 h-1 w-full bg-brand-accent"></div>
        </div>
        <p className="mt-4 text-nerd-dark leading-relaxed">
          Jack into the Quest console and continue hunting for the next clue.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 text-left"
        >
          <div>
            <label className="pixel-label mb-3 block" htmlFor="email">
              Access ID
            </label>
            <input
              id="email"
              type="number"
              autoComplete="email"
              placeholder="Team ID aka leader's phone number"
              value={form.email}
              onChange={handleChange("email")}
              required
              className="pixel-input"
            />
          </div>
          <div>
            <label className="pixel-label mb-3 block" htmlFor="password">
              Secret Key
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              value={form.password}
              onChange={handleChange("password")}
              required
              className="pixel-input"
            />
          </div>
          <button
            type="submit"
            className="pixel-button w-full justify-center mt-4"
          >
            Enter Lobby
          </button>
        </form>
        <div className="mt-10 pt-6 border-t-2 border-brand-primary">
          <p className="text-sm text-nerd-dark">
            Need credentials?{" "}
            <Link
              to="/register"
              className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-brand-primary hover:text-brand-accent transition-colors"
            >
              Register your guild
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
