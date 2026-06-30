export default function LoadingSpinner(): JSX.Element {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span>Loading…</span>
    </div>
  );
}