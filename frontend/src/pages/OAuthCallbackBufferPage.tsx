import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthService from '../lib/auth/auth.service';
import LoadingSpinner from '../shared/components/LoadingSpinner';

export default function OAuthCallbackBufferPage(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const completeOAuth = async () => {
      try {
        await AuthService.completeGoogleOAuth();

        if (isMounted) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('OAuth complete failed', error);

        if (isMounted) {
          navigate('/auth/login', { replace: true });
        }
      }
    };

    completeOAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <section style={{ padding: 24, textAlign: 'center' }}>
      <h1>Signing you in…</h1>
      <LoadingSpinner />
    </section>
  );
}