const DROP_PATH =
  'M200 52 C200 52 104 168 104 258 C104 318 146 352 200 352 C254 352 296 318 296 258 C296 168 200 52 200 52 Z';

export function BloodDropIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`} aria-hidden="true">
      <div className="absolute inset-[18%] rounded-full bg-ruby-500/30 blur-3xl animate-pulse-glow" />

      <svg viewBox="0 0 400 400" className="relative h-full w-full overflow-visible">
        <defs>
          <radialGradient id="drop-body" cx="42%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#FF9AA1" stopOpacity="0.95" />
            <stop offset="32%" stopColor="#E0313F" />
            <stop offset="72%" stopColor="#7A0D16" />
            <stop offset="100%" stopColor="#3D0709" />
          </radialGradient>
          <radialGradient id="drop-core" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#FF4D5A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF4D5A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ring-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5D68" stopOpacity="0" />
            <stop offset="45%" stopColor="#FF5D68" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C5CBD3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ring-stroke-alt" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C5CBD3" stopOpacity="0" />
            <stop offset="55%" stopColor="#9AA3AE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9AA3AE" stopOpacity="0" />
          </linearGradient>
          <clipPath id="drop-clip">
            <path d={DROP_PATH} />
          </clipPath>
        </defs>

        <g style={{ transformOrigin: '200px 200px' }} className="animate-orbit">
          <ellipse
            cx="200"
            cy="200"
            rx="190"
            ry="62"
            fill="none"
            stroke="url(#ring-stroke)"
            strokeWidth="2"
            transform="rotate(-18 200 200)"
          />
        </g>

        <g style={{ transformOrigin: '200px 200px' }} className="animate-orbit-reverse">
          <ellipse
            cx="200"
            cy="200"
            rx="168"
            ry="48"
            fill="none"
            stroke="url(#ring-stroke-alt)"
            strokeWidth="1.5"
            transform="rotate(24 200 200)"
          />
        </g>

        <g className="animate-float">
          <path d={DROP_PATH} fill="url(#drop-body)" />
          <g clipPath="url(#drop-clip)">
            <ellipse cx="200" cy="290" rx="120" ry="80" fill="url(#drop-core)" />
          </g>
          <path d={DROP_PATH} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
          <ellipse cx="158" cy="236" rx="16" ry="38" fill="white" opacity="0.4" transform="rotate(18 158 236)" />
          <ellipse cx="172" cy="290" rx="6" ry="14" fill="white" opacity="0.25" transform="rotate(18 172 290)" />
        </g>

        <circle cx="72" cy="128" r="3" fill="#FF8A92" className="animate-twinkle" />
        <circle cx="336" cy="92" r="2.5" fill="#FF8A92" className="animate-twinkle" style={{ animationDelay: '1s' }} />
        <circle cx="318" cy="318" r="2" fill="#C5CBD3" className="animate-twinkle" style={{ animationDelay: '2s' }} />
        <circle cx="96" cy="312" r="2" fill="#C5CBD3" className="animate-twinkle" style={{ animationDelay: '0.5s' }} />
      </svg>
    </div>
  );
}
