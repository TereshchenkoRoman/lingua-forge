import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { useCurrentUser } from '../hooks/useUser';
import LoadingSpinner from '../shared/components/LoadingSpinner';

type Props = {
  children: ReactElement;
};

export default function ProtectedRoute({ children }: Props): ReactElement {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}