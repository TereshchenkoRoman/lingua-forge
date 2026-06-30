import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';

import './AuthCard.css';

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  className?: string;
};

export default function AuthCard({
  children,
  className,
  ...props
}: Props): JSX.Element {
  return (
    <section className={classNames('auth-card', className)} {...props}>
      <div className="auth-card-body">{children}</div>
    </section>
  );
}