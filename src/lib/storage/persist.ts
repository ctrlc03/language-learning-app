/**
 * Ask the browser not to evict our IndexedDB under storage pressure. Without this the
 * whole study history is "best effort" and can be cleared silently.
 *
 * Resolves to the resulting persisted state, or null when the API is unsupported.
 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return null;
  try {
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return null;
  }
}
