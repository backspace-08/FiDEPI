<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { avatars, crops as baseCrops, DEFAULT_CROP } from '../avatars.js'
import CharacterAvatar from './CharacterAvatar.vue'

const STORAGE_KEY = 'fidepi-avatar-crops'

function initialCrops() {
  const out = {}
  for (const a of avatars) out[a.id] = { ...DEFAULT_CROP, ...(baseCrops[a.id] || {}) }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved) {
      for (const id in saved) if (out[id]) out[id] = { ...out[id], ...saved[id] }
    }
  } catch {}
  return out
}

const crops = reactive(initialCrops())
const index = ref(0)
const stage = ref(null)
const copied = ref(false)

const current = computed(() => avatars[index.value])
const crop = computed(() => crops[current.value.id])

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crops))
})

function round1(v) {
  return Math.round(v * 10) / 10
}
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}
function update(key, value) {
  const v = Number(value)
  if (!Number.isNaN(v)) crop.value[key] = round1(v)
}

function zoomBy(factor) {
  const z = crop.value.zoom
  const z2 = clamp(round1(z * factor), 10, 400)
  const r = z2 / z
  crop.value.left = round1(50 - (50 - crop.value.left) * r)
  crop.value.top = round1(50 - (50 - crop.value.top) * r)
  crop.value.zoom = z2
}

function reset() {
  crops[current.value.id] = { ...DEFAULT_CROP, ...(baseCrops[current.value.id] || {}) }
}

let drag = null
function onPointerDown(e) {
  const rect = stage.value.getBoundingClientRect()
  drag = { x: e.clientX, y: e.clientY, left: crop.value.left, top: crop.value.top, w: rect.width, h: rect.height }
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
function onPointerMove(e) {
  if (!drag) return
  crop.value.left = round1(drag.left + ((e.clientX - drag.x) / drag.w) * 100)
  crop.value.top = round1(drag.top + ((e.clientY - drag.y) / drag.h) * 100)
}
function onPointerUp() {
  drag = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}
function onWheel(e) {
  e.preventDefault()
  zoomBy(e.deltaY < 0 ? 1.05 : 1 / 1.05)
}

function prev() {
  index.value = (index.value - 1 + avatars.length) % avatars.length
}
function next() {
  index.value = (index.value + 1) % avatars.length
}

const json = computed(() => JSON.stringify(crops, null, 2))
async function copyJson() {
  try {
    await navigator.clipboard.writeText(json.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {}
}
</script>

<template>
  <div class="editor">
    <header class="editor__bar">
      <strong>Редактор аватаров</strong>
      <span class="editor__hint">тяни круг — позиция · колесо — размер</span>
      <button class="btn btn--primary" type="button" @click="copyJson">{{ copied ? 'Скопировано' : 'Скопировать JSON' }}</button>
    </header>

    <div class="editor__body">
      <div class="editor__stage">
        <div class="editor__circle" ref="stage" @pointerdown="onPointerDown" @wheel="onWheel">
          <CharacterAvatar class="editor__avatar" :src="current.src" :figure="current.figure" :crop="crop" size="100%" :alt="current.label" />
          <div class="crosshair" aria-hidden="true"></div>
        </div>
        <div class="editor__nav">
          <button class="btn" type="button" @click="prev">←</button>
          <span class="editor__name">{{ current.label }}</span>
          <button class="btn" type="button" @click="next">→</button>
        </div>
      </div>

      <div class="editor__panel">
        <label class="row">
          <span class="row__label">top</span>
          <input type="range" min="-200" max="200" step="0.1" :value="crop.top" @input="update('top', $event.target.value)">
          <input class="row__num" type="number" step="0.1" :value="crop.top" @input="update('top', $event.target.value)">
        </label>
        <label class="row">
          <span class="row__label">left</span>
          <input type="range" min="-200" max="200" step="0.1" :value="crop.left" @input="update('left', $event.target.value)">
          <input class="row__num" type="number" step="0.1" :value="crop.left" @input="update('left', $event.target.value)">
        </label>
        <label class="row">
          <span class="row__label">zoom</span>
          <input type="range" min="10" max="300" step="0.1" :value="crop.zoom" @input="update('zoom', $event.target.value)">
          <input class="row__num" type="number" step="0.1" :value="crop.zoom" @input="update('zoom', $event.target.value)">
        </label>

        <div class="editor__actions">
          <button class="btn" type="button" @click="zoomBy(1 / 1.03)">−</button>
          <button class="btn" type="button" @click="zoomBy(1.03)">+</button>
          <button class="btn" type="button" @click="reset">Сброс</button>
        </div>

        <div class="editor__list">
          <button
            v-for="(a, i) in avatars"
            :key="a.id"
            class="editor__thumb"
            :class="{ 'editor__thumb--active': i === index }"
            type="button"
            @click="index = i"
          >
            <CharacterAvatar :src="a.src" :figure="a.figure" :crop="crops[a.id]" size="2.5rem" :alt="a.label" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor {
  min-height: 100svh;
  background-color: var(--color-bg);
}

.editor__bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.editor__hint {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.editor__bar .btn:last-child {
  margin-left: auto;
}

.editor__body {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-6);
  align-items: flex-start;
  flex-wrap: wrap;
}

.editor__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.editor__circle {
  position: relative;
  width: clamp(240px, 55vmin, 440px);
  aspect-ratio: 1;
  cursor: grab;
  touch-action: none;
}

.editor__circle:active {
  cursor: grabbing;
}

.editor__avatar {
  display: block;
  width: 100%;
}

.crosshair {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crosshair::before,
.crosshair::after {
  content: "";
  position: absolute;
  background-color: rgb(212 87 78 / 0.6);
}

.crosshair::before {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
}

.crosshair::after {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}

.editor__nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.editor__name {
  min-width: 12rem;
  text-align: center;
  font-weight: var(--fw-bold);
}

.editor__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 20rem;
}

.row {
  display: grid;
  grid-template-columns: 3rem 1fr 5rem;
  align-items: center;
  gap: var(--space-2);
}

.row__label {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.row__num {
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
}

.editor__actions {
  display: flex;
  gap: var(--space-2);
}

.editor__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.editor__thumb {
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: none;
  cursor: pointer;
}

.editor__thumb--active {
  border-color: var(--color-primary);
}

.btn {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn--primary {
  color: var(--color-surface);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
