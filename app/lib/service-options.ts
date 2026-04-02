export type ServiceOption = {
  value: string;
  label: string;
  title: string;
  iconName: string;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    value: "frontend",
    label: "Frontend",
    title: "Frontend Development",
    iconName: "las la-code",
  },
  {
    value: "backend",
    label: "Backend",
    title: "Backend Development",
    iconName: "las la-server",
  },
  {
    value: "full-stack",
    label: "Full Stack",
    title: "Full-Stack Development",
    iconName: "las la-laptop-code",
  },
  {
    value: "music-production",
    label: "Music Production",
    title: "Music Production",
    iconName: "las la-music",
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

  if (normalized.includes("back") || normalized.includes("server")) {
    return getServiceOption("backend");
  }

  return null;
}
