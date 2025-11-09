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
        <div className="mb-6 inline-block">
          <h2 className="font-pixel text-xl uppercase tracking-[0.35em] text-brand-primary">
            Register Team
          </h2>
          <div className="mt-3 h-1 w-full bg-brand-primary rounded-full border border-brand-pink-400"></div>
        </div>
        <p className="mt-4 text-gray-300 leading-relaxed">
          Spin up a new guild and prepare to decode the world of hunting.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 text-left"
        >
          <div>
            <label className="pixel-label mb-3 block" htmlFor="name">
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
          </div>
          <div>
            <label className="pixel-label mb-3 block" htmlFor="email">
              Leader's Contact ID
            </label>
            <input
              id="email"
              type="number"
              placeholder="1234567890"
              value={form.email}
              onChange={handleChange("email")}
              required
              className="pixel-input"
            />
          </div>
          <div>
            <label className="pixel-label mb-3 block" htmlFor="password">
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
          </div>
          <button
            type="submit"
            className="pixel-button w-full justify-center mt-4"
          >
            Forge Team
          </button>
        </form>
        <div className="mt-10 pt-6 border-t-2 border-brand-gray-700">
          <p className="text-sm text-gray-300">
            Already have access?{" "}
            <Link
              to="/login"
              className="font-pixel text-[0.7rem] uppercase tracking-[0.3em] text-brand-primary hover:text-brand-pink-400 transition-colors"
            >
              Return to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
