import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PasswordResetConfirmPage(): JSX.Element {
  const query = useQuery();
  const navigate = useNavigate();
  const uid = query.get("uid");
  const token = query.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Abort pending request on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!uid || !token) {
      setMessage("Invalid or incomplete password reset link.");
      messageRef.current?.focus();
    }
  }, [uid, token]);

  const normalizeError = (err: any) => {
    const data = err?.response?.data;
    if (!data) return "Unable to change password. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    const parts: string[] = [];
    for (const k of Object.keys(data)) {
      const v = data[k];
      if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
      else if (typeof v === "string") parts.push(`${k}: ${v}`);
    }
    return parts.length ? parts.join("; ") : "Unable to change password.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirm) {
      setMessage("Passwords do not match.");
      messageRef.current?.focus();
      return;
    }
    if (!uid || !token) {
      setMessage("Invalid reset link.");
      messageRef.current?.focus();
      return;
    }

    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      const resp = await api.post(
        "/auth/password-reset/confirm/",
        { uid, token, new_password: newPassword },
        { signal: controllerRef.current.signal }
      );
      setMessage(resp.data?.detail ?? "Password changed. You can log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") {
        return;
      }
      setMessage(normalizeError(err));
      messageRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Set New Password</h2>

      {message && (
        <div ref={messageRef} tabIndex={-1} aria-live="polite">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save password"}
        </button>
      </form>
    </div>
  );
}