// src/App.tsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import ProtectedRoute from "./components/ProtectedRoute";
import PasswordResetRequestPage from "./pages/PasswordResetRequest";
import PasswordResetConfirmPage from "./pages/PasswordResetConfirm";

const Home: React.FC = () => <div>Home</div>;

const App: React.FC = () => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>{" | "}
          <Link to="/login">Login</Link>{" | "}
          <Link to="/register">Register</Link>{" | "}
          <Link to="/profile">Profile</Link>{" | "}
          <Link to="/password-reset">Password reset</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Password reset flow */}
          <Route path="/password-reset" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />

          {/* Protected profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;