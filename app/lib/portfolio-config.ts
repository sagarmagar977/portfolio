export const PORTFOLIO_ROLE_LIMIT = 3;

export const PORTFOLIO_ROLES = [
  {
    value: "developer",
    label: "Developer",
    description: "Software projects, services, and experience.",
    iconName: "las la-code",
  },
  {
    value: "designer",
    label: "Designer",
    description: "Visual, product, and interface work.",
    iconName: "las la-pen-nib",
  },
  {
    value: "beatmaker",
    label: "Beatmaker",
    description: "Tracks, covers, and music production.",
    iconName: "las la-music",
  },
  {
    value: "photographer",
    label: "Photographer",
    description: "Gallery collections and photo stories.",
    iconName: "las la-camera",
  },
  {
    value: "artist",
    label: "Artist",
    description: "Paintings, illustrations, and artwork.",
    iconName: "las la-paint-brush",
  },
  {
    value: "three-d",
    label: "3D / Motion",
    description: "3D work, animation, GIFs, and motion previews.",
    iconName: "las la-cube",
  },
  {
    value: "business",
    label: "Business",
    description: "Ventures, products, and company highlights.",
    iconName: "las la-briefcase",
  },
  {
    value: "creator",
    label: "Creator",
    description: "A broad creative profile spanning multiple media.",
    iconName: "las la-bolt",
  },
] as const;

export type PortfolioRole = (typeof PORTFOLIO_ROLES)[number]["value"];

export const PORTFOLIO_TEMPLATES = [
  {
    key: "classic",
    name: "Classic Sidebar",
    description: "A familiar sidebar portfolio with strong section-based storytelling.",
    previewClassName: "template-preview-classic",
  },
] as const;

export type PortfolioTemplateKey = (typeof PORTFOLIO_TEMPLATES)[number]["key"];

const roleSet = new Set<PortfolioRole>(PORTFOLIO_ROLES.map((role) => role.value));
export function isPortfolioRole(value: string): value is PortfolioRole {
  return roleSet.has(value as PortfolioRole);
}

export function isPortfolioTemplateKey(value: string): value is PortfolioTemplateKey {
  return value === "classic";
}

export function normalizePortfolioRoles(values: string[]) {
  const unique = [...new Set(values.filter(isPortfolioRole))];
  return unique.slice(0, PORTFOLIO_ROLE_LIMIT);
}

export function normalizeTemplateKey(value: string | null | undefined): PortfolioTemplateKey {
  void value;
  return "classic";
}

export function roleHasAny(
  roles: readonly string[],
  expected: readonly PortfolioRole[],
) {
  return expected.some((role) => roles.includes(role));
}
