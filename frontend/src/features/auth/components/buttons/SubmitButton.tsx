import type { ReactNode } from 'react';

type ButtonType = 'button' | 'submit' | 'reset';

type Props = {
  children: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: ButtonType;
  ariaLabel?: string;
  loadingText?: string;
};

export default function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'submit',
  ariaLabel,
  loadingText,
}: Props): JSX.Element {
  const isDisabled = disabled || isLoading;
  const content = isLoading && loadingText ? loadingText : children;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`auth-form__submit ${className}`.trim()}
    >
      <span className="auth-form__submit-text">{content}</span>
    </button>
  );
}