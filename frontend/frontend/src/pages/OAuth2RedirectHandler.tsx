import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeGoogleAuth } from "../api/authApi";
import { getAuthStore } from "../stores/authStore";
import api from "../api/axios";

let completeOncePromise: Promise<void> | null = null;
let oauthFinalizeDone = false;

export default function OAuth2RedirectHandler(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const finalizeOnce = async () => {
      if (oauthFinalizeDone) return;

      if (!completeOncePromise) {
        completeOncePromise = (async () => {
          const store = getAuthStore();

          const data = await completeGoogleAuth();
          if (!data?.access) {
            throw new Error("No access token returned from server");
          }

          store.setAccess(data.access, { persist: true });

          if (data.user) {
            store.setUser(data.user);
          } else {
            const resp = await api.get("/auth/profile/");
            if (resp?.data) {
              store.setUser(resp.data);
            }
          }
        })();

        completeOncePromise = completeOncePromise.catch((err) => {
          completeOncePromise = null;
          throw err;
        });
      }

      await completeOncePromise;
      oauthFinalizeDone = true;

      if (mounted) {
        navigate("/profile", { replace: true });
        setTimeout(() => {
          if (!mounted) return;
          if (window.location.pathname === "/oauth2/redirect") {
            window.location.replace("/profile");
          }
        }, 300);
      }
    };

    finalizeOnce().catch((err: any) => {
      if (!mounted) return;
      const message = err?.response?.data?.detail ?? err?.message ?? "Authentication failed";
      setError(String(message));
      try {
        getAuthStore().logout();
      } catch {
        // swallow
      }
    });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Authentication error</h2>
        <p>{error}</p>
        <p>Please try signing in again.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Signing you in…</h2>
      <p>Please wait while we finish signing you in.</p>
    </div>
  );
}