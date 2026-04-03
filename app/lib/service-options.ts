import type { PortfolioRole } from "@/lib/portfolio-config";

export type ServiceOption = {
  value: string;
  label: string;
  title: string;
  iconName: string;
  roles: PortfolioRole[];
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    value: "frontend",
    label: "Frontend",
    title: "Frontend Development",
    iconName: "las la-code",
    roles: ["developer", "designer", "creator"],
  },
  {
    value: "backend",
    label: "Backend",
    title: "Backend Development",
    iconName: "las la-server",
    roles: ["developer", "creator"],
  },
  {
    value: "full-stack",
    label: "Full Stack",
    title: "Full-Stack Development",
    iconName: "las la-laptop-code",
    roles: ["developer", "creator"],
  },
  {
    value: "ui-design",
    label: "UI Design",
    title: "UI Design",
    iconName: "las la-pen-nib",
    roles: ["designer", "creator"],
  },
  {
    value: "branding",
    label: "Branding",
    title: "Brand Identity",
    iconName: "las la-palette",
    roles: ["designer", "artist", "creator"],
  },
  {
    value: "photo-direction",
    label: "Photo Direction",
    title: "Photography Direction",
    iconName: "las la-camera",
    roles: ["photographer", "creator"],
  },
  {
    value: "motion-design",
    label: "Motion Design",
    title: "Motion Design",
    iconName: "las la-cube",
    roles: ["three-d", "designer", "creator"],
  },
  {
    value: "music-production",
    label: "Music Production",
    title: "Music Production",
    iconName: "las la-music",
    roles: ["beatmaker", "creator"],
  },
  {
    value: "creative-direction",
    label: "Creative Direction",
    title: "Creative Direction",
    iconName: "las la-bolt",
    roles: ["creator", "business"],
  },
  {
    value: "business-strategy",
    label: "Business Strategy",
    title: "Business Strategy",
    iconName: "las la-briefcase",
    roles: ["business"],
  },
];

export function getServiceOption(value: string | null | undefined) {
  return SERVICE_OPTIONS.find((option) => option.value === value) ?? null;
}

export function inferServiceOptionFromTitle(title: string | null | undefined) {
  const normalized = (title ?? "").trim().toLowerCase();

  if (normalized.includes("front")) {
    return getServiceOption("frontend");
  }

  if (normalized.includes("full")) {
    return getServiceOption("full-stack");
  }

  if (normalized.includes("music")) {
    return getServiceOption("music-production");
  }

  if (normalized.includes("brand")) {
    return getServiceOption("branding");
  }

  if (normalized.includes("photo")) {
    return getServiceOption("photo-direction");
  }

  if (normalized.includes("motion")) {
    return getServiceOption("motion-design");
  }

  if (normalized.includes("creative")) {
    return getServiceOption("creative-direction");
  }

  if (normalized.includes("business") || normalized.includes("strategy")) {
    return getServiceOption("business-strategy");
  }

  if (normalized.includes("ui") || normalized.includes("design")) {
    return getServiceOption("ui-design");
  }

  if (normalized.includes("back") || normalized.includes("server")) {
    return getServiceOption("backend");
  }

  return null;
}

export function getServiceOptionsForRoles(roles: readonly PortfolioRole[]) {
  if (roles.length === 0) {
    return SERVICE_OPTIONS.filter((option) => option.roles.includes("developer"));
  }

  return SERVICE_OPTIONS.filter((option) =>
    option.roles.some((role) => roles.includes(role)),
  );
}
