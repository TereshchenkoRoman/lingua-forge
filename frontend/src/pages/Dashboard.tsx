import { useEffect, type ReactNode } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { SITE_NAME } from '../config/site';
import ChatPreview from '../shared/components/ChatPreview/ChatPreview';

import './Dashboard.css';

type UserProfile = {
  level?: string | null;
  level_english?: string | null;
};

type CurrentUser = {
  id?: number | string;
  email?: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile?: UserProfile | null;
};

type AppLayoutContext = {
  user: CurrentUser | null;
};

type Scenario = {
  id: 'airport' | 'hotel' | 'standard';
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
};

type StatCardProps = {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone: 'orange' | 'blue' | 'green' | 'purple';
};

type ProgressMetricProps = {
  label: string;
  value: ReactNode;
};

const dashboardStats = {
  dayStreak: 0,
  wordsLearned: 0,
  conversations: 0,
  pronunciationScore: 0,
  overallProgress: 0,
  flashcardsDue: 0,
};

const scenarios: Scenario[] = [
  {
    id: 'airport',
    title: 'Airport',
    description: 'Check-in, security, boarding and more.',
    to: '/chat?scenario=airport',
    icon: <PlaneIcon />,
  },
  {
    id: 'hotel',
    title: 'Hotel',
    description: 'Check-in, amenities, requests and more.',
    to: '/chat?scenario=hotel',
    icon: <HotelIcon />,
  },
  {
    id: 'standard',
    title: 'Standard',
    description: 'Everyday topics and free conversation.',
    to: '/chat?scenario=standard',
    icon: <ChatIcon />,
  },
];

function getDisplayName(user: CurrentUser | null): string {
  if (!user) return 'Student';

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();

  return user.name || fullName || user.email?.split('@')[0] || 'Student';
}

function getUserLevel(user: CurrentUser | null): string {
  return user?.profile?.level_english || user?.profile?.level || '—';
}

