export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className ?? "h-7 w-7"}
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="8" fill="#7C6CF6" />
      <path
        d="M6 19.5L11.5 9L15 15.5L17.5 11L22 19.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
