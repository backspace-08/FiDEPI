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
    <IconVolume v-if="enabled" />
    <IconVolumeOff v-else />
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
</style>
