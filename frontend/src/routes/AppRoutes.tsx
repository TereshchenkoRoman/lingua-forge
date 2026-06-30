import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Route, Routes } from 'react-router-dom';

import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

type LazyComponent = LazyExoticComponent<ComponentType>;

function safeLazy(factory: () => Promise<{ default: ComponentType }>): LazyComponent {
  return lazy(factory);
}

const HomePage = safeLazy(() => import('../pages/HomePage'));

const Dashboard = safeLazy(() => import('../pages/Dashboard'));
const NotFoundPage = safeLazy(() => import('../pages/NotFoundPage'));

const LoginPage = safeLazy(() => import('../features/auth/pages/LoginPage'));
const SignupPage = safeLazy(() => import('../features/auth/pages/SignupPage'));
const EmailConfirmPage = safeLazy(() => import('../features/auth/pages/EmailConfirmPage'));
const LogoutBufferPage = safeLazy(() => import('../features/auth/pages/LogoutBufferPage'));
const OAuthBufferPage = safeLazy(() => import('../features/auth/components/OAuthBufferPage'));

const PasswordResetRequestPage = safeLazy(
  () => import('../features/auth/pages/PasswordResetRequestPage'),
);

const PasswordResetConfirmPage = safeLazy(
  () => import('../features/auth/pages/PasswordResetConfirmPage'),
);

const ProfilePage = safeLazy(() => import('../features/profile/pages/ProfilePage'));
const ProfileEditPage = safeLazy(() => import('../features/profile/pages/ProfileEditPage'));

const ProfileCompletionPage = safeLazy(
  () => import('../features/profile/pages/ProfileCompletionPage'),
);

function LoadingFallback(): JSX.Element {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      Loading...
    </div>
  );
}

export default function AppRoutes(): JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/email-confirm" element={<EmailConfirmPage />} />
          <Route path="/password-reset" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />
          <Route path="/profile/complete" element={<ProfileCompletionPage />} />
        </Route>

        <Route path="/oauth2/redirect" element={<OAuthBufferPage />} />
        <Route path="/logout" element={<LogoutBufferPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}