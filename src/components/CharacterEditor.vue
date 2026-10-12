<script setup>
import { computed } from 'vue'
import IconChevron from './IconChevron.vue'
import CharacterFigure from './CharacterFigure.vue'

const emit = defineEmits(['hint'])

const props = defineProps({
  member: { type: Object, required: true },
})

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

const AXIS_KEY = { clothing: 'clothing', hairStyle: 'hair', hairColor: 'color' }

const axes = computed(() => (props.member.gender ? AXES[props.member.gender] : null))
const labels = computed(() => (props.member.gender ? LABELS[props.member.gender] : null))

function labelFor(axis) {
  if (!labels.value) return ''
  return labels.value[axis][props.member[AXIS_KEY[axis]]] || ''
}

function pickGender(value) {
  const m = props.member
  m.gender = value
  m.hair = value === 'female' ? 'mid' : 'a'
  m.color = 'light'
  m.clothing = value === 'female' ? 'blue' : 'jeans'
}

function cycle(axis, dir) {
  const m = props.member
  if (!m.gender) {
    emit('hint', 'Сначала выбери пол')
    return
  }
  const list = axes.value[axis]
  const key = AXIS_KEY[axis]
  const i = list.indexOf(m[key])
  m[key] = list[(i + dir + list.length) % list.length]
}
</script>

<template>
  <section class="editor">
    <input v-model="member.name" class="editor__name" type="text" placeholder="Имя">

    <div class="editor__stage">
      <CharacterFigure
        class="editor__figure"
        :gender="member.gender"
        :age="member.age"
        :hair="member.hair"
        :color="member.color"
        :clothing="member.clothing"
      />
    </div>

    <div class="editor__gender">
      <button
        class="gender gender--male"
        :class="{ 'gender--active': member.gender === 'male' }"
        type="button"
        @click="pickGender('male')"
      >М</button>
      <button
        class="gender gender--female"
        :class="{ 'gender--active': member.gender === 'female' }"
        type="button"
        @click="pickGender('female')"
      >Ж</button>
    </div>

    <div class="editor__controls" :class="{ 'editor__controls--ghosted': !member.gender }">
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
        <input
          type="checkbox"
          :checked="member.age === 'old'"
          @change="member.age = $event.target.checked ? 'old' : 'young'"
        >
        <span>Морщины</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.editor {
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor__figure {
  height: clamp(160px, 32vh, 340px);
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
