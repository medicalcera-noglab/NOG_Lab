export function AdminIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NOG Lab"
    >
      {/* Two-tone arc circle — teal left, coral right */}
      <path
        d="M 19.5 23.5 A 13 13 0 1 1 19.5 4.5"
        stroke="#0E6E6E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 19.5 4.5 A 13 13 0 0 1 19.5 23.5"
        stroke="#E2725B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Simplified gut S-curve */}
      <path
        d="M 14 7 C 14 9.5, 17 10, 17 12.5 C 17 15, 11 15.5, 11 18 C 11 20, 14 20.5, 14 21"
        stroke="#E2725B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 14 7 C 14 9.5, 17 10, 17 12.5 C 17 15, 11 15.5, 11 18 C 11 20, 14 20.5, 14 21"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* Bacteria dots */}
      <circle cx="22" cy="12" r="1.2" fill="#E2725B" />
      <circle cx="22.5" cy="16" r="1.2" fill="#E2725B" />
    </svg>
  )
}
