/**
 * Service worker registration utilities.
 * Provides helpers for registering, unregistering, and updating
 * service workers, as well as monitoring online/offline status.
 */

export type ServiceWorkerStatus =
  | 'unsupported'
  | 'registering'
  | 'registered'
  | 'error';

/**
 * Registers a service worker at the given path.
 * Returns the ServiceWorkerRegistration on success, or null if
 * the browser does not support service workers.
 */
export async function registerServiceWorker(
  swPath = '/sw.js'
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath);
    return registration;
  } catch {
    return null;
  }
}

/**
 * Unregisters all currently registered service workers.
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister())
  );
}

/**
 * Checks for updates to the given service worker registration.
 * Triggers the browser to fetch the service worker script again
 * and compare it with the currently installed version.
 */
export async function checkForUpdates(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  return registration.update();
}

/**
 * Returns true when the browser reports no network connection.
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Registers listeners for online and offline events.
 * The callback receives true when the browser goes online
 * and false when it goes offline.
 * Returns a cleanup function that removes the listeners.
 */
export function onOnlineStatusChange(
  callback: (isOnline: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
