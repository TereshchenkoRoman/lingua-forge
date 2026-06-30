import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AuthService from '../../../lib/auth/auth.service';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

type ConfirmationStatus = 'idle' | 'loading' | 'success' | 'error';

export default function EmailConfirmPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<ConfirmationStatus>('idle');

  useEffect(() => {
    let isMounted = true;

    const confirmEmail = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      setStatus('loading');

      try {
        await AuthService.confirmEmail(token);

        if (!isMounted) return;

        setStatus('success');

        window.setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 1500);
      } catch (error) {
        console.error('Email confirmation failed', error);

        if (isMounted) {
          setStatus('error');
        }
      }
    };

    confirmEmail();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  if (status === 'idle' || status === 'loading') {
    return (
      <section>
        <h1>Confirming email…</h1>
        <LoadingSpinner />
      </section>
    );
  }

  if (status === 'success') {
    return (
      <section>
        <h1>Email confirmed</h1>
        <p>Redirecting to login…</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Confirmation failed</h1>
      <p>Invalid or expired token. Please request a new confirmation email.</p>
    </section>
  );
}