import type { Router } from 'vue-router';
import { useAuth } from '../composables/useAuth';

export function installAuthGuard(router: Router) {
  router.beforeEach(async (to) => {
    const { hasValidSession, loadSetupState, setupToken, mfaToken } = useAuth();

    if (hasValidSession()) {
      return to.meta.public ? { path: '/dashboard' } : true;
    }

    await loadSetupState();

    if (setupToken.value) {
      return to.name === 'firstSetup' ? true : { name: 'firstSetup' };
    }
    if (to.name === 'firstSetup') {
      return { name: 'login' };
    }
    if (to.name === 'mfa' && !mfaToken.value) {
      return { name: 'login' };
    }
    if (to.meta.public) {
      return true;
    }

    return { name: 'login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } };
  });

  let verifying = false;

  window.addEventListener('auth-expired', async () => {
    const { authToken, authHeaders, expireSession } = useAuth();
    if (verifying || !authToken.value) return;

    verifying = true;
    try {
      const res = await fetch('/api/v1/auth/profile', { headers: authHeaders() });
      if (res.status !== 401) return;
    } catch {
      return;
    } finally {
      verifying = false;
    }

    expireSession();
    const current = router.currentRoute.value;
    if (!current.meta.public) {
      router.push({ name: 'login', query: { redirect: current.fullPath } });
    }
  });
}
