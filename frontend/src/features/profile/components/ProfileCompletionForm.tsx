import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import AuthService from '../../../lib/auth/auth.service';
import { DEFAULT_POST_LOGIN } from '../../../lib/auth/postLogin';

import AuthFormDivider from '../../auth/components/AuthFormDivider';
import AuthFormHeader from '../../auth/components/AuthFormHeader';
import SubmitButton from '../../auth/components/buttons/SubmitButton';
import AuthCheckbox from '../../auth/components/fields/AuthCheckbox';
import AuthSelectField from '../../auth/components/fields/AuthSelectField';
import AuthTextField from '../../auth/components/fields/AuthTextField';

import '../../auth/components/AuthForm.css';
import './ProfileCompletionForm.css';

type EnglishLevel = '' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

type FormValues = {
  first_name: string;
  last_name: string;
  level_english: EnglishLevel;
  allow_save_audio: boolean;
};

type ServerErrors = Record<string, unknown>;

const englishLevelOptions = [
  { value: '', label: 'Select your current level' },
  { value: 'A1', label: 'A1 — Beginner' },
  { value: 'A2', label: 'A2 — Elementary' },
  { value: 'B1', label: 'B1 — Intermediate' },
  { value: 'B2', label: 'B2 — Upper-intermediate' },
  { value: 'C1', label: 'C1 — Advanced' },
  { value: 'C2', label: 'C2 — Proficient' },
] as const;

const isServerErrorResponse = (
  error: unknown,
): error is { response: { data?: unknown } } =>
  Boolean(error && typeof error === 'object' && 'response' in error);

export default function ProfileCompletionForm(): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      level_english: '',
      allow_save_audio: false,
    },
  });

  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();

        if (!isMounted) return;

        reset({
          first_name: user?.first_name ?? '',
          last_name: user?.last_name ?? '',
          level_english: (user?.profile?.level_english as EnglishLevel) ?? '',
          allow_save_audio: Boolean(user?.profile?.allow_save_audio),
        });
      } catch (error) {
        console.error('Failed to load current user for profile completion', error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [reset]);

  const handleServerErrors = (data: unknown) => {
    if (!data || typeof data !== 'object') {
      setServerMessage('Saving profile failed. Please try again.');
      return;
    }

    Object.entries(data as ServerErrors).forEach(([key, value]) => {
      const message = Array.isArray(value) ? value.join(' ') : String(value);

      if (key === 'non_field_errors' || key === 'detail') {
        setServerMessage(message);
        return;
      }

      const fieldName = key.replace(/^profile\./, '') as keyof FormValues;

      setError(fieldName, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit: SubmitHandler<FormValues> = async ({
    first_name,
    last_name,
    level_english,
    allow_save_audio,
  }) => {
    setServerMessage(null);

    try {
      await AuthService.updateCurrentUser({
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        profile: {
          level_english: level_english || undefined,
          allow_save_audio: Boolean(allow_save_audio),
        },
      });

      navigate(DEFAULT_POST_LOGIN, { replace: true });
    } catch (error) {
      if (isServerErrorResponse(error) && error.response.data) {
        handleServerErrors(error.response.data);
        return;
      }

      setServerMessage('Saving profile failed. No response from server.');
    }
  };

  const handleSkip = () => {
    navigate(DEFAULT_POST_LOGIN, { replace: true });
  };

  const firstNameField = register('first_name');
  const lastNameField = register('last_name');
  const englishLevelField = register('level_english');
  const audioConsentField = register('allow_save_audio');

  return (
    <form
      className="auth-form auth-form--profile-completion profile-completion-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Profile completion form"
    >
      <AuthFormHeader
        titleId="profile-complete-title"
        title="Complete your profile"
        subtitle="Finish setting up your account to personalize your learning experience."
      />

      {serverMessage && (
        <div role="alert" className="auth-form__error auth-form__error--global">
          {serverMessage}
        </div>
      )}

      <AuthTextField
        id="profile-first-name"
        label="First name"
        type="text"
        placeholder="Enter your first name"
        autoComplete="given-name"
        icon="user"
        error={errors.first_name?.message}
        autoFocus
        {...firstNameField}
      />

      <AuthTextField
        id="profile-last-name"
        label="Last name"
        type="text"
        placeholder="Enter your last name"
        autoComplete="family-name"
        icon="user"
        error={errors.last_name?.message}
        {...lastNameField}
      />

      <AuthSelectField
        id="profile-level"
        label="English level"
        icon="level"
        options={englishLevelOptions}
        error={errors.level_english?.message}
        {...englishLevelField}
      />

      <div className="profile-completion-form__consent">
        <AuthCheckbox
          id="profile-allow-audio"
          label="I agree to store and process my voice recordings"
          {...audioConsentField}
        />

        <p>
          This allows LinguForge to transcribe your speech and provide personalized
          pronunciation feedback.
        </p>
      </div>

      <SubmitButton
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Saving profile..."
        ariaLabel="Complete setup"
      >
        Complete setup
      </SubmitButton>

      <AuthFormDivider />

      <button
        type="button"
        className="auth-form__oauth profile-completion-form__skip"
        onClick={handleSkip}
        disabled={isSubmitting}
        aria-label="Skip profile completion and continue"
      >
        <span className="profile-completion-form__skip-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 3 2 11.4l1.3 1.5L5 11.5V20h5v-5h4v5h5v-8.5l1.7 1.4 1.3-1.5L12 3Zm5 15h-1v-5H8v5H7v-8.2l5-4.2 5 4.2V18Z" />
          </svg>
        </span>

        <span>Skip for now</span>
      </button>

      <p className="profile-completion-form__note">
        You can update these details later in Profile Settings.
      </p>
    </form>
  );
}