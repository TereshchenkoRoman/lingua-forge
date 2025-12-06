import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGoogleAuthUrl } from "../api/authApi";

const Login: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.login(email, password);
      navigate("/profile");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? null);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingGoogle(true);
    try {
      const resp = await getGoogleAuthUrl();
      const url = resp?.auth_url;
      if (!url) throw new Error("No auth URL returned from server");
      window.location.href = url;
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? null);
      setLoadingGoogle(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {error && <div>{error}</div>}

      <form onSubmit={submit}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit">Login</button>
      </form>

      <div style={{ marginTop: 12 }}>
        <Link to="/register">Register</Link>
      </div>

      <div style={{ marginTop: 8 }}>
        <Link to="/password-reset">Forgot password?</Link>
        {auth.isAuthenticated() && (
          <button style={{ marginLeft: 8 }} onClick={() => navigate("/profile/change-password")}>
            Change password
          </button>
        )}
      </div>

      <hr />

      <div>
        <button onClick={handleGoogleSignIn} disabled={loadingGoogle} aria-label="Sign in with Google">
          <img
            src="https://developers.google.com/identity/images/btn_google_signin_dark_normal_web.png"
            alt="Sign in with Google"
            width={191}
            height={46}
          />
        </button>
      </div>
    </div>
  );
};

export default Login;