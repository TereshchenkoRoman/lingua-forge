import type { ReactNode } from 'react';

type Props = {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string | null;
};

export default function FormField({
  id,
  label,
  children,
  hint,
  error,
}: Props): JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id}>{label}</label>

      <div
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </div>

      {hint && <div id={hintId}>{hint}</div>}

      {error && (
        <div id={errorId} role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </div>
  );
}