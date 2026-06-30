import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import AuthService from '../../../../lib/auth/auth.service';

import AuthFormDivider from '../AuthFormDivider';
import AuthFormHeader from '../AuthFormHeader';
import AuthFormPrompt from '../AuthFormPrompt';
import OAuthButton from '../buttons/OAuthButton';
import SubmitButton from '../buttons/SubmitButton';
import AuthTextField from '../fields/AuthTextField';
import PasswordToggleButton from '../fields/PasswordToggleButton';

import '../AuthForm.css';

type RegisterValues = {
  email: string;
  password: string;
  password2: string;
};

type ServerErrors = Record<string, unknown>;

const isServerErrorResponse = (
  error: unknown,
): error is { response: { data?: unknown } } =>
  Boolean(error && typeof error === 'object' && 'response' in error);

export default function RegisterForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    defaultValues: {
      email: '',
      password: '',
      password2: '',
    },
  });

  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleServerErrors = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      setServerMessage('Registration failed. Please try again.');
      return;
    }

    Object.entries(data as ServerErrors).forEach(([key, value]) => {
      const message = Array.isArray(value) ? value.join(' ') : String(value);

      if (key === 'detail' || key === 'non_field_errors') {
        setServerMessage(message);
        return;
      }

      setError(key as keyof RegisterValues, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit: SubmitHandler<RegisterValues> = async ({
    email,
    password,
    password2,
  }) => {
    setServerMessage(null);

    if (password !== password2) {
      setError('password2', {
        type: 'validate',
        message: 'Passwords do not match',
      });
      return;
    }

    try {
      await AuthService.register({
        email,
        password,
        password2,
      });

      window.location.href = '/login';
    } catch (error) {
      if (isServerErrorResponse(error) && error.response.data) {
        handleServerErrors(error.response.data);
        return;
      }

      setServerMessage('Registration failed. No response from server.');
    }
  };

  const emailField = register('email', {
    required: 'Email is required',
  });

  const passwordField = register('password', {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Minimum length is 8 characters',
    },
  });

  const password2Field = register('password2', {
    required: 'Confirm password is required',
  });

  return (
    <form
      className="auth-form auth-form--register"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Register form"
    >
      <AuthFormHeader
        titleId="signup-title"
        title="Create your account"
        subtitle="Start practicing English with your AI tutor."
      />

      {serverMessage && (
        <div role="alert" className="auth-form__error auth-form__error--global">
          {serverMessage}
        </div>
      )}

      <AuthTextField
        id="reg-email"
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
        id="reg-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Create a password"
        autoComplete="new-password"
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

      <AuthTextField
        id="reg-password2"
        label="Confirm password"
        type={showPassword2 ? 'text' : 'password'}
        placeholder="Confirm your password"
        autoComplete="new-password"
        required
        icon="lock"
        error={errors.password2?.message}
        rightSlot={
          <PasswordToggleButton
            isVisible={showPassword2}
            onClick={() => setShowPassword2((value) => !value)}
            labelVisible="Hide confirm password"
            labelHidden="Show confirm password"
          />
        }
        {...password2Field}
      />

      <SubmitButton
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Creating account..."
        ariaLabel="Create account"
      >
        Create account
      </SubmitButton>

      <AuthFormPrompt text="Already have an account?" linkText="Log in" to="/login" />

      <AuthFormDivider />

      <OAuthButton
        provider="google"
        disabled={isSubmitting}
        label="Continue with Google"
      />
    </form>
  );
}