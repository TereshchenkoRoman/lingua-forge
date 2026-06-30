import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link, NavLink, Outlet, type NavLinkRenderProps } from 'react-router-dom';

import { SITE_NAME } from '../config/site';
import AuthService from '../lib/auth/auth.service';

import './AppLayout.css';

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

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType;
  end?: boolean;
};

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/chat', label: 'Chat', icon: ChatIcon },
  { to: '/vocabulary', label: 'Vocabulary', icon: BookIcon },
  { to: '/cards', label: 'Flashcards', icon: CardsIcon },
  { to: '/progress', label: 'Progress', icon: ProgressIcon },
  { to: '/statistics', label: 'Statistics', icon: StatisticsIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon, end: true },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function getDisplayName(user: CurrentUser | null): string {
  if (!user) return 'Student';

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();

  return user.name || fullName || user.email?.split('@')[0] || 'Student';
}

function getUserLevel(user: CurrentUser | null): string {
  return user?.profile?.level_english || user?.profile?.level || '—';
}

function getUserInitial(displayName: string): string {
  return displayName.trim().slice(0, 1).toUpperCase() || 'S';
}

function getNavClassName({ isActive }: NavLinkRenderProps): string {
  return isActive ? 'app-layout__link app-layout__link--active' : 'app-layout__link';
}

export default function AppLayout(): JSX.Element {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    document.body.classList.remove('layout-auth', 'layout-main');
    document.body.classList.add('layout-app');

    return () => {
      document.body.classList.remove('layout-app');
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();

        if (isMounted) {
          setUser(currentUser as CurrentUser);
        }
      } catch (error) {
        console.error('Failed to load current user for app layout', error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const userLevel = useMemo(() => getUserLevel(user), [user]);
  const userSubtitle = userLevel !== '—' ? `${userLevel} · English learner` : 'English learner';

  return (
    <main className="app-layout">
      <aside className="app-layout__sidebar" aria-label="Application navigation">
        <div className="app-layout__sidebar-inner">
          <Link
            to="/dashboard"
            className="app-layout__brand"
            aria-label={`${SITE_NAME} dashboard`}
          >
            <span className="app-layout__brand-icon" aria-hidden="true">
              <LogoIcon />
            </span>
            <span>{SITE_NAME}</span>
          </Link>

          <nav className="app-layout__nav" aria-label="Main navigation">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={getNavClassName}>
                <Icon />
                <span>{label}</span>
              </NavLink>
            ))}

            <NavLink to="/profile#telegram" className="app-layout__link">
              <TelegramIcon />
              <span>Link Telegram</span>
            </NavLink>
          </nav>

          <div className="app-layout__sidebar-bottom">
            <section className="app-layout__telegram" aria-label="Telegram integration">
              <strong>Practice on the go</strong>

              <p>Chat with your AI tutor in Telegram anytime, anywhere.</p>

              <Link to="/profile#telegram" className="app-layout__telegram-button">
                <TelegramIcon />
                Link Telegram
              </Link>
            </section>

            <Link to="/logout" className="app-layout__logout">
              <LogoutIcon />
              <span>Logout</span>
            </Link>

            <footer className="app-layout__footer">
              © 2026 {SITE_NAME}.<br />
              All rights reserved.
            </footer>
          </div>
        </div>
      </aside>

      <section className="app-layout__main">
        <header className="app-layout__topbar">
          <div />

          <Link to="/profile" className="app-layout__profile" aria-label="Open profile">
            <span className="app-layout__avatar" aria-hidden="true">
              {getUserInitial(displayName)}
            </span>

            <span>
              <strong>{displayName}</strong>
              <small>{userSubtitle}</small>
            </span>
          </Link>
        </header>

        <div className="app-layout__content">
          <Outlet context={{ user }} />
        </div>
      </section>
    </main>
  );
}

function LogoIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 3C6.48 3 2 6.94 2 11.8c0 2.43 1.12 4.63 2.93 6.22L4.2 21.2a.7.7 0 0 0 .94.79l3.73-1.54c.98.28 2.03.43 3.13.43 5.52 0 10-3.94 10-8.8S17.52 3 12 3Zm-4 9.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z" />
    </svg>
  );
}

function DashboardIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M3 11 12 3l9 8v10h-6v-6H9v6H3V11Z" />
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

function BookIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 4a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V4Zm3 2v2h8V6H7Zm0 4v2h8v-2H7Zm0 4v2h5v-2H7Z" />
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

function StatisticsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 2a10 10 0 1 0 10 10h-8V4a10.1 10.1 0 0 0-2-.2V2Zm4 2.8V10h5.2A8 8 0 0 0 16 4.8ZM7 13h2v5H7v-5Zm4-4h2v9h-2V9Zm4 6h2v3h-2v-3Z" />
    </svg>
  );
}

function UserIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

function SettingsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2.1-1.6-2-3.5-2.5 1a7.7 7.7 0 0 0-2.6-1.5L14 2h-4l-.4 2.9A7.7 7.7 0 0 0 7 6.4l-2.5-1-2 3.5 2.1 1.6c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2.1 1.6 2 3.5 2.5-1a7.7 7.7 0 0 0 2.6 1.5L10 22h4l.4-2.9a7.7 7.7 0 0 0 2.6-1.5l2.5 1 2-3.5-2.1-1.6ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
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

function LogoutIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M10 17v-2h4v-2h-4v-2l-4 3 4 3Zm-6 4h8a2 2 0 0 0 2-2v-3h-2v3H4V5h8v3h2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Zm12-5 5-4-5-4v3H9v2h7v3Z" />
    </svg>
  );
}