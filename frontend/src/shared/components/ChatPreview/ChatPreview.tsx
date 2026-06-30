import './ChatPreview.css';

type Props = {
  className?: string;
  framed?: boolean;
};

function BotIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M11 2h2v3h3a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h3V2Zm-3 8.25a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Zm5.5 0a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0ZM8.5 14a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM2 10h1v4H2v-4Zm19 0h1v4h-1v-4Z" />
    </svg>
  );
}

export default function ChatPreview({
  className = '',
  framed = false,
}: Props): JSX.Element {
  const rootClassName = [
    'chat-preview',
    framed && 'chat-preview--framed',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} aria-label="Chat preview">
      <div className="chat-preview__bot-row">
        <div className="chat-preview__bot-icon" aria-hidden="true">
          <BotIcon />
        </div>

        <div className="chat-preview__message chat-preview__message--bot">
          <div>
            <strong>Let&apos;s practice!</strong> Try using this sentence
            <br />
            in your own words.
          </div>

          <span>10:32 AM</span>
        </div>
      </div>

      <div className="chat-preview__user-row">
        <div className="chat-preview__message chat-preview__message--user">
          <div>
            I went to the supermarket
            <br />
            yesterday and <strong>bought</strong> some milk.
          </div>

          <span>10:34 AM</span>
        </div>
      </div>
    </div>
  );
}