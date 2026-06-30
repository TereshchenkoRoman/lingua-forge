import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';

import AuthService from '../../../../lib/auth/auth.service';

import AuthFormHeader from '../AuthFormHeader';
import SubmitButton from '../buttons/SubmitButton';
import AuthTextField from '../fields/AuthTextField';

import '../AuthForm.css';
import './PasswordResetRequestForm.css';

type PasswordResetRequestValues = {
  email: string;
};

type ServerErrors = Record<string, unknown>;

const isServerErrorResponse = (
  error: unknown,
): error is { response: { data?: unknown } } =>
  Boolean(error && typeof error === 'object' && 'response' in error);

export default function PasswordResetRequestForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestValues>({
    defaultValues: {
      email: '',
    },
  });

  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleServerErrors = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      setServerMessage('Password reset request failed. Please try again.');
      return;
    }

    Object.entries(data as ServerErrors).forEach(([key, value]) => {
      const message = Array.isArray(value) ? value.join(' ') : String(value);

      if (key === 'detail' || key === 'non_field_errors') {
        setServerMessage(message);
        return;
      }

      setError(key as keyof PasswordResetRequestValues, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit: SubmitHandler<PasswordResetRequestValues> = async ({ email }) => {
    setServerMessage(null);
    setIsSent(false);

    try {
      await AuthService.requestPasswordReset({ email });
      setIsSent(true);
    } catch (error) {
      if (isServerErrorResponse(error) && error.response.data) {
        handleServerErrors(error.response.data);
        return;
      }

      setServerMessage('Password reset request failed. No response from server.');
    }
  };

  const emailField = register('email', {
    required: 'Email is required',
  });

  if (isSent) {
    const email = getValues('email');

    return (
      <div className="auth-form password-reset-request-form password-reset-request-form--sent">
        <div className="password-reset-request-form__success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm8 8 8-5H4l8 5Zm0 2L4 10v7h16v-7l-8 5Z" />
          </svg>
        </div>

        <AuthFormHeader
          titleId="password-reset-request-title"
          title="Check your email"
          subtitle="We sent a password reset link to your email address."
        />

        <div className="password-reset-request-form__sent-box">
          <span>{email}</span>
        </div>

        <p className="password-reset-request-form__sent-text">
          Open the email and follow the link to create a new password. If you do not
          see the email, check your spam folder.
        </p>

        <Link
          to="/login"
          className="auth-form__oauth password-reset-request-form__secondary-action"
        >
          Back to login
        </Link>

        <button
          type="button"
          className="password-reset-request-form__text-button"
          onClick={() => setIsSent(false)}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form
      className="auth-form password-reset-request-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Password reset request form"
    >
      <AuthFormHeader
        titleId="password-reset-request-title"
        title="Forgot your password?"
        subtitle="Enter the email linked to your account and we’ll send you a reset link."
      />

      {serverMessage && (
        <div role="alert" className="auth-form__error auth-form__error--global">
          {serverMessage}
        </div>
      )}

      <AuthTextField
        id="password-reset-email"
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

      <SubmitButton
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Sending reset link..."
        ariaLabel="Send reset link"
      >
        Send reset link
      </SubmitButton>

      <p className="password-reset-request-form__prompt">
        Remember your password? <Link to="/login">Back to login</Link>
      </p>

      <p className="password-reset-request-form__prompt password-reset-request-form__prompt--secondary">
        Don&apos;t have an account? <Link to="/signup">Create new account</Link>
      </p>
    </form>
  );
}