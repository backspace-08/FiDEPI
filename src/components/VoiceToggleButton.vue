<script setup>
import IconVolume from './IconVolume.vue'
import IconVolumeOff from './IconVolumeOff.vue'

defineProps({
  enabled: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<template>
  <button
    class="voice-toggle"
    :class="{ 'voice-toggle--on': enabled }"
    type="button"
    :aria-label="enabled ? 'Отключить озвучку' : 'Включить озвучку'"
    :aria-pressed="enabled"
    @click.stop="$emit('toggle')"
  >
    <Transition name="voice-icon" mode="out-in">
      <IconVolume v-if="enabled" key="on" />
      <IconVolumeOff v-else key="off" />
    </Transition>
  </button>
</template>

<style scoped>
.voice-toggle {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  animation: voice-in 0.5s var(--ease) 0.6s both;
  transition: border-color var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}

.voice-toggle--on {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background-color: var(--color-bg);
}

.voice-toggle:hover {
  border-color: var(--color-primary);
}

.voice-icon-enter-active,
.voice-icon-leave-active {
  transition: opacity 0.15s var(--ease), transform 0.15s var(--ease);
}

.voice-icon-enter-from,
.voice-icon-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

@keyframes voice-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
