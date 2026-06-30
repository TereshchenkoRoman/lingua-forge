import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { SITE_NAME } from '../../../config/site';
import { useCurrentUser } from '../../../hooks/useUser';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ProfileForm from '../components/ProfileForm';

import './ProfileEditPage.css';

export default function ProfileEditPage(): JSX.Element {
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    document.title = `Edit profile — ${SITE_NAME}`;
  }, []);

  if (isLoading) {
    return (
      <section
        className="profile-edit-page profile-edit-page--state"
        aria-label="Loading profile editor"
      >
        <div className="profile-edit-state-card">
          <LoadingSpinner />
          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        className="profile-edit-page profile-edit-page--state"
        aria-label="Profile loading error"
      >
        <div className="profile-edit-state-card profile-edit-state-card--error">
          <span className="profile-edit-state-card__icon" aria-hidden="true">
            !
          </span>

          <h1>Could not load profile</h1>

          <p>
            We could not load your profile data. Please refresh the page and try again.
          </p>

          <Link to="/profile" className="profile-edit-state-card__link">
            Back to profile
          </Link>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section
        className="profile-edit-page profile-edit-page--state"
        aria-label="Profile not found"
      >
        <div className="profile-edit-state-card">
          <span className="profile-edit-state-card__icon" aria-hidden="true">
            ?
          </span>

          <h1>Profile not found</h1>
          <p>Your profile data is not available yet.</p>

          <Link to="/profile" className="profile-edit-state-card__link">
            Back to profile
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-edit-page" aria-labelledby="profile-edit-title">
      <header className="profile-edit-page__header">
        <Link to="/profile" className="profile-edit-page__back-link">
          <ArrowLeftIcon />
          Back to profile
        </Link>

        <h1 id="profile-edit-title">Edit profile</h1>

        <p>Update your personal information and learning preferences.</p>
      </header>

      <ProfileForm initial={user} />
    </section>
  );
}

function ArrowLeftIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}