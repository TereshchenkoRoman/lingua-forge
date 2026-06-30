import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout(): JSX.Element {
  useEffect(() => {
    document.body.classList.add('layout-main');
    document.body.classList.remove('layout-auth', 'layout-app');

    return () => {
      document.body.classList.remove('layout-main');
    };
  }, []);

  return <Outlet />;
}