const ADDRESS_BOOK_UPDATED_EVENT = 'kadal:address-book-updated';
const ADDRESS_BOOK_UPDATED_AT_KEY = 'kadal:address-book-updated-at';

export function notifyAddressBookUpdated() {
  const timestamp = Date.now().toString();

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ADDRESS_BOOK_UPDATED_AT_KEY, timestamp);
  } catch {
    // Ignore storage failures and still emit the in-tab event below.
  }

  window.dispatchEvent(new CustomEvent(ADDRESS_BOOK_UPDATED_EVENT, { detail: { timestamp } }));
}

export function subscribeToAddressBookUpdates(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const onCustomEvent = () => callback();
  const onStorageEvent = (event: StorageEvent) => {
    if (event.key === ADDRESS_BOOK_UPDATED_AT_KEY) {
      callback();
    }
  };

  window.addEventListener(ADDRESS_BOOK_UPDATED_EVENT, onCustomEvent as EventListener);
  window.addEventListener('storage', onStorageEvent);

  return () => {
    window.removeEventListener(ADDRESS_BOOK_UPDATED_EVENT, onCustomEvent as EventListener);
    window.removeEventListener('storage', onStorageEvent);
  };
}
