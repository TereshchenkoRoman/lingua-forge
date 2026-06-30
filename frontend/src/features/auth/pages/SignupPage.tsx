import { lazy, Suspense, useEffect } from 'react';

import { SITE_NAME } from '../../../config/site';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import AuthCard from '../components/AuthCard';

const RegisterForm = lazy(() => import('../components/forms/RegisterForm'));

export default function SignupPage(): JSX.Element {
  useEffect(() => {
    document.title = `Sign up — ${SITE_NAME}`;
  }, []);

  return (
    <AuthCard
      aria-label="Signup page card"
      aria-labelledby="signup-title"
      className="signup-card"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}