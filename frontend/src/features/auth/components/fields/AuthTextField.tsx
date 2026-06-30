import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type IconName = 'email' | 'lock' | 'user';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  icon?: IconName;
  rightSlot?: ReactNode;
};

const icons: Record<IconName, JSX.Element> = {
  email: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm8 7 8-5H4l8 5Zm0 2L4 10v6h16v-6l-8 5Z" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M17 9V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1ZM9 9V7a3 3 0 0 1 6 0v2H9Zm4 7.73V18h-2v-1.27a2 2 0 1 1 2 0Z" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  ),
};

const AuthTextField = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      label,
      required = false,
      error,
      icon,
      rightSlot,
      className = '',
      ...inputProps
    },
    ref,
  ) => {
    const errorId = error ? `${id}-error` : undefined;
    const controlClassName = [
      'auth-form__control',
      error && 'auth-form__control--invalid',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="auth-form__field">
        <label className="auth-form__label" htmlFor={id}>
          {label}
          {required && (
            <span className="auth-form__label-required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>

        <div className={controlClassName}>
          {icon && (
            <span className="auth-form__icon" aria-hidden="true">
              {icons[icon]}
            </span>
          )}

          <input
            id={id}
            ref={ref}
            className={`auth-form__input ${className}`.trim()}
            aria-invalid={!!error}
            aria-describedby={errorId}
            aria-required={required}
            {...inputProps}
          />

          {rightSlot}
        </div>

        {error && (
          <p id={errorId} className="auth-form__error">
            {error}
          </p>
        )}
      </div>
    );
  },
);

AuthTextField.displayName = 'AuthTextField';

export default AuthTextField;