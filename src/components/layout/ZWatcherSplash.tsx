import { useEffect, useState } from 'react';
import './ZWatcherSplash.css';

export function ZWatcherSplash({ onFinish }: { onFinish?: () => void }) {
  // Animation states: 0 = show Z-WATCHER, 1 = explode Z, 2 = full beams, 3 = hide
  const [phase, setPhase] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Netflix-style timing:
    // 1. Show Z-WATCHER for 1.2s
    // 2. Explode Z into light beams (0.8s)
    // 3. Light beam spectacular (0.6s)
    // 4. Hide splash
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setPhase(1), 1200)); // start explosion
    timers.push(setTimeout(() => setPhase(2), 1600)); // full beams
    timers.push(
      setTimeout(() => {
        setHide(true);
        setPhase(3);
        if (onFinish) setTimeout(onFinish, 600);
      }, 2600),
    );
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div className={`zwsplash-root${hide ? ' zwsplash-hide' : ''}`}>
      <svg
        className={`zwsplash-logo${phase >= 1 ? ' explode-beams' : ''}`}
        viewBox="0 0 600 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="text-gradient"
            x1="0"
            y1="0"
            x2="600"
            y2="180"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e50914" />
            <stop offset="0.3" stopColor="#f40612" />
            <stop offset="0.7" stopColor="#ff6b35" />
            <stop offset="1" stopColor="#ffd700" />
          </linearGradient>
          <linearGradient
            id="beam-gradient-1"
            x1="0"
            y1="100%"
            x2="0"
            y2="0%"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e50914" />
            <stop offset="0.5" stopColor="#ff6b35" />
            <stop offset="1" stopColor="#ffd700" />
          </linearGradient>
          <linearGradient
            id="beam-gradient-2"
            x1="0"
            y1="100%"
            x2="0"
            y2="0%"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f40612" />
            <stop offset="0.5" stopColor="#ff8c42" />
            <stop offset="1" stopColor="#ffeb3b" />
          </linearGradient>
          <linearGradient
            id="beam-gradient-3"
            x1="0"
            y1="100%"
            x2="0"
            y2="0%"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ff1744" />
            <stop offset="0.5" stopColor="#ff9800" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="beam-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Z-WATCHER text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Montserrat Black', 'Arial Black', Arial, sans-serif"
          fontWeight="900"
          fontSize="84"
          fill="url(#text-gradient)"
          filter="url(#glow)"
          className={`zwsplash-text${phase >= 1 ? ' exploding' : ''}`}
        >
          Z-WATCHER
        </text>

        {/* Light beams explosion - Z-shaped expanding toward viewer */}
        {phase >= 1 && (
          <g className={`zwsplash-beams${phase === 2 ? ' beams-full' : ''}`}>
            {/* Top horizontal line of Z */}
            {Array.from({ length: 5 }, (_, i) => {
              const gradientId = `beam-gradient-${(i % 3) + 1}`;
              return (
                <rect
                  key={`top-${i}`}
                  x="240"
                  y="50"
                  width="80"
                  height="6"
                  fill={`url(#${gradientId})`}
                  filter="url(#beam-glow)"
                  className={`z-top-line z-top-line-${i} z-top-line-pos-${i}`}
                />
              );
            })}

            {/* Diagonal line of Z */}
            {Array.from({ length: 6 }, (_, i) => {
              const gradientId = `beam-gradient-${(i % 3) + 1}`;
              return (
                <rect
                  key={`diagonal-${i}`}
                  x="290"
                  y="85"
                  width="60"
                  height="4"
                  fill={`url(#${gradientId})`}
                  filter="url(#beam-glow)"
                  className={`z-diagonal z-diagonal-${i} z-diagonal-pos-${i}`}
                />
              );
            })}

            {/* Bottom horizontal line of Z */}
            {Array.from({ length: 5 }, (_, i) => {
              const gradientId = `beam-gradient-${(i % 3) + 1}`;
              return (
                <rect
                  key={`bottom-${i}`}
                  x="240"
                  y="120"
                  width="80"
                  height="6"
                  fill={`url(#${gradientId})`}
                  filter="url(#beam-glow)"
                  className={`z-bottom-line z-bottom-line-${i} z-bottom-line-pos-${i}`}
                />
              );
            })}
          </g>
        )}
      </svg>
      <div className="zwsplash-glow" />
    </div>
  );
}
