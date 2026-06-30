import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { SITE_NAME } from '../../../config/site';
import { useCurrentUser } from '../../../hooks/useUser';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

import './ProfilePage.css';

type ProfileData = {
  level_english?: string | null;
  allow_save_audio?: boolean | null;
};

type UserData = {
  id?: number | string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  profile?: ProfileData | null;
};

type AudioStatus = {
  label: string;
  tone: 'success' | 'muted';
};

type SummaryStatProps = {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  hint: string;
  tone: 'orange' | 'green' | 'purple';
};

type ProfileInfoRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

type ProgressMetricProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

type QuickActionProps = {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  tone: 'purple' | 'blue' | 'green' | 'orange' | 'violet';
};

const levelDescriptions: Record<string, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
};

const stats = {
  dayStreak: 0,
  wordsLearned: 0,
  conversations: 0,
  pronunciationScore: 0,
  flashcardsReviewed: 0,
  overallProgress: 0,
};

function getFullName(user: UserData): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();

  return user.name || fullName || 'English learner';
}

function getEmail(user: UserData): string {
  return user.email || 'Email not available';
}

function getEnglishLevel(user: UserData): string {
  return user.profile?.level_english || 'Not set';
}

function getLevelDescription(level: string): string {
  return levelDescriptions[level] || 'English learner';
}

function getAudioStatus(user: UserData): AudioStatus {
  return user.profile?.allow_save_audio
    ? { label: 'Allowed', tone: 'success' }
    : { label: 'Disabled', tone: 'muted' };
}

