export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 2c6.627 0 12 5.373 12 12s-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4z"
        className="fill-primary"
      />
      <path
        d="M16 8v8l6.928 4a8 8 0 1 0-13.856 0L16 16V8z"
        className="fill-primary"
        fillOpacity="0.4"
      />
      <path
        d="M16 8v8l-6.928 4a8 8 0 1 1 13.856 0L16 16V8z"
        className="fill-primary"
        fillOpacity="0.8"
      />
    </svg>
  );
}