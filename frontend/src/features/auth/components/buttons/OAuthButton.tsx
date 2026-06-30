import type { CSSProperties } from 'react';

import googleLogo from '../../../../assets/google-logo.svg';
import AuthService from '../../../../lib/auth/auth.service';

type Provider = 'google';

type Props = {
  provider: Provider;
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
  label?: string;
};

const providerLabel: Record<Provider, string> = {
  google: 'Google',
};

export default function OAuthButton({
  provider,
  className = '',
  disabled = false,
  style,
  label,
}: Props): JSX.Element {
  const buttonLabel = label ?? `Continue with ${providerLabel[provider]}`;

  const handleClick = async () => {
    if (disabled) return;

    try {
      const { url } = await AuthService.getGoogleOAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start OAuth flow', error);
      alert('OAuth failed to start. Please try again.');
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      style={style}
      aria-label={buttonLabel}
      className={`auth-form__oauth ${className}`.trim()}
    >
      <span className="auth-form__oauth-icon" aria-hidden="true">
        <img
          src={googleLogo}
          alt=""
          className="auth-form__oauth-logo"
          width={18}
          height={18}
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </span>

      <span className="auth-form__oauth-text">{buttonLabel}</span>
    </button>
  );
}