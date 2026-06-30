import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { SITE_NAME } from '../config/site';

import './NotFoundPage.css';

export default function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Page not found — ${SITE_NAME}`;
  }, []);

  return (
    <main className="not-found-page" aria-labelledby="not-found-title">
      <section className="not-found-card">
        <div className="not-found-card__content">
          <div className="not-found-card__badge">
            <span aria-hidden="true">!</span>
            404 Error
          </div>

          <h1 id="not-found-title">Page not found</h1>

          <p>
            The page you are looking for does not exist, was moved, or is not
            available yet.
          </p>

          <div className="not-found-card__actions">
            <Link
              to="/"
              className="not-found-card__button not-found-card__button--primary"
            >
              Go home
            </Link>

            <button
              type="button"
              className="not-found-card__button not-found-card__button--secondary"
              onClick={() => navigate(-1)}
            >
              Go back
            </button>

            <Link
              to="/dashboard"
              className="not-found-card__button not-found-card__button--ghost"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="not-found-visual" aria-hidden="true">
          <div className="not-found-visual__code">404</div>

          <div className="not-found-visual__card not-found-visual__card--one">
            <span />
            <span />
            <span />
          </div>

          <div className="not-found-visual__card not-found-visual__card--two">
            <span />
            <span />
          </div>

          <div className="not-found-visual__path">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}