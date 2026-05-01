interface CebeesLogoProps {
  size?: number;
}

export function CebeesLogo({ size = 34 }: CebeesLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 2L36 8V22C36 31 29 38.5 20 42C11 38.5 4 31 4 22V8L20 2Z"
        fill="#0E5107"
      />
      <rect x="12" y="14" width="16" height="3" rx="1.5" fill="white" opacity="0.9" />
      <rect x="12" y="20" width="16" height="3" rx="1.5" fill="white" opacity="0.9" />
      <rect x="12" y="26" width="10" height="3" rx="1.5" fill="white" opacity="0.9" />
    </svg>
  );
}
