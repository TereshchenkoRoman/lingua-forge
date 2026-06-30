import { Link } from 'react-router-dom';

type Props = {
  text: string;
  linkText: string;
  to: string;
};

export default function AuthFormPrompt({
  text,
  linkText,
  to,
}: Props): JSX.Element {
  return (
    <p className="auth-form__prompt">
      {text} <Link to={to}>{linkText}</Link>
    </p>
  );
}