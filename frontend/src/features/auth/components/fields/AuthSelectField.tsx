import { forwardRef, type SelectHTMLAttributes } from 'react';

type IconName = 'level';

type Option = {
  value: string;
  label: string;
};

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  icon?: IconName;
  options: Option[];
};

const icons: Record<IconName, JSX.Element> = {
  level: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 17h3V7H4v10Zm5 0h3V4H9v13Zm5 0h3v-7h-3v7Zm5 0h1V2h-1a2 2 0 0 0-2 2v13h2Z" />
    </svg>
  ),
};

const SelectArrow = () => (
  <span className="auth-form__select-arrow" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6 1.4-1.4Z" />
    </svg>
  </span>
);

const AuthSelectField = forwardRef<HTMLSelectElement, Props>(
  (
    {
      id,
      label,
      required = false,
      error,
      icon,
      options,
      className = '',
      ...selectProps
    },
    ref,
  ) => {
    const errorId = error ? `${id}-error` : undefined;
    const controlClassName = [
      'auth-form__control',
      'auth-form__control--select',
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

          <select
            id={id}
            ref={ref}
            className={`auth-form__input auth-form__select ${className}`.trim()}
            aria-invalid={!!error}
            aria-describedby={errorId}
            aria-required={required}
            {...selectProps}
          >
            {options.map(({ value, label }) => (
              <option key={value || 'empty-option'} value={value} disabled={!value}>
                {label}
              </option>
            ))}
          </select>

          <SelectArrow />
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

AuthSelectField.displayName = 'AuthSelectField';

export default AuthSelectField;