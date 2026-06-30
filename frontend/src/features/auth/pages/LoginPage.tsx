import { lazy, Suspense, useEffect } from 'react';

import { SITE_NAME } from '../../../config/site';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import AuthCard from '../components/AuthCard';

const LoginForm = lazy(() => import('../components/forms/LoginForm'));

export default function LoginPage(): JSX.Element {
  useEffect(() => {
    document.title = `Login — ${SITE_NAME}`;
  }, []);

  return (
    <AuthCard aria-label="Login page card" aria-labelledby="login-title">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}