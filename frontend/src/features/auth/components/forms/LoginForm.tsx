import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AuthService from '../../../../lib/auth/auth.service';
import { getNextFromSearch, resolvePostLogin } from '../../../../lib/auth/postLogin';
import type { LoginRequest } from '../../../../types/api';

import AuthFormDivider from '../AuthFormDivider';
import AuthFormHeader from '../AuthFormHeader';
import AuthFormPrompt from '../AuthFormPrompt';
import OAuthButton from '../buttons/OAuthButton';
import SubmitButton from '../buttons/SubmitButton';
import AuthCheckbox from '../fields/AuthCheckbox';
import AuthTextField from '../fields/AuthTextField';
import PasswordToggleButton from '../fields/PasswordToggleButton';

import '../AuthForm.css';

type LoginValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type ServerErrors = Record<string, unknown>;

const isServerErrorResponse = (
  error: unknown,
): error is { response: { data?: unknown } } =>
  Boolean(error && typeof error === 'object' && 'response' in error);

export default function LoginForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleServerErrors = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      setServerMessage('Login failed. Please try again.');
      return;
    }

    Object.entries(data as ServerErrors).forEach(([key, value]) => {
      const message = Array.isArray(value) ? value.join(' ') : String(value);

      if (key === 'non_field_errors' || key === 'detail') {
        setServerMessage(message);
        return;
      }

      setError(key as keyof LoginValues, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit: SubmitHandler<LoginValues> = async ({ email, password }) => {
    setServerMessage(null);

    try {
      const payload: LoginRequest = { email, password };

      await AuthService.login(payload);

      const user = await AuthService.getCurrentUser().catch(() => null);
      const next = getNextFromSearch(location.search);
      const target = resolvePostLogin(user ?? undefined, next, undefined);

      navigate(target, { replace: true });
    } catch (error) {
      if (isServerErrorResponse(error) && error.response.data) {
        handleServerErrors(error.response.data);
        return;
      }

      setServerMessage('Login failed. No response from server.');
    }
  };

  const emailField = register('email', {
    required: 'Email is required',
  });

  const passwordField = register('password', {
    required: 'Password is required',
  });

  const rememberMeField = register('rememberMe');

  return (
    <form
      className="auth-form auth-form--login"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Login form"
    >
      <AuthFormHeader
        titleId="login-title"
        title="Welcome back"
        subtitle="Log in to continue practicing English with your AI tutor."
      />

      {serverMessage && (
        <div role="alert" className="auth-form__error auth-form__error--global">
          {serverMessage}
        </div>
      )}

      <AuthTextField
        id="login-email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        required
        icon="email"
        error={errors.email?.message}
        {...emailField}
      />

      <AuthTextField
        id="login-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        icon="lock"
        error={errors.password?.message}
        rightSlot={
          <PasswordToggleButton
            isVisible={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          />
        }
        {...passwordField}
      />

      <div className="auth-form__options">
        <AuthCheckbox id="login-remember" label="Remember me" {...rememberMeField} />

        <Link to="/password-reset" className="auth-form__link">
          Forgot password?
        </Link>
      </div>

      <SubmitButton
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Logging in..."
        ariaLabel="Log in"
      >
        Log in
      </SubmitButton>

      <AuthFormPrompt text="Don't have an account?" linkText="Sign up" to="/signup" />

      <AuthFormDivider />

      <OAuthButton
        provider="google"
        disabled={isSubmitting}
        label="Continue with Google"
      />
    </form>
  );
}