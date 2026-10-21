<template>
  <v-app id="app">
    <v-progress-circular v-if="!ready" indeterminate color="onPrimary" class="ma-5"></v-progress-circular>
    <component :is="layout" v-else />
  </v-app>

  <Toaster id="top-toaster" position="top-center" :richColors="true" :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'" :expand="true" :visibleToasts="3" :offset="16" />
  <Toaster id="bottom-toaster" position="bottom-center" :richColors="true" :theme="theme.global.name.value === 'dark' ? 'dark' : 'light'" :expand="true" :visibleToasts="3" :offset="16" />

  <v-overlay
    :model-value="overlay"
    contained
    class="d-flex align-center justify-center"
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex !important; align-items: center !important; justify-content: center !important"
  >
    <v-progress-circular color="onPrimary" size="64" indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script setup>
import { ref, computed, watch, provide } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useTheme as useVuetifyTheme } from 'vuetify';
import { Toaster } from 'vue-sonner';
import AppShell from './layouts/AppShell.vue';
import { useAuth } from './composables/useAuth';
import { useAppearance } from './composables/useAppearance';
import { useServerInfo } from './composables/useServerInfo';

const route = useRoute();
const router = useRouter();
const theme = useVuetifyTheme();
const { isLoggedIn } = useAuth();
const { hostname } = useServerInfo();
const { applyStoredAppearance, applySystemDefaults } = useAppearance();

const ready = ref(false);
const overlay = ref(false);

provide('overlay', overlay);

router.isReady().then(() => {
  ready.value = true;
});

const layout = computed(() => (route.meta.layout === 'blank' ? RouterView : AppShell));

applyStoredAppearance();

watch(
  isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      applySystemDefaults();
    }
  },
  { immediate: true },
);

watch(
  () => [hostname.value, route.path],
  () => {
    const title = route.meta?.title || '';
    document.title = hostname.value ? `${title} - ${hostname.value}` : title;
  },
);
</script>

<style>
html {
  scrollbar-gutter: stable;
}

.v-btn--variant-flat.bg-primary,
.v-btn--variant-elevated.bg-primary {
  background: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-primary)) !important;
}

.v-btn--variant-flat.bg-secondary,
.v-btn--variant-elevated.bg-secondary {
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-on-secondary)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-secondary)) !important;
}

.v-btn--variant-flat.bg-error,
.v-btn--variant-elevated.bg-error {
  background: rgb(var(--v-theme-error)) !important;
  color: rgb(var(--v-theme-on-error)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-error)) !important;
}

.text-caption {
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}
.text-body-2 {
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}
</style>
