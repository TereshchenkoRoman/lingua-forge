type Props = {
  isVisible: boolean;
  onClick: () => void;
  labelVisible?: string;
  labelHidden?: string;
};

export default function PasswordToggleButton({
  isVisible,
  onClick,
  labelVisible = 'Hide password',
  labelHidden = 'Show password',
}: Props): JSX.Element {
  const ariaLabel = isVisible ? labelVisible : labelHidden;

  return (
    <button
      type="button"
      className="auth-form__password-toggle"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isVisible}
    >
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 5c5 0 9 5 10 7-1 2-5 7-10 7s-9-5-10-7c1-2 5-7 10-7Zm0 2c-3.5 0-6.4 3-7.7 5 1.3 2 4.2 5 7.7 5s6.4-3 7.7-5C18.4 10 15.5 7 12 7Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
      </svg>
    </button>
  );
}