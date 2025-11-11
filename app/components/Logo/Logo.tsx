'use client';

export default function Logo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#0f172a" />
      <g transform="translate(8,8)">
        <circle cx="24" cy="24" r="24" fill="url(#g1)" opacity="0.18" />
        <ellipse cx="24" cy="14" rx="12" ry="7" fill="#38bdf8" opacity="0.76" />
        <ellipse cx="24" cy="28" rx="15" ry="8" fill="#818cf8" opacity="0.33" />
      </g>
    </svg>
  );
}
