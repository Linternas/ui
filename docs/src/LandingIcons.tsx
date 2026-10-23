export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <path d={diagonal ? "M5 15 15 5M5 5h10v10" : "M3 10h14m-5-5 5 5-5 5"} />
    </svg>
  );
}
export function Mark() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M5 23V7l10 11L25 7v16M5 15l10 11 10-11" strokeLinejoin="round" />
    </svg>
  );
}
export function Sun() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 1v2m0 14v2M1 10h2m14 0h2M3.6 3.6 5 5m10 10 1.4 1.4M3.6 16.4 5 15M15 5l1.4-1.4" />
    </svg>
  );
}
export function ShapeIcon({ shape }: { shape: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {shape === "magnetic" ? (
        <>
          <path d="M5 4v8a7 7 0 0 0 14 0V4h-4v8a3 3 0 0 1-6 0V4Z" />
          <path d="M5 8h4m6 0h4" />
        </>
      ) : shape === "ripple" ? (
        <>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" />
        </>
      ) : (
        <>
          <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />
        </>
      )}
    </svg>
  );
}

export function Moon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M17.5 11.1A7.6 7.6 0 0 1 8.9 2.5a7.6 7.6 0 1 0 8.6 8.6Z" />
    </svg>
  );
}
