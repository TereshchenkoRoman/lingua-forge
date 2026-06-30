import { SITE_NAME } from '../../../config/site';
import ChatPreview from '../../../shared/components/ChatPreview/ChatPreview';

import './AuthPromoPanel.css';

const featureCards = [
  {
    type: 'pronunciation',
    title: 'Pronunciation',
  },
  {
    type: 'word',
    title: "Today's Word",
  },
] as const;

const proofCards = [
  {
    icon: '★',
    title: '4.9/5',
    text: 'Learner rating',
  },
  {
    icon: '2K+',
    title: '2,000+',
    text: 'Practice sessions',
  },
  {
    icon: 'AI',
    title: 'Personalized',
    text: 'English feedback',
    isAccent: true,
  },
] as const;

function LogoIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 3C6.48 3 2 6.94 2 11.8c0 2.43 1.12 4.63 2.93 6.22L4.2 21.2a.7.7 0 0 0 .94.79l3.73-1.54c.98.28 2.03.43 3.13.43 5.52 0 10-3.94 10-8.8S17.52 3 12 3Zm-4 9.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z" />
    </svg>
  );
}

function WaveIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 10.5a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm4-4a1 1 0 0 1 1 1v9a1 1 0 1 1-2 0v-9a1 1 0 0 1 1-1Zm4 2a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1Zm4-5a1 1 0 0 1 1 1v13a1 1 0 1 1-2 0v-13a1 1 0 0 1 1-1Zm4 7a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function BookIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M5 4h5a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm14 0h-5a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h5a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
    </svg>
  );
}

function SpeakerIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2-3.74v7.48a4.5 4.5 0 0 0 2-3.74Zm-2-8.5v2.12a7 7 0 0 1 0 12.76v2.12a9 9 0 0 0 0-17Z" />
    </svg>
  );
}

function FeatureTitle({
  type,
  title,
}: {
  type: 'pronunciation' | 'word';
  title: string;
}): JSX.Element {
  return (
    <div className="auth-promo__feature-title">
      <span
        className={`auth-promo__feature-icon auth-promo__feature-icon--${
          type === 'pronunciation' ? 'wave' : 'book'
        }`}
        aria-hidden="true"
      >
        {type === 'pronunciation' ? <WaveIcon /> : <BookIcon />}
      </span>
      {title}
    </div>
  );
}

function PronunciationCard(): JSX.Element {
  return (
    <div className="auth-promo__pronunciation-card">
      <FeatureTitle {...featureCards[0]} />

      <div className="auth-promo__pronunciation-body">
        <div
          className="auth-promo__score-ring"
          aria-label="Pronunciation score 86 out of 100"
        >
          <div className="auth-promo__score-inner">
            <span className="auth-promo__score-number">86</span>
            <span className="auth-promo__score-total">/100</span>
          </div>
        </div>

        <div className="auth-promo__pronunciation-info">
          <strong>Great job!</strong>
          <p>You sounded clear and natural.</p>

          <div className="auth-promo__preview-button" aria-hidden="true">
            <span>▶</span>
            <span>Play my recording</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WordCard(): JSX.Element {
  return (
    <div className="auth-promo__word-card">
      <FeatureTitle {...featureCards[1]} />

      <div className="auth-promo__word-main">
        <div>
          <h3>improve</h3>
          <small>verb</small>
        </div>

        <span className="auth-promo__speaker" aria-hidden="true">
          <SpeakerIcon />
        </span>
      </div>

      <p>to get better or make something better</p>

      <div
        className="auth-promo__preview-button auth-promo__preview-button--word"
        aria-hidden="true"
      >
        <span>⊞</span>
        <span>Add to flashcards</span>
      </div>
    </div>
  );
}

export default function AuthPromoPanel(): JSX.Element {
  return (
    <aside className="auth-promo" aria-label={`${SITE_NAME} product preview`}>
      <div className="auth-promo__brand">
        <div className="auth-promo__logo" aria-hidden="true">
          <LogoIcon />
        </div>

        <span>{SITE_NAME}</span>
      </div>

      <div className="auth-promo__content">
        <div className="auth-promo__badge">
          <span aria-hidden="true">✦</span>
          Your personal AI English tutor
        </div>

        <h1>
          Start your English <br />
          journey <span>today</span>
        </h1>

        <p>
          Practice with your AI tutor, get grammar corrections, pronunciation feedback,
          and build your vocabulary with smart flashcards.
        </p>

        <ChatPreview framed />

        <div className="auth-promo__feature-cards">
          <PronunciationCard />
          <WordCard />
        </div>

        <div className="auth-promo__social-proof" aria-label="Product highlights">
          {proofCards.map(({ icon, title, text, isAccent }) => (
            <div
              key={title}
              className={`auth-promo__proof-card ${
                isAccent ? 'auth-promo__proof-card--accent' : ''
              }`.trim()}
            >
              <span className="auth-promo__proof-icon" aria-hidden="true">
                {icon}
              </span>

              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}