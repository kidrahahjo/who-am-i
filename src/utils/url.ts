/**
 * Prefix any internal path with Astro's BASE_URL so links work correctly
 * both when deployed to a subpath (e.g. /who-am-i/about) and at root (e.g. /about).
 *
 * import.meta.env.BASE_URL is always a string ending with "/":
 *   base: '/who-am-i'  →  BASE_URL = '/who-am-i/'
 *   no base set        →  BASE_URL = '/'
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // strip trailing slash if present
  return base + (path.startsWith('/') ? path : '/' + path);
}
