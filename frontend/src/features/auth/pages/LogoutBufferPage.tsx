import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../features/auth/AuthProvider';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';

export default function LogoutBufferPage(): JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const redirectHome = () => {
      navigate('/', { replace: true });
    };

    const handleLogout = async () => {
      try {
        await logout();

        if (isMounted) {
          redirectHome();
        }
      } catch (error) {
        console.error('Logout failed', error);

        if (!isMounted) return;

        setError('Не вдалося вийти. Повертаємо на головну.');
        window.setTimeout(redirectHome, 2000);
      }
    };

    handleLogout();

    return () => {
      isMounted = false;
    };
  }, [logout, navigate]);

  return (
    <main style={{ padding: 24, textAlign: 'center' }}>
      <h1>Вихід з облікового запису</h1>
      <p>Зачекайте, будь ласка, виконується вихід…</p>

      <div style={{ marginTop: 16 }}>
        <LoadingSpinner />
      </div>

      {error && (
        <div role="alert" style={{ color: 'red', marginTop: 12 }}>
          {error}
        </div>
      )}
    </main>
  );
}