export default function Dashboard(): JSX.Element {
  const { user } = useOutletContext<AppLayoutContext>();

  const displayName = getDisplayName(user);
  const userLevel = getUserLevel(user);

  const statCards: StatCardProps[] = [
    {
      icon: <FireIcon />,
      value: dashboardStats.dayStreak,
      label: 'Day streak',
      tone: 'orange',
    },
    {
      icon: <LevelIcon />,
      value: userLevel,
      label: 'Your level',
      tone: 'blue',
    },
    {
      icon: <BookIcon />,
      value: dashboardStats.wordsLearned,
      label: 'Words learned',
      tone: 'green',
    },
    {
      icon: <MicIcon />,
      value: `${dashboardStats.pronunciationScore}%`,
      label: 'Pronunciation',
      tone: 'purple',
    },
  ];

  const progressMetrics: ProgressMetricProps[] = [
    {
      label: 'Words learned',
      value: dashboardStats.wordsLearned,
    },
    {
      label: 'Conversations',
      value: dashboardStats.conversations,
    },
    {
      label: 'Pronunciation score',
      value: `${dashboardStats.pronunciationScore}%`,
    },
  ];

  useEffect(() => {
    document.title = `Dashboard — ${SITE_NAME}`;
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>
          Welcome back, <span>{displayName}</span>! <span aria-hidden="true">👋</span>
        </h1>

        <p>Let&apos;s continue your English learning journey.</p>
      </header>

      <section className="dashboard-stats" aria-label="Learning summary">
        {statCards.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--hero">
          <div className="dashboard-card__content">
            <p className="dashboard-card__kicker">Continue learning</p>

            <h2>Start a conversation</h2>

            <p>Choose a scenario and start practicing with your AI tutor right now.</p>

            <Link to="/chat" className="dashboard-primary-action">
              <ChatIcon />
              Open chat
            </Link>
          </div>

          <div className="dashboard-chat-preview" aria-hidden="true">
            <ChatPreview />
          </div>
        </article>

        <article className="dashboard-card dashboard-progress-card">
          <div className="dashboard-section-header">
            <h2>Your progress</h2>

            <Link to="/progress" className="dashboard-section-link">
              View all
            </Link>
          </div>

          <div className="dashboard-progress-card__body">
            <div
              className="dashboard-progress-ring"
              aria-label={`Overall progress ${dashboardStats.overallProgress}%`}
            >
              <svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">
                <circle cx="60" cy="60" r="50" />
                <circle cx="60" cy="60" r="50" style={{ strokeDashoffset: 314 }} />
              </svg>

              <strong>{dashboardStats.overallProgress}%</strong>
              <span>Overall progress</span>
            </div>

            <div className="dashboard-progress-list">
              {progressMetrics.map((item) => (
                <ProgressMetric key={item.label} {...item} />
              ))}
            </div>
          </div>
        </article>

        <article className="dashboard-card dashboard-scenarios-card">
          <div className="dashboard-section-header">
            <h2>Practice by scenario</h2>
          </div>

          <div className="dashboard-scenarios">
            {scenarios.map((scenario) => (
              <article
                key={scenario.id}
                className={`dashboard-scenario dashboard-scenario--${scenario.id}`}
              >
                <span className="dashboard-scenario__icon" aria-hidden="true">
                  {scenario.icon}
                </span>

                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>

                <Link to={scenario.to}>
                  Start practice
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </article>

        <article className="dashboard-card dashboard-review-card">
          <div className="dashboard-section-header">
            <div>
              <h2>Next review</h2>
              <p>You have {dashboardStats.flashcardsDue} flashcards due for review.</p>
            </div>

            <Link to="/cards" className="dashboard-section-link">
              View all
            </Link>
          </div>

          <EmptyState
            icon={<CardsIcon />}
            title="No flashcards yet"
            text="Flashcards will appear here after vocabulary and card generation are implemented."
            className="dashboard-empty--cards"
          />

          <Link to="/cards" className="dashboard-review-card__button">
            <CardsIcon />
            Review flashcards
          </Link>
        </article>

        <article className="dashboard-card dashboard-activity-card">
          <div className="dashboard-section-header">
            <h2>Recent activity</h2>

            <Link to="/statistics" className="dashboard-section-link">
              View all
            </Link>
          </div>

          <EmptyState
            icon={<ProgressIcon />}
            title="No activity yet"
            text="Recent conversations, vocabulary updates and card reviews will appear here after the learning modules are implemented."
            className="dashboard-empty--activity"
          />
        </article>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, tone }: StatCardProps): JSX.Element {
  return (
    <article className={`dashboard-stat dashboard-stat--${tone}`}>
      <span className="dashboard-stat__icon" aria-hidden="true">
        {icon}
      </span>

      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function ProgressMetric({ label, value }: ProgressMetricProps): JSX.Element {
  return (
    <div className="dashboard-progress-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  className,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  className: string;
}): JSX.Element {
  return (
    <div className={`dashboard-empty ${className}`}>
      <span className="dashboard-empty__icon" aria-hidden="true">
        {icon}
      </span>

      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function ChatIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function PlaneIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M21 16v-2L13 9V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </svg>
  );
}

function HotelIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 21V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5h2a2 2 0 0 1 2 2v10h-2v-3H6v3H4Zm2-5h5v-4H6v4Zm7 0h5v-4h-5v4ZM7 6v2h2V6H7Zm4 0v2h2V6h-2Z" />
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

function LevelIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 17h3V7H4v10Zm5 0h3V4H9v13Zm5 0h3v-7h-3v7Zm5 0h1V2h-1a2 2 0 0 0-2 2v13h2Z" />
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

function CardsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M5 4h10a2 2 0 0 1 2 2v2h2v12H9v-2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 6v6h6v-6H9Z" />
    </svg>
  );
}

function ProgressIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 19h16v2H4v-2Zm2-2V9h3v8H6Zm5 0V3h3v14h-3Zm5 0v-6h3v6h-3Z" />
    </svg>
  );
}