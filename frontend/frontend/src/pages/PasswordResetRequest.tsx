import React, { useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function PasswordResetRequestPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await api.post("/auth/password-reset/", { email });
      setStatus("If the email exists, a reset link has been sent.");
    } catch {
      setStatus("If the email exists, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Password Reset</h2>

      {status && <div>{status}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>

      <div>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}