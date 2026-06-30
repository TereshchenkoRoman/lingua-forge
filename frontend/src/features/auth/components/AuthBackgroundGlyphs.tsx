import './AuthBackgroundGlyphs.css';

const glyphs = [
  ['ї', 'auth-bg-glyph--1'],
  ['ñ', 'auth-bg-glyph--2'],
  ['語', 'auth-bg-glyph--3'],
  ['і', 'auth-bg-glyph--4'],
  ['中', 'auth-bg-glyph--5'],
  ['a', 'auth-bg-glyph--6'],
  ['h', 'auth-bg-glyph--7'],
  ['文', 'auth-bg-glyph--8'],
  ['R', 'auth-bg-glyph--9'],
  ['あ', 'auth-bg-glyph--10'],
  ['L', 'auth-bg-glyph--11'],
  ['学', 'auth-bg-glyph--12'],
] as const;

export default function AuthBackgroundGlyphs(): JSX.Element {
  return (
    <div className="auth-bg-glyphs" aria-hidden="true">
      {glyphs.map(([char, className]) => (
        <span key={className} className={`auth-bg-glyph ${className}`}>
          {char}
        </span>
      ))}
    </div>
  );
}