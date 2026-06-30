import { useMemo, useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { SITE_NAME } from '../../../config/site';
import type { UserResponse } from '../../../types/api';
import { useUpdateProfile } from '../hooks/useProfile';

import './ProfileForm.css';

const englishLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

type EnglishLevel = (typeof englishLevels)[number];

const levelDescriptions: Record<EnglishLevel, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
};

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  profile: z.object({
    level_english: z.enum(englishLevels),
    allow_save_audio: z.boolean(),
  }),
});

type FormData = z.infer<typeof profileSchema>;

type Props = {
  initial: UserResponse;
};

type AccountInfoItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'purple' | 'blue' | 'violet' | 'green';
};

function getFullName(user: UserResponse): string {
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'English learner';
}

function getLevelDescription(level: EnglishLevel): string {
  return levelDescriptions[level];
}

function getMutationLoadingState(mutation: ReturnType<typeof useUpdateProfile>): boolean {
  const state = mutation as {
    isPending?: boolean;
    isLoading?: boolean;
  };

  return Boolean(state.isPending || state.isLoading);
}

function getInputClassName(hasError?: boolean): string {
  return hasError ? 'profile-edit-input profile-edit-input--error' : 'profile-edit-input';
}

export default function ProfileForm({ initial }: Props): JSX.Element {
  const mutation = useUpdateProfile();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const fullName = useMemo(() => getFullName(initial), [initial]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: initial.first_name ?? '',
      last_name: initial.last_name ?? '',
      profile: {
        level_english: initial.profile?.level_english ?? 'A1',
        allow_save_audio: initial.profile?.allow_save_audio ?? false,
      },
    },
  });

  const selectedLevel = watch('profile.level_english');
  const allowSaveAudio = watch('profile.allow_save_audio');
  const isSaving = isSubmitting || getMutationLoadingState(mutation);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setSuccessMessage(null);
    setServerError(null);

    try {
      await mutation.mutateAsync(data);
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      console.error('Profile update failed', error);
      setServerError('Failed to update profile. Please try again.');
    }
  };

  const accountItems: AccountInfoItemProps[] = [
    {
      icon: <UserIcon />,
      label: 'Profile name',
      value: fullName,
      tone: 'purple',
    },
    {
      icon: <CalendarIcon />,
      label: 'Member since',
      value: 'May 2025',
      tone: 'blue',
    },
    {
      icon: <LevelIcon />,
      label: 'Current level',
      value: `${selectedLevel} · ${getLevelDescription(selectedLevel)}`,
      tone: 'violet',
    },
    {
      icon: <CheckIcon />,
      label: 'Profile completion',
      value: '100%',
      tone: 'green',
    },
  ];

  return (
    <div className="profile-edit-shell">
      <form
        className="profile-edit-card profile-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="profile-edit-card__header">
          <div>
            <h2>Personal information</h2>
            <p>These details are used to personalize your English learning experience.</p>
          </div>

          <span className="profile-edit-card__badge">
            {selectedLevel} · {getLevelDescription(selectedLevel)}
          </span>
        </div>

        {successMessage && (
          <div className="profile-edit-alert profile-edit-alert--success" role="status">
            <CheckIcon />
            {successMessage}
          </div>
        )}

        {serverError && (
          <div className="profile-edit-alert profile-edit-alert--error" role="alert">
            <WarningIcon />
            {serverError}
          </div>
        )}

        <div className="profile-edit-form__grid">
          <div className="profile-edit-field">
            <label htmlFor="first_name">
              First name <span>*</span>
            </label>

            <div className={getInputClassName(Boolean(errors.first_name))}>
              <UserIcon />
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                {...register('first_name')}
              />
            </div>

            {errors.first_name?.message && (
              <p className="profile-edit-field__error">{errors.first_name.message}</p>
            )}
          </div>

          <div className="profile-edit-field">
            <label htmlFor="last_name">
              Last name <span>*</span>
            </label>

            <div className={getInputClassName(Boolean(errors.last_name))}>
              <UserIcon />
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                {...register('last_name')}
              />
            </div>

            {errors.last_name?.message && (
              <p className="profile-edit-field__error">{errors.last_name.message}</p>
            )}
          </div>

          <div className="profile-edit-field profile-edit-field--full">
            <label htmlFor="email">Email address</label>

            <div className="profile-edit-input profile-edit-input--readonly">
              <MailIcon />
              <input
                id="email"
                type="email"
                value={initial.email ?? ''}
                readOnly
                aria-readonly="true"
              />
              <LockIcon />
            </div>

            <p className="profile-edit-field__hint">Email cannot be changed.</p>
          </div>

          <div className="profile-edit-field profile-edit-field--full">
            <label htmlFor="level_english">
              English level <span>*</span>
            </label>

            <div className={getInputClassName(Boolean(errors.profile?.level_english))}>
              <LevelIcon />

              <select id="level_english" {...register('profile.level_english')}>
                {englishLevels.map((level) => (
                  <option key={level} value={level}>
                    {level} · {getLevelDescription(level)}
                  </option>
                ))}
              </select>
            </div>

            <p className="profile-edit-field__hint">
              This helps us personalize your learning experience.
            </p>

            {errors.profile?.level_english?.message && (
              <p className="profile-edit-field__error">
                {errors.profile.level_english.message}
              </p>
            )}
          </div>

          <div className="profile-edit-divider" aria-hidden="true" />

          <div className="profile-edit-field profile-edit-field--full">
            <Controller
              control={control}
              name="profile.allow_save_audio"
              render={({ field }) => (
                <label className="profile-edit-toggle" htmlFor="allow_save_audio">
                  <input
                    id="allow_save_audio"
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />

                  <span className="profile-edit-toggle__box" aria-hidden="true">
                    <span />
                  </span>

                  <span className="profile-edit-toggle__content">
                    <strong>Allow saving audio recordings</strong>
                    <small>
                      {SITE_NAME} can use your saved recordings for transcription and
                      pronunciation feedback.
                    </small>
                  </span>
                </label>
              )}
            />

            {errors.profile?.allow_save_audio?.message && (
              <p className="profile-edit-field__error">
                {errors.profile.allow_save_audio.message}
              </p>
            )}
          </div>
        </div>

        <div className="profile-edit-form__actions">
          <button
            type="submit"
            className="profile-edit-save-button"
            disabled={isSaving || !isDirty}
          >
            <SaveIcon />
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>

          <Link to="/profile" className="profile-edit-cancel-button">
            Cancel
          </Link>
        </div>
      </form>

      <aside className="profile-edit-card profile-edit-side-card" aria-label="Account summary">
        <div className="profile-edit-side-card__header">
          <h2>Your account</h2>
          <p>Current profile status and account details.</p>
        </div>

        <div className="profile-edit-side-list">
          {accountItems.map((item) => (
            <AccountInfoItem key={item.label} {...item} />
          ))}
        </div>

        <div className="profile-edit-note">
          <ShieldIcon />
          <p>Changes will update your account profile immediately after saving.</p>
        </div>

        <div className="profile-edit-audio-status">
          <span
            className={
              allowSaveAudio
                ? 'profile-edit-audio-status__dot profile-edit-audio-status__dot--on'
                : 'profile-edit-audio-status__dot'
            }
          />

          <div>
            <strong>Audio storage</strong>
            <small>{allowSaveAudio ? 'Allowed' : 'Disabled'}</small>
          </div>
        </div>
      </aside>
    </div>
  );
}

