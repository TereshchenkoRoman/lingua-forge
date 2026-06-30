import { lazy, Suspense, useEffect } from 'react';

import { SITE_NAME } from '../../../config/site';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import AuthCard from '../components/AuthCard';

const PasswordResetConfirmForm = lazy(
  () => import('../components/forms/PasswordResetConfirmForm'),
);

export default function PasswordResetConfirmPage(): JSX.Element {
  useEffect(() => {
    document.title = `Set new password — ${SITE_NAME}`;
  }, []);

  return (
    <AuthCard
      aria-labelledby="password-reset-confirm-heading"
      aria-label="Password reset confirmation card"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <PasswordResetConfirmForm />
      </Suspense>
    </AuthCard>
  );
}