type AuthSession = {
  token: string;
  refreshToken?: string | null;
  expiresAt: number;
};

type StoredUser = {
  id: string;
  authUserId?: string | null;
  name: string;
  email: string;
  phoneNumber: string;
  role?: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  profileImage?: string;
};

type StoredOrder = {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    weight?: string;
  }>;
  address: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  pointsEarned: number;
};

const KEYS = {
  auth: 'kadal:auth',
  user: 'kadal:user',
  orders: 'kadal:orders',
  notifications: 'kadal:notificationsEnabled',
  activity: 'kadal:userActivityLogs',
  recentOrder: 'recentOrder',
  legacyToken: 'token',
  legacyTokenAlt: 'oceanFreshToken',
  legacyUser: 'userData',
};

const isBrowser = () => typeof window !== 'undefined';

function parseJsonSafe<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const clientStorage = {
  auth: {
    setSession(
      token: string,
      options?: {
        ttlMs?: number;
        expiresInSec?: number;
        refreshToken?: string | null;
      }
    ) {
      if (!isBrowser()) return;
      const ttlMs =
        typeof options?.expiresInSec === 'number'
          ? Math.max(30 * 1000, options.expiresInSec * 1000)
          : (options?.ttlMs ?? 1000 * 60 * 60 * 24 * 7);
      const session: AuthSession = {
        token,
        refreshToken: options?.refreshToken || null,
        expiresAt: Date.now() + ttlMs,
      };
      localStorage.setItem(KEYS.auth, JSON.stringify(session));
      localStorage.setItem(KEYS.legacyToken, token);
      localStorage.setItem(KEYS.legacyTokenAlt, token);
    },
    getSession(): AuthSession | null {
      if (!isBrowser()) return null;
      return parseJsonSafe<AuthSession | null>(localStorage.getItem(KEYS.auth), null);
    },
    getToken(): string | null {
      if (!isBrowser()) return null;

      const session = this.getSession();
      if (session?.token && session.expiresAt > Date.now()) {
        return session.token;
      }

      if (session?.refreshToken) {
        return null;
      }

      const legacyToken = localStorage.getItem(KEYS.legacyToken) || localStorage.getItem(KEYS.legacyTokenAlt);
      if (legacyToken) {
        this.setSession(legacyToken);
        return legacyToken;
      }

      this.clearSession();
      return null;
    },
    getRefreshToken(): string | null {
      if (!isBrowser()) return null;
      const session = this.getSession();
      if (!session?.refreshToken) return null;
      return session.refreshToken;
    },
    getExpiresAt(): number | null {
      if (!isBrowser()) return null;
      const session = this.getSession();
      return typeof session?.expiresAt === 'number' ? session.expiresAt : null;
    },
    clearSession() {
      if (!isBrowser()) return;
      localStorage.removeItem(KEYS.auth);
      localStorage.removeItem(KEYS.legacyToken);
      localStorage.removeItem(KEYS.legacyTokenAlt);
    },
  },

  user: {
    set(user: StoredUser) {
      if (!isBrowser()) return;
      localStorage.setItem(KEYS.user, JSON.stringify(user));
      localStorage.setItem(KEYS.legacyUser, JSON.stringify(user));
    },
    get(): StoredUser | null {
      if (!isBrowser()) return null;
      const user = parseJsonSafe<StoredUser | null>(localStorage.getItem(KEYS.user), null);
      if (user) return user;

      const legacyUser = parseJsonSafe<StoredUser | null>(localStorage.getItem(KEYS.legacyUser), null);
      if (legacyUser) {
        this.set(legacyUser);
        return legacyUser;
      }

      return null;
    },
    clear() {
      if (!isBrowser()) return;
      localStorage.removeItem(KEYS.user);
      localStorage.removeItem(KEYS.legacyUser);
    },
  },

  orders: {
    getAll(): StoredOrder[] {
      if (!isBrowser()) return [];
      return parseJsonSafe<StoredOrder[]>(localStorage.getItem(KEYS.orders), []);
    },
    saveAll(orders: StoredOrder[]) {
      if (!isBrowser()) return;
      localStorage.setItem(KEYS.orders, JSON.stringify(orders.slice(0, 100)));
    },
    add(order: StoredOrder) {
      if (!isBrowser()) return;
      const existing = this.getAll();
      this.saveAll([order, ...existing]);
      localStorage.setItem(KEYS.recentOrder, JSON.stringify(order));
    },
    updateStatus(orderId: string, status: StoredOrder['status']) {
      if (!isBrowser()) return;
      const orders = this.getAll().map((order) => {
        if (order.id !== orderId && order.orderNumber !== orderId) return order;
        return {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        };
      });
      this.saveAll(orders);
    },
    find(orderId: string): StoredOrder | undefined {
      return this.getAll().find((order) => order.id === orderId || order.orderNumber === orderId);
    },
  },

  ui: {
    setNotificationsEnabled(enabled: boolean) {
      if (!isBrowser()) return;
      localStorage.setItem(KEYS.notifications, String(enabled));
    },
    getNotificationsEnabled(defaultValue = true): boolean {
      if (!isBrowser()) return defaultValue;
      const value = localStorage.getItem(KEYS.notifications);
      if (value === null) return defaultValue;
      return value === 'true';
    },
  },

  activity: {
    append(entry: Record<string, unknown>) {
      if (!isBrowser()) return;
      const logs = parseJsonSafe<Record<string, unknown>[]>(localStorage.getItem(KEYS.activity), []);
      localStorage.setItem(KEYS.activity, JSON.stringify([...logs, entry]));
    },
  },

  clearSession() {
    this.auth.clearSession();
    this.user.clear();
  },
};

export type { StoredOrder, StoredUser };
