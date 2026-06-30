import { useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import AuthService from '../../../../lib/auth/auth.service';

import AuthFormHeader from '../AuthFormHeader';
import SubmitButton from '../buttons/SubmitButton';
import AuthTextField from '../fields/AuthTextField';
import PasswordToggleButton from '../fields/PasswordToggleButton';

import '../AuthForm.css';
import './PasswordResetConfirmForm.css';

type ResetFormValues = {
  uid?: string;
  token?: string;
  new_password: string;
  re_new_password: string;
};

type ServerErrors = Record<string, unknown>;

const passwordRequirements = [
  {
    label: 'At least 8 characters',
    isComplete: (password: string) => password.length >= 8,
  },
  {
    label: 'At least one uppercase letter',
    isComplete: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'At least one lowercase letter',
    isComplete: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'At least one number',
    isComplete: (password: string) => /\d/.test(password),
  },
];

const isServerErrorResponse = (
  error: unknown,
): error is { response: { data?: unknown } } =>
  Boolean(error && typeof error === 'object' && 'response' in error);

export default function PasswordResetConfirmForm(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uidFromUrl = searchParams.get('uid') ?? '';
  const tokenFromUrl = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    defaultValues: {
      uid: uidFromUrl || undefined,
      token: tokenFromUrl || undefined,
      new_password: '',
      re_new_password: '',
    },
  });

  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPassword = watch('new_password', '');
  const confirmPassword = watch('re_new_password', '');

  const requirementItems = useMemo(
    () =>
      passwordRequirements.map(({ label, isComplete }) => ({
        label,
        isComplete: isComplete(newPassword ?? ''),
      })),
    [newPassword],
  );

  const passwordsDoNotMatch =
    Boolean(newPassword && confirmPassword) &&
    newPassword.trim() !== confirmPassword.trim();

  const handleServerErrors = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      setServerMessage('Failed to reset password. Please try again.');
      return;
    }

    Object.entries(data as ServerErrors).forEach(([key, value]) => {
      const message = Array.isArray(value) ? value.join(' ') : String(value);

      if (key === 'non_field_errors' || key === 'detail') {
        setServerMessage(message);
        return;
      }

      setError(key as keyof ResetFormValues, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit: SubmitHandler<ResetFormValues> = async (data) => {
    setServerMessage(null);
    setIsSuccess(false);

    const newPass = data.new_password.trim();
    const confirmPass = data.re_new_password.trim();

    if (!data.token) {
      setServerMessage('Reset link is missing. Open the link from your email or request a new one.');
      return;
    }

    if (!newPass) {
      setError('new_password', {
        type: 'required',
        message: 'New password is required',
      });
      return;
    }

    if (!confirmPass) {
      setError('re_new_password', {
        type: 'required',
        message: 'Please confirm your new password',
      });
      return;
    }

    if (newPass !== confirmPass) {
      setError('re_new_password', {
        type: 'validate',
        message: 'Passwords do not match',
      });
      return;
    }

    try {
      await AuthService.confirmPasswordReset({
        uid: data.uid,
        token: data.token,
        new_password: newPass,
      });

      setIsSuccess(true);
      setServerMessage('Password has been reset. Redirecting to login...');

      window.setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1400);
    } catch (error) {
      if (isServerErrorResponse(error) && error.response.data) {
        handleServerErrors(error.response.data);
        return;
      }

      setServerMessage('Failed to reset password. Please try again later.');
      console.error('Password reset confirm failed', error);
    }
  };

  const newPasswordField = register('new_password', {
    required: 'New password is required',
  });

  const confirmPasswordField = register('re_new_password', {
    required: 'Please confirm your new password',
  });

  const messageClassName = isSuccess
    ? 'auth-form__error password-reset-confirm-form__message password-reset-confirm-form__message--success'
    : 'auth-form__error auth-form__error--global';

  return (
    <form
      className="auth-form password-reset-confirm-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Set new password form"
    >
      <AuthFormHeader
        titleId="password-reset-confirm-heading"
        title="Create new password"
        subtitle="Enter and confirm your new password to secure your account."
      />

      {serverMessage && (
        <div role={isSuccess ? 'status' : 'alert'} className={messageClassName}>
          {serverMessage}
        </div>
      )}

      {uidFromUrl && (
        <input type="hidden" value={uidFromUrl} {...register('uid')} />
      )}

      {tokenFromUrl && (
        <input type="hidden" value={tokenFromUrl} {...register('token')} />
      )}

      <AuthTextField
        id="new_password"
        label="New password"
        type={showNewPassword ? 'text' : 'password'}
        placeholder="Enter new password"
        autoComplete="new-password"
        required
        icon="lock"
        error={errors.new_password?.message}
        rightSlot={
          <PasswordToggleButton
            isVisible={showNewPassword}
            onClick={() => setShowNewPassword((value) => !value)}
          />
        }
        {...newPasswordField}
      />

      <AuthTextField
        id="re_new_password"
        label="Confirm new password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Confirm new password"
        autoComplete="new-password"
        required
        icon="lock"
        error={errors.re_new_password?.message}
        rightSlot={
          <PasswordToggleButton
            isVisible={showConfirmPassword}
            onClick={() => setShowConfirmPassword((value) => !value)}
            labelVisible="Hide confirm password"
            labelHidden="Show confirm password"
          />
        }
        {...confirmPasswordField}
      />

      {passwordsDoNotMatch && (
        <div
          className="password-reset-confirm-form__message password-reset-confirm-form__message--error"
          role="alert"
        >
          Passwords do not match.
        </div>
      )}

      {!tokenFromUrl && (
        <div
          className="password-reset-confirm-form__message password-reset-confirm-form__message--error"
          role="alert"
        >
          Reset link is missing. <Link to="/password-reset">Request a new one</Link>.
        </div>
      )}

      <div
        className="password-reset-confirm-form__requirements"
        aria-label="Password requirements"
      >
        {requirementItems.map(({ label, isComplete }) => (
          <div key={label} className={isComplete ? 'is-complete' : ''}>
            <span aria-hidden="true">✓</span>
            {label}
          </div>
        ))}
      </div>

      <SubmitButton
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting || !tokenFromUrl}
        loadingText="Resetting password..."
        ariaLabel="Reset password"
      >
        Reset password
      </SubmitButton>

      <p className="password-reset-confirm-form__prompt">
        Remember your password? <Link to="/login">Back to login</Link>
      </p>
    </form>
  );
}