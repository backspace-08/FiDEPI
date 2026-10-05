<script setup>
import { computed, ref, watch } from 'vue'
import neutral from '../../svg/normalized/special_out/neutral.svg'
import { loadLayer, preloadLayers } from '../character-layers.js'

const props = defineProps({
  gender: { type: String, default: null },
  age: { type: String, default: 'young' },
  hair: { type: String, default: 'mid' },
  color: { type: String, default: 'light' },
  clothing: { type: String, default: 'blue' },
})

preloadLayers()

const bodyPath = computed(() => {
  if (props.gender === 'female') return `female/body_${props.clothing}_${props.age}.svg`
  if (props.gender === 'male') return `male/body_${props.clothing}_${props.age}.svg`
  return null
})

const hairPath = computed(() => {
  if (props.gender === 'female') return `female/hair_${props.hair}_${props.color}.svg`
  if (props.gender === 'male') return `male/hair_${props.clothing}_${props.hair}_${props.color}.svg`
  return null
})

const bodySrc = ref(neutral)
const hairSrc = ref('')

watch(
  bodyPath,
  async (path) => {
    if (!path) {
      bodySrc.value = neutral
      return
    }
    const url = await loadLayer(path)
    if (url) bodySrc.value = url
  },
  { immediate: true },
)

watch(
  hairPath,
  async (path) => {
    if (!path) {
      hairSrc.value = ''
      return
    }
    const url = await loadLayer(path)
    if (url) hairSrc.value = url
  },
  { immediate: true },
)
</script>

<template>
  <div class="figure">
    <img class="figure__layer" :src="bodySrc" alt="">
    <img v-if="hairSrc" class="figure__layer" :src="hairSrc" alt="">
  </div>
</template>

<style scoped>
.figure {
  position: relative;
  aspect-ratio: 160 / 388;
}

.figure__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>