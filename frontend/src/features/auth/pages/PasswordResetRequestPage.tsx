import { lazy, Suspense, useEffect } from 'react';

import { SITE_NAME } from '../../../config/site';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import AuthCard from '../components/AuthCard';

const PasswordResetRequestForm = lazy(
  () => import('../components/forms/PasswordResetRequestForm'),
);

export default function PasswordResetRequestPage(): JSX.Element {
  useEffect(() => {
    document.title = `Reset password — ${SITE_NAME}`;
  }, []);

  return (
    <AuthCard
      aria-label="Password reset request card"
      aria-labelledby="password-reset-request-title"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <PasswordResetRequestForm />
      </Suspense>
    </AuthCard>
  );
}