export function normalizeSlug(input: string): string {
  const s = input.trim();
  return s
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
