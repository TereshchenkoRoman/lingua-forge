import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { SITE_NAME } from '../config/site';
import AuthBackgroundGlyphs from '../features/auth/components/AuthBackgroundGlyphs';
import AuthPromoPanel from '../features/auth/components/AuthPromoPanel';

import './AuthLayout.css';

export default function AuthLayout(): JSX.Element {
  useEffect(() => {
    document.body.classList.add('layout-auth');
    document.body.classList.remove('layout-main');

    return () => {
      document.body.classList.remove('layout-auth');
    };
  }, []);

  return (
    <main className="auth-layout">
      <AuthBackgroundGlyphs />

      <div className="auth-layout__inner">
        <AuthPromoPanel />

        <section className="auth-layout__content" aria-label="Authentication content">
          <div className="auth-layout__auth-stack">
            <Outlet />

            <footer className="auth-layout__footer">
              <a href="/terms">Terms of Service</a>
              <span>•</span>
              <a href="/privacy">Privacy Policy</a>
              <span>•</span>
              <a href="/contact">Contact Us</a>
              <span className="auth-layout__copyright">
                © 2026 {SITE_NAME}. All rights reserved.
              </span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}