const CHUNK_RELOAD_STORAGE_KEY = "doomple:chunk-reload-at";
const CHUNK_RELOAD_COOLDOWN_MS = 30_000;
const CHUNK_RELOAD_QUERY_PARAM = "__doomple_chunk_reload";

export function isChunkLoadError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message} ${error.stack || ""}`
      : String(error || "");

  return (
    /ChunkLoadError/i.test(message) ||
    /Loading chunk [\d]+ failed/i.test(message) ||
    /Loading CSS chunk [\d]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /_next\/static\/chunks\//i.test(message)
  );
}

export function attemptChunkReload(options?: { force?: boolean }) {
  if (typeof window === "undefined") {
    return false;
  }

  const now = Date.now();
  const previousAttemptAt = Number(sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || "0");

  if (!options?.force && previousAttemptAt && now - previousAttemptAt < CHUNK_RELOAD_COOLDOWN_MS) {
    return false;
  }

  sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));

  const url = new URL(window.location.href);
  url.searchParams.set(CHUNK_RELOAD_QUERY_PARAM, String(now));
  window.location.replace(url.toString());
  return true;
}
