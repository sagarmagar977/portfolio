export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "linkedin", label: "LinkedIn", iconClassName: "lab la-linkedin-in" },
  { value: "github", label: "GitHub", iconClassName: "lab la-github" },
  { value: "instagram", label: "Instagram", iconClassName: "lab la-instagram" },
  { value: "facebook", label: "Facebook", iconClassName: "lab la-facebook-f" },
  { value: "twitter", label: "Twitter / X", iconClassName: "lab la-twitter" },
  { value: "youtube", label: "YouTube", iconClassName: "lab la-youtube" },
  { value: "whatsapp", label: "WhatsApp", iconClassName: "lab la-whatsapp" },
] as const;

export const DEFAULT_SOCIAL_ICON_CLASS_NAME = "las la-link";

export function getSocialPlatformMeta(platform: string) {
  return (
    SOCIAL_PLATFORM_OPTIONS.find((option) => option.value === platform.trim().toLowerCase()) ?? {
      value: platform,
      label: platform,
      iconClassName: DEFAULT_SOCIAL_ICON_CLASS_NAME,
    }
  );
}

export function isSupportedSocialPlatform(platform: string) {
  return SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === platform.trim().toLowerCase());
}
