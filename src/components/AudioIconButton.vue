<script setup>
import IconVolume from './IconVolume.vue'
import { playAudio } from '../lib/audio.js'

const props = defineProps({
  audio: { type: String, default: '' },
  text: { type: String, default: '' },
  label: { type: String, default: 'Послушать' },
})

function play() {
  playAudio(props.audio, props.text)
}
</script>

<template>
  <button class="audio-icon-button" type="button" :aria-label="label" @click.stop="play">
    <IconVolume />
  </button>
</template>

<style scoped>
.audio-icon-button {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease);
}

.audio-icon-button:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg);
}
</style>
