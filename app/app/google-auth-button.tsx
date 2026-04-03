type GoogleAuthButtonProps = {
  href: string;
  label: string;
};

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="google-auth-button-logo"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.653 32.657 29.19 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
      <path fill="#FF3D00" d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.277 4 24 4c-7.682 0-14.418 4.337-17.694 10.691Z" />
      <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.653 36 24 36c-5.169 0-9.625-3.328-11.289-7.946l-6.525 5.025C9.423 39.556 16.227 44 24 44Z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.571l.003-.002 6.19 5.238C36.971 39.215 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
    </svg>
  );
}

export function GoogleAuthButton({ href, label }: GoogleAuthButtonProps) {
  return (
    <a href={href} className="google-auth-button">
      <span className="google-auth-button-icon" aria-hidden="true">
        <GoogleLogo />
      </span>
      <span className="google-auth-button-label">{label}</span>
    </a>
  );
}
