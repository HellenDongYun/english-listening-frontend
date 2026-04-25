// utils/text.ts

export function capitalize(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function capitalizeWords(text: string) {
  if (!text) return "";
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function truncate(text: string, length: number) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}
