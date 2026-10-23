<template>
  <div
    ref="container"
    class="pull-to-refresh-wrapper"
    @touchstart.prevent="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    :style="{
      transform: `translate3d(0, ${translateY}px, 0)`,
      transition: isRefreshing ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    }"
  >
    <!-- Refresh Indicator -->
    <div class="pull-to-refresh-indicator" :style="{ opacity: showIndicator ? 1 : 0 }" :class="{ 'is-refreshing': isRefreshing, 'is-ready': isDraggedEnough }">
      <v-progress-circular v-if="isRefreshing" indeterminate size="24" width="2" color="primary" />
      <v-icon v-else-if="isDraggedEnough" size="24" color="primary" class="rotate-icon" :style="{ transform: 'rotate(180deg)' }">mdi-arrow-down</v-icon>
      <v-icon v-else size="24" color="primary">mdi-arrow-down</v-icon>
      <span class="ml-2">{{ refreshText }}</span>
    </div>

    <!-- Content Slot -->
    <slot />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  onRefresh: {
    type: Function,
    required: true,
  },
  threshold: {
    type: Number,
    default: 60,
  },
  maxDrag: {
    type: Number,
    default: 120,
  },
});

const emit = defineEmits(['refresh-start', 'refresh-end']);

const { t } = useI18n();

const container = ref(null);
const startY = ref(0);
const translateY = ref(0);
const isRefreshing = ref(false);
const isDraggedEnough = ref(false);
const showIndicator = ref(false);

const refreshText = computed(() => {
  if (isRefreshing.value) return t('refreshing');
  if (isDraggedEnough.value) return t('release to refresh');
  return t('pull to refresh');
});

const onTouchStart = (e) => {
  if (container.value?.scrollTop === 0) {
    startY.value = e.touches[0].clientY;
    showIndicator.value = true;
  }
};

const onTouchMove = (e) => {
  if (!showIndicator.value || isRefreshing.value) return;

  const currentY = e.touches[0].clientY;
  const diff = currentY - startY.value;

  if (diff > 0) {
    e.preventDefault();
    const newTranslateY = Math.min(diff / 2, props.maxDrag);
    translateY.value = newTranslateY;
    isDraggedEnough.value = diff > props.threshold;
  }
};

const onTouchEnd = async () => {
  if (!isDraggedEnough.value || isRefreshing.value) {
    translateY.value = 0;
    showIndicator.value = false;
    isDraggedEnough.value = false;
    return;
  }

  isRefreshing.value = true;
  translateY.value = props.threshold;
  emit('refresh-start');

  try {
    await props.onRefresh();
  } catch (error) {
    console.error('Refresh error:', error);
  } finally {
    isRefreshing.value = false;
    isDraggedEnough.value = false;
    translateY.value = 0;
    showIndicator.value = false;
  }
};
</script>

<style scoped>
.pull-to-refresh-wrapper {
  position: relative;
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
  touch-action: none;
  overscroll-behavior: contain;
}

.pull-to-refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 12px;
  margin: -60px 0 0 0;
  color: rgb(var(--v-theme-primary));
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.3s ease-out;
  will-change: opacity;
}

.rotate-icon {
  transition: transform 0.3s ease-out;
}
</style>
