const SLUG_PATTERN = /[^a-z0-9-]+/g;
const MULTIPLE_HYPHEN_PATTERN = /-+/g;

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(SLUG_PATTERN, "-")
    .replace(MULTIPLE_HYPHEN_PATTERN, "-")
    .replace(/^-|-$/g, "");
}

export function buildInitialSlug(name: string, fallback = "my-portfolio") {
  return normalizeSlug(name) || fallback;
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
