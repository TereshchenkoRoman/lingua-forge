import { Link } from 'react-router-dom';

import { useCurrentUser } from '../hooks/useUser';

const publicLinks = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/practice', label: 'Practice' },
  { to: '/demo', label: 'Explore demo' },
  { to: '/blog', label: 'Blog' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
  { to: '/language', label: 'English' },
];

export default function HomePage(): JSX.Element {
  const { data: user, isLoading, isError } = useCurrentUser();
  const isAuthenticated = Boolean(user) && !isError;

  return (
    <main>
      <h1>Homepage</h1>

      <nav aria-label="Homepage links">
        <ul>
          {publicLinks.slice(0, 3).map(({ to, label }) => (
            <li key={to}>
              <Link to={to}>{label}</Link>
            </li>
          ))}

          {isLoading && (
            <li>
              <span>Loading...</span>
            </li>
          )}

          {!isLoading && isAuthenticated && (
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          )}

          {!isLoading && !isAuthenticated && (
            <>
              <li>
                <Link to="/login">Sign in</Link>
              </li>

              <li>
                <Link to="/signup">Get started</Link>
              </li>
            </>
          )}

          {publicLinks.slice(3).map(({ to, label }) => (
            <li key={to}>
              <Link to={to}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}