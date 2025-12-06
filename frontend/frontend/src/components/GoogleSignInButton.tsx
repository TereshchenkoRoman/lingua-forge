import React, { useState } from "react";
import { getGoogleAuthUrl } from "../api/authApi";

type Props = {
  className?: string;
  ariaLabel?: string;
  onError?: (err: Error) => void;
};

const GoogleSignInButton: React.FC<Props> = ({ className, ariaLabel, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await getGoogleAuthUrl();
      const url = resp?.auth_url;
      if (!url) throw new Error("No auth URL returned from server");
      window.location.href = url;
    } catch (err: any) {
      setLoading(false);
      const error = err?.response?.data?.detail ?? err?.message ?? new Error("Failed to start Google sign-in");
      if (onError) onError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} aria-label={ariaLabel} className={className} type="button">
      <img
        src="https://developers.google.com/identity/images/btn_google_signin_dark_normal_web.png"
        alt="Sign in with Google"
        width={191}
        height={46}
        style={{ display: "block" }}
      />
    </button>
  );
};

export default GoogleSignInButton;