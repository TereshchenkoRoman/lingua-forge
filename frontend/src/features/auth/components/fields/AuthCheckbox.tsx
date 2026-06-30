import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const AuthCheckbox = forwardRef<HTMLInputElement, Props>(({ label, id, ...props }, ref) => (
  <label className="auth-form__checkbox" htmlFor={id}>
    <input id={id} ref={ref} type="checkbox" {...props} />
    <span className="auth-form__checkbox-box" aria-hidden="true" />
    {label}
  </label>
));

AuthCheckbox.displayName = 'AuthCheckbox';

export default AuthCheckbox;