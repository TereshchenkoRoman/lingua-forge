import { lazy, Suspense, useEffect } from 'react';

import { SITE_NAME } from '../../../config/site';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import AuthCard from '../../auth/components/AuthCard';

const ProfileCompletionForm = lazy(() => import('../components/ProfileCompletionForm'));

export default function ProfileCompletionPage(): JSX.Element {
  useEffect(() => {
    document.title = `Complete Profile — ${SITE_NAME}`;
  }, []);

  return (
    <AuthCard
      aria-label="Profile completion card"
      aria-labelledby="profile-complete-title"
    >
      <Suspense fallback={<LoadingSpinner />}>
        <ProfileCompletionForm />
      </Suspense>
    </AuthCard>
  );
}