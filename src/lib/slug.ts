function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateSlug(clientName: string): string {
  const base = slugify(clientName) || "cliente";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
