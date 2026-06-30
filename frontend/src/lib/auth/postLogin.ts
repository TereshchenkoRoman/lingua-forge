export const DEFAULT_POST_LOGIN = '/';
export const PROFILE_COMPLETE_PATH = '/profile/complete';
export const PROFILE_EDIT_PATH = '/profile/edit';
export const LOGIN_PATHS = ['/login', '/signup'] as const;

type MaybeUser = {
  profile_complete?: boolean;
} | null;

function normalizePath(path?: string | null): string | undefined {
  const normalizedPath = path?.trim();

  return normalizedPath || undefined;
}

export function isAuthRoute(path: string): boolean {
  const normalizedPath = normalizePath(path);

  if (!normalizedPath) return false;

  const { pathname } = new URL(normalizedPath, 'http://example.invalid');

  return LOGIN_PATHS.includes(pathname as (typeof LOGIN_PATHS)[number]);
}

export function resolvePostLogin(
  user?: MaybeUser,
  from?: string | null,
  fallback?: string,
): string {
  if (user?.profile_complete === false) {
    return PROFILE_COMPLETE_PATH;
  }

  const candidate = normalizePath(from);

  if (candidate && !isAuthRoute(candidate)) {
    return candidate;
  }

  const fallbackPath = normalizePath(fallback);

  if (fallbackPath && !isAuthRoute(fallbackPath)) {
    return fallbackPath;
  }

  return DEFAULT_POST_LOGIN;
}

export function getNextFromSearch(search?: string | null): string | null {
  if (!search) return null;

  const queryString = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(queryString);

  return params.get('next') || params.get('from');
}