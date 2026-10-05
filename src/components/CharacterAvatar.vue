<script setup>
import { computed } from 'vue'
import CharacterFigure from './CharacterFigure.vue'

const props = defineProps({
  src: { type: String, default: null },
  figure: { type: Object, default: null },
  alt: { type: String, default: '' },
  size: { type: String, default: '4rem' },
  crop: { type: Object, default: null },
})

const style = computed(() => {
  const s = { '--avatar-size': props.size }
  if (props.crop) {
    s['--avatar-top'] = `${props.crop.top}%`
    s['--avatar-left'] = `${props.crop.left}%`
    s['--avatar-zoom'] = `${props.crop.zoom}%`
  }
  return s
})
</script>

<template>
  <span class="avatar" :style="style">
    <img v-if="src" class="avatar__media" :src="src" :alt="alt">
    <CharacterFigure v-else-if="figure" class="avatar__media avatar__figure" v-bind="figure" />
  </span>
</template>

<style scoped>
.avatar {
  position: relative;
  display: inline-block;
  width: var(--avatar-size);
  aspect-ratio: 1;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-surface);
  vertical-align: middle;
}

.avatar__media {
  position: absolute;
  left: var(--avatar-left, 11.9%);
  top: var(--avatar-top, 11.7%);
  width: var(--avatar-zoom, 76.2%);
  height: auto;
}
</style>