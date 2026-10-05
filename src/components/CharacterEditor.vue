<script setup>
import { computed, ref, watch } from 'vue'
import IconChevron from './IconChevron.vue'
import CharacterFigure from './CharacterFigure.vue'

const emit = defineEmits(['hint', 'ready'])

const AXES = {
  female: {
    clothing: ['blue', 'red', 'black'],
    hairStyle: ['short', 'mid', 'long', 'bald'],
    hairColor: ['light', 'dark', 'red'],
  },
  male: {
    clothing: ['jeans', 'whitetee', 'costume'],
    hairStyle: ['a', 'b', 'c', 'bald'],
    hairColor: ['light', 'dark', 'red'],
  },
}

const LABELS = {
  female: {
    clothing: { blue: 'синее платье', red: 'красное платье', black: 'чёрное платье' },
    hairStyle: { short: 'короткие', mid: 'средние', long: 'длинные', bald: 'без волос' },
    hairColor: { light: 'светлые', dark: 'тёмные', red: 'рыжие' },
  },
  male: {
    clothing: { jeans: 'джинсы', whitetee: 'футболка', costume: 'костюм' },
    hairStyle: { a: 'стрижка 1', b: 'стрижка 2', c: 'стрижка 3', bald: 'без волос' },
    hairColor: { light: 'светлые', dark: 'тёмные', red: 'рыжие' },
  },
}

const name = ref('')
const gender = ref(null)
const clothing = ref(0)
const hairStyle = ref(0)
const hairColor = ref(0)
const wrinkles = ref(false)

const axes = computed(() => (gender.value ? AXES[gender.value] : null))
const labels = computed(() => (gender.value ? LABELS[gender.value] : null))

const index = { clothing, hairStyle, hairColor }

function labelFor(axis) {
  if (!labels.value) return ''
  const value = axes.value[axis][index[axis].value]
  return labels.value[axis][value] || ''
}

function pickGender(value) {
  gender.value = value
  clothing.value = 0
  hairStyle.value = 0
  hairColor.value = 0
}

function cycle(axis, dir) {
  if (!gender.value) {
    emit('hint', 'Сначала выбери пол')
    return
  }
  const list = axes.value[axis]
  const r = index[axis]
  r.value = (r.value + dir + list.length) % list.length
}

const ready = computed(() => !!gender.value && name.value.trim().length > 0)
watch(ready, (value) => emit('ready', value), { immediate: true })

const age = computed(() => (wrinkles.value ? 'old' : 'young'))
const clothingKey = computed(() => (axes.value ? axes.value.clothing[clothing.value] : null))
const hairKey = computed(() => (axes.value ? axes.value.hairStyle[hairStyle.value] : null))
const colorKey = computed(() => (axes.value ? axes.value.hairColor[hairColor.value] : null))
</script>

<template>
  <section class="editor">
    <input v-model="name" class="editor__name" type="text" placeholder="Имя">

    <div class="editor__stage">
      <CharacterFigure
        class="editor__figure"
        :gender="gender"
        :age="age"
        :hair="hairKey"
        :color="colorKey"
        :clothing="clothingKey"
      />
    </div>

    <div class="editor__gender">
      <button
        class="gender gender--male"
        :class="{ 'gender--active': gender === 'male' }"
        type="button"
        @click="pickGender('male')"
      >М</button>
      <button
        class="gender gender--female"
        :class="{ 'gender--active': gender === 'female' }"
        type="button"
        @click="pickGender('female')"
      >Ж</button>
    </div>

    <div class="editor__controls" :class="{ 'editor__controls--ghosted': !gender }">
      <div class="control">
        <span class="control__label">Одежда</span>
        <button class="control__arrow" type="button" @click="cycle('clothing', -1)"><IconChevron direction="left" /></button>
        <span class="control__value">{{ labelFor('clothing') }}</span>
        <button class="control__arrow" type="button" @click="cycle('clothing', 1)"><IconChevron direction="right" /></button>
      </div>

      <div class="control">
        <span class="control__label">Причёска</span>
        <button class="control__arrow" type="button" @click="cycle('hairStyle', -1)"><IconChevron direction="left" /></button>
        <span class="control__value">{{ labelFor('hairStyle') }}</span>
        <button class="control__arrow" type="button" @click="cycle('hairStyle', 1)"><IconChevron direction="right" /></button>
      </div>

      <div class="control">
        <span class="control__label">Цвет волос</span>
        <button class="control__arrow" type="button" @click="cycle('hairColor', -1)"><IconChevron direction="left" /></button>
        <span class="control__value">{{ labelFor('hairColor') }}</span>
        <button class="control__arrow" type="button" @click="cycle('hairColor', 1)"><IconChevron direction="right" /></button>
      </div>

      <label class="control control--check">
        <input v-model="wrinkles" type="checkbox">
        <span>Морщины</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.editor__name {
  width: min(100%, 18rem);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-lg);
  text-align: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.editor__stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor__figure {
  height: clamp(200px, 40vh, 420px);
  width: auto;
}

.editor__gender {
  display: flex;
  gap: var(--space-4);
}

.gender {
  width: 4rem;
  height: 4rem;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  border: 2px solid transparent;
  border-radius: 50%;
  color: var(--color-surface);
}

.gender--male {
  background-color: #4b84d1;
}

.gender--female {
  background-color: #e58fb0;
}

.gender--active {
  border-color: var(--color-text);
  box-shadow: 0 0 0 3px rgb(0 0 0 / 0.15);
}

.editor__controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
}

.editor__controls--ghosted .control {
  opacity: 0.4;
}

.control {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
}

.control__label {
  margin-right: var(--space-2);
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.control__value {
  min-width: 7rem;
  text-align: center;
  font-size: var(--fs-sm);
}

.control__arrow {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text);
}

.control--check {
  gap: var(--space-2);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.control--check input[type="checkbox"] {
  --check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 13l4 4L19 7' fill='none' stroke='%23000' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease);
}

.control--check input[type="checkbox"]:checked {
  background-color: var(--color-border);
  border-color: var(--color-border);
}

.control--check input[type="checkbox"]::after {
  content: "";
  position: absolute;
  inset: 2px;
  background-color: var(--color-text);
  -webkit-mask: var(--check) center / contain no-repeat;
  mask: var(--check) center / contain no-repeat;
  transform: scale(0);
  transition: transform var(--dur-fast) var(--ease);
}

.control--check input[type="checkbox"]:checked::after {
  transform: scale(1);
}

.control--check input[type="checkbox"]:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
