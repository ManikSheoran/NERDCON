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
        <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-mellow drop-shadow-highlight">
          Team Login
        </h2>
        <p className="mt-4 text-brand-highlight/80">
          Jack into the Quest console and continue hunting for the next
          clue.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 text-left"
        >
          <label className="pixel-label" htmlFor="email">
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
          <label className="pixel-label" htmlFor="password">
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
          <button type="submit" className="pixel-button w-full justify-center">
            Enter Lobby
          </button>
        </form>
        <p className="mt-8 text-sm text-brand-mellow">
          Need credentials?{" "}
          <Link
            to="/register"
            className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-brand-highlight hover:drop-shadow-accent"
          >
            Register your guild
          </Link>
        </p>
      </div>
    </div>
  );
}
