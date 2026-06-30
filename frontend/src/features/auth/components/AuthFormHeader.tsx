type Props = {
  title: string;
  subtitle: string;
  titleId?: string;
};

export default function AuthFormHeader({
  title,
  subtitle,
  titleId,
}: Props): JSX.Element {
  return (
    <header className="auth-form__header">
      <h1 id={titleId}>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}