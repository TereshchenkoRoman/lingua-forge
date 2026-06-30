const envName = String(import.meta.env.VITE_SITE_NAME ?? '').trim();

export const SITE_NAME = envName || 'LinguForge';