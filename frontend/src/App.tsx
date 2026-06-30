// src/App.tsx
import React, { Suspense } from 'react';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';
import LoadingSpinner from './shared/components/LoadingSpinner';
import { AuthProvider } from './features/auth/AuthProvider';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
