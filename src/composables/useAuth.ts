import { ref, computed } from 'vue';

const AUTH_TOKEN_KEY = 'authToken';
const SESSION_KEYS = ['authToken', 'userid', 'username', 'hideInactiveMenus', 'groupMenus', 'drawer', 'byte_format'];

export interface AuthUser {
  id: number | string;
  username?: string;
  byte_format?: string;
  hide_inactive_menus?: boolean;
  group_menus?: boolean;
  darkmode?: boolean | string | null;
  language?: string;
  primary_color?: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
  message?: string;
}

const authToken = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
const setupToken = ref<string | false | null>(null);
const mfaToken = ref('');

const checkTokenExpired = (token: string): boolean => {
  if (token) {
    const payload = token.split('.')[1];
    try {
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        return true;
      }
    } catch (e) {
      return true;
    }
  }
  return false;
};

export function useAuth() {
  const isLoggedIn = computed(() => !!authToken.value);

  const authHeaders = (json = false): Record<string, string> => ({
    Authorization: 'Bearer ' + authToken.value,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  });

  const expireSession = () => {
    authToken.value = null;
    mfaToken.value = '';
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const hasValidSession = (): boolean => {
    if (!authToken.value) return false;
    if (checkTokenExpired(authToken.value)) {
      expireSession();
      return false;
    }
    return true;
  };

  const startSession = (result: LoginResult, fallbackUsername = '') => {
    authToken.value = result.token;
    mfaToken.value = '';
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('userid', String(result.user.id));
    localStorage.setItem('byte_format', result.user.byte_format || 'binary');
    localStorage.setItem('username', result.user.username || fallbackUsername);
    localStorage.setItem('hideInactiveMenus', result.user.hide_inactive_menus ? 'true' : 'false');
    localStorage.setItem('groupMenus', result.user.group_menus ? 'true' : 'false');
  };

  const logout = () => {
    authToken.value = null;
    mfaToken.value = '';
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  };

  const loadSetupState = async () => {
    if (setupToken.value !== null) return;
    try {
      const res = await fetch('/api/v1/auth/firstsetup', { method: 'GET' });
      if (!res.ok) throw new Error('API-Error');
      const result = await res.json();
      setupToken.value = result.firstsetup || false;
    } catch (e) {
      setupToken.value = false;
    }
  };

  const completeSetup = () => {
    setupToken.value = false;
  };

  const fetchProfile = async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch('/api/v1/auth/profile', { method: 'GET', headers: authHeaders() });
      if (!res.ok) return null;
      const profile: AuthUser = await res.json();
      localStorage.setItem('userid', String(profile.id));
      localStorage.setItem('hideInactiveMenus', String(profile.hide_inactive_menus));
      localStorage.setItem('groupMenus', String(profile.group_menus));
      return profile;
    } catch (e) {
      return null;
    }
  };

  const resolveRedirect = (value: unknown): string => {
    if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) return value;
    return '/dashboard';
  };

  return {
    authToken,
    setupToken,
    mfaToken,
    isLoggedIn,
    authHeaders,
    checkTokenExpired,
    hasValidSession,
    expireSession,
    startSession,
    logout,
    loadSetupState,
    completeSetup,
    fetchProfile,
    resolveRedirect,
  };
}
