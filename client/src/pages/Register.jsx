import { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", form);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="pixel-card w-full max-w-xl text-center">
        <h2 className="font-pixel text-2xl uppercase tracking-[0.35em] text-brand-gold drop-shadow-neon">
          Register Team
        </h2>
        <p className="mt-4 text-brand-cyan/80">
          Spin up a new guild and prepare to decode the world of NerdCon.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 text-left"
        >
          <label className="pixel-label" htmlFor="name">
            Guild Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="The Block Breakers"
            value={form.name}
            onChange={handleChange("name")}
            required
            className="pixel-input"
          />
          <label className="pixel-label" htmlFor="email">
            Contact Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="guild@nerdcon.quest"
            value={form.email}
            onChange={handleChange("email")}
            required
            className="pixel-input"
          />
          <label className="pixel-label" htmlFor="password">
            Secret Passcode
          </label>
          <input
            id="password"
            type="password"
            placeholder="Create a strong key"
            value={form.password}
            onChange={handleChange("password")}
            required
            className="pixel-input"
          />
          <button type="submit" className="pixel-button w-full justify-center">
            Forge Team
          </button>
        </form>
        <p className="mt-8 text-sm text-brand-cyan/70">
          Already have access?{" "}
          <Link
            to="/login"
            className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-brand-emerald hover:drop-shadow-emerald"
          >
            Return to login
          </Link>
        </p>
      </div>
    </div>
  );
}
