<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <v-col cols="auto" class="d-flex align-center justify-center" style="height: 40px">
            <v-icon @click="$router.back()" class="mr-2" style="vertical-align: middle">mdi-arrow-left</v-icon>
          </v-col>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('network services') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card fluid style="margin-bottom: 80px" class="pa-0">
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12" md="6">
                <v-switch :label="$t('ssh')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.ssh.enabled"></v-switch>
                <v-switch :label="$t('nfs')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nfs.enabled"></v-switch>
                <v-switch :label="$t('remote mounting')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.remote_mounting.enabled"></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch :label="$t('nut')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.nut.enabled"></v-switch>
                <v-switch :label="$t('dnsmasq')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.dnsmasq.enabled"></v-switch>
                <v-switch :label="$t('rsync daemon')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.rsync_daemon.enabled"></v-switch>
              </v-col>
            </v-row>
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('samba') }}</span>
            <v-row no-gutters class="pt-2 pb-2">
              <v-col cols="12" md="6">
                <v-switch :label="$t('samba')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.samba.enabled"></v-switch>
                <v-switch
                  :label="$t('localmaster')"
                  :disabled="!settingsNetwork.samba.enabled"
                  color="green"
                  inset
                  hide-details="auto"
                  density="compact"
                  v-model="settingsNetwork.samba.localmaster"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  :label="$t('samba discovery')"
                  color="green"
                  inset
                  hide-details="auto"
                  density="compact"
                  v-model="settingsNetwork.samba_discovery.enabled"
                  :disabled="!settingsNetwork.samba.enabled"
                ></v-switch>
              </v-col>
            </v-row>
            <v-text-field class="mt-2" :label="$t('workgroup')" color="green" inset hide-details="auto" v-model="settingsNetwork.samba.workgroup"></v-text-field>
            <v-btn v-if="settingsNetwork.samba.enabled" class="mt-3" color="secondary" variant="outlined" size="small" @click="openSambaConfigDialog">
              <v-icon class="mr-2">mdi-file-cog</v-icon>
              {{ $t('edit extra configuration') }}
            </v-btn>
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('tailscale') }}</span>
            <v-chip size="small" v-if="settingsNetwork.tailscale.online" color="green">{{ $t('online') }}</v-chip>
            <v-row no-gutters class="pt-2 pb-2">
              <v-col cols="12" md="6">
                <v-switch
                  :label="$t('tailscale')"
                  color="green"
                  inset
                  hide-details="auto"
                  density="compact"
                  v-model="settingsNetwork.tailscale.enabled"
                  @change="onTailscaleEnabledChange(settingsNetwork.tailscale.enabled)"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  :label="$t('tailscale update check')"
                  color="green"
                  inset
                  hide-details="auto"
                  density="compact"
                  v-model="settingsNetwork.tailscale.update_check"
                  :readonly="!settingsNetwork.tailscale.enabled"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row no-gutters class="pt-2 pb-2 align-center tailscale-web-row">
              <v-col cols="12" md="3" class="tailscale-web-col tailscale-switch-col">
                <v-switch
                  :label="$t('tailscale web')"
                  color="green"
                  inset
                  hide-details="auto"
                  density="compact"
                  v-model="settingsNetwork.tailscale.web.enabled"
                  :readonly="!settingsNetwork.tailscale.enabled"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="4" class="tailscale-web-col tailscale-address-col">
                <v-text-field
                  :label="$t('tailscale web address')"
                  color="green"
                  inset
                  hide-details="auto"
                  v-model="settingsNetwork.tailscale.web.address"
                  :disabled="!settingsNetwork.tailscale.web.enabled"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2" class="tailscale-web-col tailscale-port-col">
                <v-text-field
                  :label="$t('tailscale web port')"
                  color="green"
                  inset
                  hide-details="auto"
                  v-model="settingsNetwork.tailscale.web.port"
                  :disabled="!settingsNetwork.tailscale.web.enabled"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3" class="tailscale-web-col tailscale-button-col">
                <v-btn variant="text" size="small" class="tailscale-open-btn" style="color: green" @click="openTailscaleWeb()" :disabled="!settingsNetwork.tailscale.web.enabled">
                  <v-icon size="18" class="mr-1">mdi-open-in-new</v-icon>
                  {{ $t('open tailscale web') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-text-field class="mt-2" :label="$t('tailscale params')" v-model="settingsNetwork.tailscale.tailscaled_params"></v-text-field>
            <v-btn
              v-if="apiSettingsNetwork && apiSettingsNetwork.tailscale.enabled && !settingsNetwork.tailscale.online"
              variant="text"
              size="small"
              class="ma-1 pa-0"
              style="min-width: 0; color: green"
              @click="openWebTerminal('loginTailscale')"
            >
              <v-icon size="18" class="mr-1">mdi-lock-outline</v-icon>
              {{ $t('tailscale login') }}
            </v-btn>
            <v-btn
              logout
              v-if="apiSettingsNetwork && apiSettingsNetwork.tailscale.enabled && settingsNetwork.tailscale.online"
              variant="text"
              size="small"
              class="ma-1 pa-0"
              style="min-width: 0; color: green"
              @click="
                confirmLogout.value = true;
                confirmLogout.service = 'Tailscale';
              "
            >
              <v-icon size="18" class="mr-1">mdi-lock-outline</v-icon>
              {{ $t('tailscale logout') }}
            </v-btn>
            <v-divider class="my-4"></v-divider>
            <span class="text-title-medium font-weight-medium">{{ $t('netbird') }}</span>
            <v-chip size="small" v-if="settingsNetwork.netbird.online" color="green">{{ $t('online') }}</v-chip>
            <v-row no-gutters class="pt-2 pb-2">
              <v-col cols="12" md="6">
                <v-switch :label="$t('netbird')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.netbird.enabled"></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch :label="$t('netbird update check')" color="green" inset hide-details="auto" density="compact" v-model="settingsNetwork.netbird.update_check"></v-switch>
              </v-col>
            </v-row>
            <v-text-field class="mt-2" :label="$t('netbird service params')" v-model="settingsNetwork.netbird.netbird_service_params"></v-text-field>
            <v-btn
              v-if="apiSettingsNetwork && apiSettingsNetwork.netbird.enabled && !settingsNetwork.netbird.online"
              variant="text"
              size="small"
              class="ma-1 pa-0"
              style="min-width: 0; color: green"
              @click="openWebTerminal('loginNetbird')"
            >
              <v-icon size="18" class="mr-1">mdi-lock-outline</v-icon>
              {{ $t('netbird login') }}
            </v-btn>
            <v-btn
              logout
              v-if="apiSettingsNetwork && apiSettingsNetwork.netbird.enabled && settingsNetwork.netbird.online"
              variant="text"
              size="small"
              class="ma-1 pa-0"
              style="min-width: 0; color: green"
              @click="
                confirmLogout.value = true;
                confirmLogout.service = 'Netbird';
              "
            >
              <v-icon size="18" class="mr-1">mdi-lock-outline</v-icon>
              {{ $t('netbird logout') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Confirm Logout Dialog -->
  <v-dialog v-model="confirmLogout.value" max-width="500">
    <v-card :title="confirmLogout.service + ' - ' + $t('confirm logout')" prepend-icon="mdi-lock-outline">
      <v-card-text>{{ $t('are you sure you want to logout') }}?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="onPrimary"
          @click="
            confirmLogout.value = false;
            confirmLogout.service = '';
          "
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          text
          color="onPrimary"
          @click="
            confirmLogout.value = false;
            openWebTerminal('logout' + confirmLogout.service);
            confirmLogout.service = '';
          "
        >
          {{ $t('logout') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Samba Config Dialog -->
  <v-dialog v-model="sambaConfigDialog.visible" max-width="900" scrollable>
    <v-card :title="$t('samba extra configuration')" prepend-icon="mdi-file-cog" class="d-flex flex-column pa-0" style="max-height: 80vh">
      <v-card-text style="overflow: auto; flex: 1">
        <div class="mb-4">
          <span class="text-title-medium font-weight-medium">{{ $t('global configuration') }}</span>
        </div>
        <div ref="globalEditorContainer" class="editor-wrapper mb-6"></div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <span class="text-title-medium font-weight-medium">{{ $t('shares configuration') }}</span>
        </div>
        <div ref="sharesEditorContainer" class="editor-wrapper mb-6"></div>
        <v-alert type="info" variant="tonal" density="compact" class="mb-4 text-caption">
          {{ $t('samba config auto restart') }}
        </v-alert>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="onPrimary" @click="sambaConfigDialog.visible = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn color="onPrimary" @click="saveSambaConfig">
          {{ $t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Floating Action Button -->
  <v-fab @click="setNetworkSettings()" color="primary" style="position: fixed; bottom: 32px; right: 32px; z-index: 1000" size="large" icon>
    <v-icon>mdi-content-save</v-icon>
  </v-fab>
</template>

<script setup>
import { onMounted, ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue';
import { showSnackbarError } from '@/composables/snackbar';
import { useI18n } from 'vue-i18n';
import { openTerminalPopup } from '@/composables/terminalpopup';
import { useApi } from '@/composables/useApi';
import { useTheme } from 'vuetify';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const { t } = useI18n();
const { call } = useApi();
const settingsNetwork = ref({
  ssh: {
    enabled: false,
  },
  samba: {
    enabled: false,
    workgroup: '',
    localmaster: false,
  },
  samba_discovery: {
    enabled: false,
  },
  nfs: {
    enabled: false,
    exports: [],
  },
  nut: {
    enabled: false,
  },
  tailscale: {
    enabled: false,
    update_check: false,
    tailscaled_params: null,
    web: {
      enabled: false,
      address: '0.0.0.0',
      port: 5252,
    },
    online: false,
  },
  netbird: {
    enabled: false,
    update_check: false,
    netbird_service_params: null,
    online: false,
  },
  remote_mounting: {
    enabled: false,
  },
  dnsmasq: {
    enabled: false,
  },
  rsync_daemon: {
    enabled: false,
  },
});
const confirmLogout = reactive({
  value: false,
  service: '',
});
const sambaConfigDialog = reactive({
  visible: false,
  originalGlobal: '',
  originalShares: '',
});
const globalEditorContainer = ref(null);
const sharesEditorContainer = ref(null);
let globalEditor = null;
let sharesEditor = null;
const apiSettingsNetwork = ref(null);
const theme = useTheme();

onMounted(() => {
  getNetworkSettings();
});

const getNetworkSettings = async () => {
  try {
    const apiData = await call('/api/v1/mos/settings/network/services', {
      errorLabel: t('network settings could not be loaded'),
      showOverlay: false,
    });

    if (apiData) {
      settingsNetwork.value = {
        ssh: { ...settingsNetwork.value.ssh, ...(apiData.ssh || {}) },
        samba: { ...settingsNetwork.value.samba, ...(apiData.samba || {}) },
        samba_discovery: { ...settingsNetwork.value.samba_discovery, ...(apiData.samba_discovery || {}) },
        nfs: { ...settingsNetwork.value.nfs, ...(apiData.nfs || {}) },
        nut: { ...settingsNetwork.value.nut, ...(apiData.nut || {}) },
        tailscale: {
          ...settingsNetwork.value.tailscale,
          ...(apiData.tailscale || {}),
          web: { ...settingsNetwork.value.tailscale.web, ...(apiData.tailscale?.web || {}) },
        },
        netbird: { ...settingsNetwork.value.netbird, ...(apiData.netbird || {}) },
        remote_mounting: { ...settingsNetwork.value.remote_mounting, ...(apiData.remote_mounting || {}) },
        dnsmasq: { ...settingsNetwork.value.dnsmasq, ...(apiData.dnsmasq || {}) },
        rsync_daemon: { ...settingsNetwork.value.rsync_daemon, ...(apiData.rsync_daemon || {}) },
      };
      apiSettingsNetwork.value = JSON.parse(JSON.stringify(settingsNetwork.value));
    }
  } catch {}
};

const setNetworkSettings = async () => {
  try {
    await call('/api/v1/mos/settings/network/services', {
      method: 'POST',
      body: settingsNetwork.value,
      errorLabel: t('network settings could not be changed'),
      successLabel: t('network settings changed successfully'),
      showOverlay: true,
    });

    emit('refresh-drawer');
    getNetworkSettings();
  } catch {}
};

const openWebTerminal = async (service) => {
  const sessionId = await createTerminalSession(service);
  if (sessionId) {
    openTerminalPopup(sessionId);
  } else {
    showSnackbarError(t('failed to create terminal session'));
  }
};

const openTailscaleWeb = () => {
  const address = settingsNetwork.value.tailscale.web.address === '0.0.0.0' ? window.location.hostname : settingsNetwork.value.tailscale.web.address;
  const url = `http://${address}:${settingsNetwork.value.tailscale.web.port}`;
  window.open(url, '_blank');
};

const onTailscaleEnabledChange = (enabled) => {
  if (!enabled) {
    settingsNetwork.value.tailscale.web.enabled = false;
    settingsNetwork.value.tailscale.update_check = false;
  }
};

const createTerminalSession = async (service) => {
  let payload;
  if (service === 'loginTailscale') {
    payload = {
      command: 'tailscale',
      args: ['up'],
      width: 900,
      height: 420,
    };
  } else if (service === 'loginNetbird') {
    payload = {
      command: 'netbird',
      args: ['up'],
      width: 900,
      height: 420,
    };
  } else if (service === 'logoutTailscale') {
    payload = {
      command: 'sh',
      args: ['-c', 'tailscale logout && tailscale status'],
      width: 900,
      height: 420,
    };
  } else if (service === 'logoutNetbird') {
    payload = {
      command: 'sh',
      args: ['-c', 'netbird deregister && netbird status'],
      width: 900,
      height: 420,
    };
  } else {
    return null;
  }

  try {
    const result = await call('/api/v1/terminal/create', {
      method: 'POST',
      body: payload,
      errorLabel: t('failed to create terminal session'),
      showOverlay: false,
    });

    return result?.sessionId || null;
  } catch {
    return null;
  }
};

const createEditor = (container, content) => {
  if (!container) return null;

  const isDark = theme.global.current.value.dark;
  const extensions = [basicSetup, EditorView.lineWrapping];

  if (isDark) {
    extensions.push(oneDark);
  }

  const state = EditorState.create({
    doc: content || '',
    extensions,
  });
  const editor = new EditorView({
    state,
    parent: container,
  });

  return editor;
};

const destroyEditor = (editor) => {
  if (editor) {
    editor.destroy();
  }
};

const openSambaConfigDialog = async () => {
  try {
    const data = await call('/api/v1/mos/settings/network/services/samba/config', {
      errorLabel: t('failed to load samba config'),
      showOverlay: false,
    });

    if (data) {
      sambaConfigDialog.originalGlobal = data.global || '';
      sambaConfigDialog.originalShares = data.shares || '';
      sambaConfigDialog.visible = true;
    }
  } catch {}
};

const saveSambaConfig = async () => {
  const currentGlobal = globalEditor?.state.doc.toString() || '';
  const currentShares = sharesEditor?.state.doc.toString() || '';

  try {
    await call('/api/v1/mos/settings/network/services/samba/config', {
      method: 'POST',
      body: {
        global: currentGlobal || null,
        shares: currentShares || null,
      },
      errorLabel: t('failed to save samba config'),
      successLabel: t('samba config saved successfully'),
      showOverlay: true,
    });

    sambaConfigDialog.originalGlobal = currentGlobal;
    sambaConfigDialog.originalShares = currentShares;
    sambaConfigDialog.visible = false;
  } catch {}
};

watch(
  () => sambaConfigDialog.visible,
  async (visible) => {
    if (visible) {
      await nextTick();
      if (!globalEditor && globalEditorContainer.value) {
        globalEditor = createEditor(globalEditorContainer.value, sambaConfigDialog.originalGlobal);
      }
      if (!sharesEditor && sharesEditorContainer.value) {
        sharesEditor = createEditor(sharesEditorContainer.value, sambaConfigDialog.originalShares);
      }
    } else {
      destroyEditor(globalEditor);
      destroyEditor(sharesEditor);
      globalEditor = null;
      sharesEditor = null;
    }
  },
);

watch(
  () => theme.global.current.value.dark,
  () => {
    if (sambaConfigDialog.visible) {
      destroyEditor(globalEditor);
      destroyEditor(sharesEditor);
      globalEditor = null;
      sharesEditor = null;

      nextTick(() => {
        if (globalEditorContainer.value) {
          globalEditor = createEditor(globalEditorContainer.value, globalEditor?.state.doc.toString() || sambaConfigDialog.originalGlobal);
        }
        if (sharesEditorContainer.value) {
          sharesEditor = createEditor(sharesEditorContainer.value, sharesEditor?.state.doc.toString() || sambaConfigDialog.originalShares);
        }
      });
    }
  },
);

onUnmounted(() => {
  destroyEditor(globalEditor);
  destroyEditor(sharesEditor);
});
</script>

<style scoped>
.editor-wrapper {
  position: relative;
  width: 100%;
  height: 250px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  overflow: auto;
  background: rgb(var(--v-theme-surface));
}

.editor-wrapper :deep(.cm-editor) {
  height: 100%;
  overflow: auto !important;
}

.editor-wrapper :deep(.cm-scroller) {
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.tailscale-web-row {
  gap: 0;
}

.tailscale-web-col {
  padding-right: 8px;
  padding-bottom: 8px;
}

.tailscale-switch-col,
.tailscale-address-col,
.tailscale-port-col,
.tailscale-button-col {
  min-width: 0;
}

.tailscale-open-btn {
  justify-content: flex-start;
  width: 100%;
}

@media (max-width: 960px) {
  .tailscale-web-col {
    padding-right: 0;
    padding-bottom: 12px;
  }

  .tailscale-open-btn {
    justify-content: center;
  }
}
</style>
