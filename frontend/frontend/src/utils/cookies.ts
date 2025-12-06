export function getCookie(name: string): string | null {
  const match = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1]);
}

export function getCsrfToken(): string | null {
  return getCookie("csrftoken");
}