export default function ProfilePage(): JSX.Element {
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    document.title = `Profile — ${SITE_NAME}`;
  }, []);

  if (isLoading) {
    return (
      <section className="profile-page profile-page--state" aria-label="Loading profile">
        <div className="profile-state-card">
          <LoadingSpinner />
          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <ProfileState
        type="error"
        icon="!"
        title="Could not load profile"
        text="We could not load your profile data. Please refresh the page and try again."
        ariaLabel="Profile loading error"
      />
    );
  }

  if (!user) {
    return (
      <ProfileState
        icon="?"
        title="Profile not found"
        text="Your profile data is not available yet."
        ariaLabel="Profile not found"
      />
    );
  }

  const currentUser = user as UserData;
  const fullName = getFullName(currentUser);
  const email = getEmail(currentUser);
  const englishLevel = getEnglishLevel(currentUser);
  const levelDescription = getLevelDescription(englishLevel);
  const audioStatus = getAudioStatus(currentUser);
  const levelLabel = englishLevel !== 'Not set' ? `${englishLevel} · ${levelDescription}` : 'Not set';

  const summaryStats: SummaryStatProps[] = [
    {
      icon: <FireIcon />,
      value: stats.dayStreak,
      label: 'Day streak',
      hint: 'Keep learning every day!',
      tone: 'orange',
    },
    {
      icon: <BookIcon />,
      value: stats.wordsLearned,
      label: 'Words learned',
      hint: 'Keep expanding!',
      tone: 'green',
    },
    {
      icon: <MicIcon />,
      value: `${stats.pronunciationScore}%`,
      label: 'Pronunciation score',
      hint: 'Start practicing!',
      tone: 'purple',
    },
  ];

  const infoRows: ProfileInfoRowProps[] = [
    {
      icon: <UserIcon />,
      label: 'Full name',
      value: fullName,
    },
    {
      icon: <MailIcon />,
      label: 'Email',
      value: email,
    },
    {
      icon: <LanguageIcon />,
      label: 'Native language',
      value: 'Ukrainian',
    },
    {
      icon: <ChatIcon />,
      label: 'Learning language',
      value: 'English',
    },
  ];

  const progressMetrics: ProgressMetricProps[] = [
    {
      icon: <BookIcon />,
      label: 'Words learned',
      value: stats.wordsLearned,
    },
    {
      icon: <ChatIcon />,
      label: 'Conversations',
      value: stats.conversations,
    },
    {
      icon: <MicIcon />,
      label: 'Pronunciation score',
      value: `${stats.pronunciationScore}%`,
    },
    {
      icon: <CardsIcon />,
      label: 'Flashcards reviewed',
      value: stats.flashcardsReviewed,
    },
  ];

  const quickActions: QuickActionProps[] = [
    {
      to: '/profile/edit',
      icon: <UserIcon />,
      title: 'Edit profile',
      description: 'Update your personal information',
      tone: 'purple',
    },
    {
      to: '/password-reset',
      icon: <LockIcon />,
      title: 'Change password',
      description: 'Update your account password',
      tone: 'blue',
    },
    {
      to: '/settings',
      icon: <BellIcon />,
      title: 'Notification settings',
      description: 'Manage email and in-app notifications',
      tone: 'green',
    },
    {
      to: '/settings',
      icon: <ShieldIcon />,
      title: 'Privacy settings',
      description: 'Control your data and privacy',
      tone: 'orange',
    },
    {
      to: '/profile#telegram',
      icon: <TelegramIcon />,
      title: 'Link Telegram',
      description: 'Practice with your AI tutor in Telegram',
      tone: 'violet',
    },
  ];

  return (
    <section className="profile-page" aria-labelledby="profile-page-title">
      <header className="profile-page__header">
        <h1 id="profile-page-title">Profile</h1>
        <p>View your account information, learning preferences and progress.</p>
      </header>

      <section className="profile-summary-card" aria-label="Profile summary">
        <div className="profile-summary-card__identity">
          <div className="profile-summary-card__main">
            <div className="profile-summary-card__title-row">
              <h2>{fullName}</h2>

              <span className="profile-level-badge">
                <LevelIcon />
                {levelLabel}
              </span>
            </div>

            <div className="profile-summary-card__meta">
              <span>
                <MailIcon />
                {email}
              </span>

              <span>
                <CalendarIcon />
                Member since May 2025
              </span>
            </div>
          </div>
        </div>

        <div className="profile-summary-card__stats" aria-label="Learning summary">
          {summaryStats.map((item) => (
            <SummaryStat key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card profile-about-card">
          <div className="profile-card__header">
            <h2>About you</h2>

            <Link to="/profile/edit" className="profile-card__action">
              <EditIcon />
              Edit profile
            </Link>
          </div>

          <dl className="profile-info-list">
            {infoRows.map((item) => (
              <ProfileInfoRow key={item.label} {...item} />
            ))}

            <ProfileInfoRow
              icon={<LevelIcon />}
              label="English level"
              value={<span className="profile-pill profile-pill--blue">{levelLabel}</span>}
            />

            <ProfileInfoRow
              icon={<MicIcon />}
              label="Allow saving audio"
              value={
                <span className={`profile-pill profile-pill--${audioStatus.tone}`}>
                  {audioStatus.label}
                </span>
              }
            />
          </dl>
        </article>

        <article className="profile-card profile-progress-card">
          <div className="profile-card__header">
            <h2>Learning progress</h2>

            <Link to="/progress" className="profile-card__link">
              View all
            </Link>
          </div>

          <div className="profile-progress-card__body">
            <div
              className="profile-progress-ring"
              aria-label={`Overall progress ${stats.overallProgress}%`}
            >
              <svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">
                <circle cx="60" cy="60" r="50" />
                <circle cx="60" cy="60" r="50" style={{ strokeDashoffset: 314 }} />
              </svg>

              <strong>{stats.overallProgress}%</strong>
              <span>Overall progress</span>
            </div>

            <div className="profile-progress-list">
              {progressMetrics.map((item) => (
                <ProgressMetric key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div className="profile-progress-note">
            <InfoIcon />
            Your learning statistics will appear here as you start practicing.
          </div>
        </article>

        <article className="profile-card profile-actions-card">
          <div className="profile-card__header">
            <h2>Quick actions</h2>
          </div>

          <div className="profile-actions-grid">
            {quickActions.map((item) => (
              <QuickAction key={item.title} {...item} />
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

function ProfileState({
  type,
  icon,
  title,
  text,
  ariaLabel,
}: {
  type?: 'error';
  icon: string;
  title: string;
  text: string;
  ariaLabel: string;
}): JSX.Element {
  return (
    <section className="profile-page profile-page--state" aria-label={ariaLabel}>
      <div
        className={`profile-state-card ${
          type === 'error' ? 'profile-state-card--error' : ''
        }`.trim()}
      >
        <span className="profile-state-card__icon" aria-hidden="true">
          {icon}
        </span>

        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

function SummaryStat({ icon, value, label, hint, tone }: SummaryStatProps): JSX.Element {
  return (
    <article className={`profile-summary-stat profile-summary-stat--${tone}`}>
      <span className="profile-summary-stat__icon" aria-hidden="true">
        {icon}
      </span>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{hint}</small>
      </div>
    </article>
  );
}

function ProfileInfoRow({ icon, label, value }: ProfileInfoRowProps): JSX.Element {
  return (
    <div className="profile-info-row">
      <dt>
        <span className="profile-info-row__icon" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>

      <dd>{value}</dd>
    </div>
  );
}

function ProgressMetric({ icon, label, value }: ProgressMetricProps): JSX.Element {
  return (
    <div className="profile-progress-metric">
      <span className="profile-progress-metric__icon" aria-hidden="true">
        {icon}
      </span>

      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickAction({ to, icon, title, description, tone }: QuickActionProps): JSX.Element {
  return (
    <Link to={to} className={`profile-action profile-action--${tone}`}>
      <span className="profile-action__icon" aria-hidden="true">
        {icon}
      </span>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <ChevronIcon />
    </Link>
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

function CalendarIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M7 2h2v3h6V2h2v3h4v17H3V5h4V2Zm12 8H5v10h14V10Z" />
    </svg>
  );
}

function LanguageIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3.2a15.7 15.7 0 0 0-1.1-5A8.04 8.04 0 0 1 18.9 11ZM12 4.1c.7 1 1.4 3.2 1.7 6.9h-3.4c.3-3.7 1-5.9 1.7-6.9ZM4.1 13h3.2c.1 1.8.5 3.5 1.1 5A8.04 8.04 0 0 1 4.1 13Zm3.2-2H4.1A8.04 8.04 0 0 1 8.4 6a15.7 15.7 0 0 0-1.1 5ZM12 19.9c-.7-1-1.4-3.2-1.7-6.9h3.4c-.3 3.7-1 5.9-1.7 6.9ZM15.6 18c.6-1.5 1-3.2 1.1-5h3.2a8.04 8.04 0 0 1-4.3 5Z" />
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

function FireIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M13.5 2s.9 3.7-1.8 6.4C9.8 10.3 8 11.7 8 14.2A4 4 0 0 0 12 18a4 4 0 0 0 4-4c0-1.8-.9-3.2-2.2-4.3.1 1.3-.4 2.2-1.1 2.9-.8-2.8 2.4-5.2.8-10.6ZM12 22a8 8 0 0 1-8-8c0-3.7 2.3-6.1 4.5-8.2C10.7 3.6 10.6 1 10.6 1s7.4 3.2 7.4 10.7c1.2 1.2 2 2.9 2 4.6A8 8 0 0 1 12 22Z" />
    </svg>
  );
}

function BookIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 4a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V4Zm3 2v2h8V6H7Zm0 4v2h8v-2H7Zm0 4v2h5v-2H7Z" />
    </svg>
  );
}

function MicIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 6-6.9h-2Z" />
    </svg>
  );
}

function ChatIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function CardsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M5 4h10a2 2 0 0 1 2 2v2h2v12H9v-2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 6v6h6v-6H9Z" />
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

function BellIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22ZM20 17l-2-2v-5a6 6 0 0 0-5-5.92V2h-2v2.08A6 6 0 0 0 6 10v5l-2 2v1h16v-1Z" />
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

function TelegramIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M21.7 4.3 18.5 20c-.2 1-1 1.2-1.8.7l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1L18 6.4c.4-.4-.1-.6-.6-.3L6 13.2 1.1 11.7c-1-.3-1-1 0-1.4L20.2 3c.9-.3 1.7.2 1.5 1.3Z" />
    </svg>
  );
}

function EditIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 17.25V21h3.75L18.8 9.95l-3.75-3.75L4 17.25ZM20.7 8.05a1 1 0 0 0 0-1.4l-2.35-2.35a1 1 0 0 0-1.4 0l-1.85 1.85 3.75 3.75 1.85-1.85Z" />
    </svg>
  );
}

function ChevronIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="m9 18 6-6-6-6-1.4 1.4 4.6 4.6-4.6 4.6L9 18Z" />
    </svg>
  );
}

function InfoIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M11 17h2v-6h-2v6Zm0-8h2V7h-2v2Zm1 13a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" />
    </svg>
  );
}