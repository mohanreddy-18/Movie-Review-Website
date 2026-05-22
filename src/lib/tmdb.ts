const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

function getTmdbApiKey() {
  if (!tmdbApiKey) {
    throw new Error('Missing VITE_TMDB_API_KEY in local environment');
  }

  return tmdbApiKey;
}

export function buildTmdbUrl(
  path: string,
  params: Record<string, string | number> = {}
) {
  const url = new URL(`${TMDB_API_BASE_URL}${path}`);
  url.searchParams.set('api_key', getTmdbApiKey());

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}
