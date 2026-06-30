type Props = {
  text?: string;
};

export default function AuthFormDivider({ text = 'or' }: Props): JSX.Element {
  return (
    <div className="auth-form__divider" aria-hidden="true">
      <span />
      <small>{text}</small>
      <span />
    </div>
  );
}