// File: frontend/src/pages/Register.tsx
import React, { useState } from "react";
import api from "../api/axios";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [level, setLevel] = useState("A1");
  const [allowSaveAudio, setAllowSaveAudio] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.post("/auth/register/", {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password2,
        level_english: level,
        allow_save_audio: allowSaveAudio,
      });
      setMessage("Registered. Check email for confirmation link.");
    } catch (err: any) {
      const respData = err?.response?.data;
      setMessage(
        typeof respData === "string" ? respData : JSON.stringify(respData) || "Registration failed"
      );
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <div>{message}</div>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>First Name</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label>Last Name</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />

        <label>Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={allowSaveAudio}
            onChange={(e) => setAllowSaveAudio(e.target.checked)}
          />
          Allow save audio
        </label>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;