function AccountInfoItem({ icon, label, value, tone }: AccountInfoItemProps): JSX.Element {
  return (
    <div className="profile-edit-account-item">
      <span
        className={`profile-edit-account-item__icon profile-edit-account-item__icon--${tone}`}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function UserIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

function MailIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M3 5h18v14H3V5Zm9 7 7-5H5l7 5Zm0 2-7-5v8h14V9l-7 5Z" />
    </svg>
  );
}

function LevelIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 17h3V7H4v10Zm5 0h3V4H9v13Zm5 0h3v-7h-3v7Zm5 0h1V2h-1a2 2 0 0 0-2 2v13h2Z" />
    </svg>
  );
}

function LockIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M17 9V7A5 5 0 0 0 7 7v2H5v13h14V9h-2ZM9 9V7a3 3 0 0 1 6 0v2H9Zm4 5.7V18h-2v-3.3a2 2 0 1 1 2 0Z" />
    </svg>
  );
}

function SaveIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4ZM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM6 8V5h9v3H6Z" />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="m9 16.2-3.5-3.5L4.1 14.1 9 19 20.3 7.7l-1.4-1.4L9 16.2Z" />
    </svg>
  );
}

function WarningIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
    </svg>
  );
}

function CalendarIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M7 2h2v3h6V2h2v3h4v17H3V5h4V2Zm12 8H5v10h14V10Z" />
    </svg>
  );
}

function ShieldIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 2 4 5v6c0 5.1 3.4 9.9 8 11 4.6-1.1 8-5.9 8-11V5l-8-3Zm3.7 7.7-4.4 4.4-2-2 1.4-1.4.6.6 3-3 1.4 1.4Z" />
    </svg>
  );
}