<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BLOCKS, BLOCK_ORDER } from '../data/blocks.js'
import { QUESTION_BY_N } from '../data/questions.js'
import { CHILD_RESULT_TEXTS, PARENT_RESULT_TEXTS } from '../data/results-texts.js'
import { scoreAssessment } from '../lib/scoring.js'

const props = defineProps({
  answers: { type: Array, default: () => [] },
  members: { type: Array, default: null },
  initialView: { type: String, default: 'child' },
})

const emit = defineEmits(['audio-context'])

function loadFamily() {
  try {
    const data = JSON.parse(localStorage.getItem('fidepi-family') || 'null')
    if (Array.isArray(data) && data.length) return data
  } catch {}
  return []
}

const fallbackMembers = loadFamily()
const members = computed(() => (props.members?.length ? props.members : fallbackMembers))

const result = computed(() => scoreAssessment(props.answers, members.value))

const PARENT_CODE = '123456'
const PSYCHOLOGIST_CODE = '654321'

const view = ref(props.initialView)
const parentUnlocked = ref(false)
const psychologistUnlocked = ref(false)

const codeDigits = ref(['', '', '', '', '', ''])
const codeInputs = ref([])
const codeError = ref('')
const shake = ref(false)
let shakeTimer

const codeComplete = computed(() => codeDigits.value.every(Boolean))

function setCellRef(el, index) {
  if (el) codeInputs.value[index] = el
}

function focusCell(index) {
  codeInputs.value[index]?.focus()
}

function resetCode() {
  codeDigits.value = ['', '', '', '', '', '']
  codeError.value = ''
  shake.value = false
}

function fillFrom(start, text) {
  const digits = text.replace(/\D/g, '').split('')
  digits.forEach((digit, offset) => {
    const index = start + offset
    if (index < 6) codeDigits.value[index] = digit
  })
  codeError.value = ''
  focusCell(Math.min(start + digits.length, 5))
  if (codeDigits.value.every(Boolean)) submitCode()
}

function onDigitInput(event, index) {
  const digits = event.target.value.replace(/\D/g, '')
  if (!digits) {
    codeDigits.value[index] = ''
    event.target.value = ''
    return
  }
  if (digits.length > 1) {
    fillFrom(index, digits)
    return
  }
  codeDigits.value[index] = digits
  codeError.value = ''
  if (index < 5) {
    focusCell(index + 1)
  } else if (codeDigits.value.every(Boolean)) {
    submitCode()
  }
}

function onKeydown(event, index) {
  if (event.key === 'Backspace') {
    event.preventDefault()
    if (codeDigits.value[index]) {
      codeDigits.value[index] = ''
    } else if (index > 0) {
      codeDigits.value[index - 1] = ''
      focusCell(index - 1)
    }
    codeError.value = ''
    return
  }
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusCell(index - 1)
    return
  }
  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    focusCell(index + 1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    submitCode()
  }
}

function onPaste(event) {
  event.preventDefault()
  fillFrom(0, event.clipboardData?.getData('text') || '')
}

function selectView(next) {
  view.value = next
  resetCode()
}

function submitCode() {
  const value = codeDigits.value.join('')
  if (view.value === 'parent' && value === PARENT_CODE) {
    parentUnlocked.value = true
    resetCode()
    return
  }
  if (view.value === 'psychologist' && value === PSYCHOLOGIST_CODE) {
    psychologistUnlocked.value = true
    resetCode()
    return
  }
  codeError.value = 'Неверный код'
  codeDigits.value = ['', '', '', '', '', '']
  shake.value = false
  requestAnimationFrame(() => {
    shake.value = true
  })
  clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => (shake.value = false), 450)
  focusCell(0)
}

onBeforeUnmount(() => clearTimeout(shakeTimer))

const status = computed(() => result.value.overall.status)
const audioStatus = computed(() => (status.value === 'unknown' ? 'normal' : status.value))
const childText = computed(() => CHILD_RESULT_TEXTS[status.value] || CHILD_RESULT_TEXTS.normal)
const parentText = computed(() => PARENT_RESULT_TEXTS[status.value] || PARENT_RESULT_TEXTS.normal)

watch(
  [view, parentUnlocked, audioStatus, childText, parentText],
  () => {
    if (view.value === 'child') {
      emit('audio-context', {
        audio: `result-child-${audioStatus.value}.ogg`,
        text: childText.value,
      })
    } else if (view.value === 'parent' && parentUnlocked.value) {
      emit('audio-context', {
        audio: `result-parent-${audioStatus.value}.ogg`,
        text: parentText.value,
      })
    } else {
      emit('audio-context', null)
    }
  },
  { immediate: true },
)

const memberNames = computed(() => ({
  ...Object.fromEntries(members.value.map((member) => [member.id, member.name || 'Без имени'])),
  stranger: 'Никто',
}))

const primaryAnswers = computed(() =>
  [...props.answers]
    .sort((a, b) => a.n - b.n)
    .map((answer, index) => ({
      index: index + 1,
      n: answer.n,
      text: QUESTION_BY_N.get(answer.n)?.text || '',
      name: memberNames.value[answer.memberId] || '-',
    })),
)

function blockCount(member, block) {
  return member.counts[block] || 0
}
</script>

<template>
  <section class="results">
    <div class="results__tabs" role="tablist">
      <button
        class="results__tab"
        :class="{ 'results__tab--active': view === 'child' }"
        type="button"
        @click="selectView('child')"
      >Ребёнку</button>
      <button
        class="results__tab"
        :class="{ 'results__tab--active': view === 'parent', 'results__tab--locked': !parentUnlocked }"
        type="button"
        @click="selectView('parent')"
      >Родителю</button>
      <button
        class="results__tab"
        :class="{ 'results__tab--active': view === 'psychologist', 'results__tab--locked': !psychologistUnlocked }"
        type="button"
        @click="selectView('psychologist')"
      >Психологу</button>
    </div>

    <div v-if="view === 'child'" class="results__panel">
      <h2 class="results__title">Твой результат</h2>
      <p class="results__text">{{ childText }}</p>
    </div>

    <div v-else-if="view === 'parent' && parentUnlocked" class="results__panel">
      <h2 class="results__title">Результат для родителя</h2>
      <p class="results__text">{{ parentText }}</p>
    </div>

    <div v-else-if="view === 'psychologist' && psychologistUnlocked" class="results__panel">
      <h2 class="results__title">Профессиональный результат</h2>

      <div class="results__members">
        <article v-for="member in result.members" :key="member.memberId" class="member">
          <header class="member__head">
            <span class="member__name">{{ member.name }}</span>
            <span class="member__ratio">
              +{{ member.positivePct }}% / −{{ member.negativePct }}%
            </span>
          </header>

          <p class="member__line">
            Доля писем: {{ member.assigned }} ({{ member.share }}%)
          </p>
          <p class="member__line">
            Положительные: {{ member.positive }} · отрицательные: {{ member.negative }}
          </p>

          <ul class="member__blocks">
            <li
              v-for="key in BLOCK_ORDER"
              :key="key"
              :class="['member__block', BLOCKS[key].valence === 'positive' ? 'member__block--positive' : 'member__block--negative']"
            >
              <span class="member__block-name">{{ BLOCKS[key].title }}</span>
              <span class="member__block-value">{{ blockCount(member, key) }}/{{ BLOCKS[key].max }}</span>
            </li>
          </ul>
        </article>
      </div>

      <div class="results__answers">
        <h3 class="results__subtitle">Первичные ответы</h3>
        <div class="answers__wrap">
          <table class="answers">
            <thead>
              <tr>
                <th class="answers__num">№</th>
                <th class="answers__target">Адресат</th>
                <th class="answers__text">Утверждение</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="answer in primaryAnswers" :key="answer.n">
                <td class="answers__num">{{ answer.index }}</td>
                <td class="answers__target">{{ answer.name }}</td>
                <td class="answers__text">{{ answer.text }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="results__panel results__panel--access">
      <h2 class="results__title">
        {{ view === 'parent' ? 'Результат для родителя' : 'Профессиональный результат' }}
      </h2>
      <p class="results__text">
        Введите код {{ view === 'parent' ? 'родителя' : 'психолога' }} - 6 цифр.
      </p>
      <form class="access" @submit.prevent="submitCode">
        <div
          class="access__cells"
          :class="{ 'access__cells--error': codeError, 'access__cells--shake': shake }"
        >
          <input
            v-for="(digit, index) in codeDigits"
            :key="index"
            :ref="(el) => setCellRef(el, index)"
            :value="digit"
            class="access__cell"
            type="text"
            inputmode="numeric"
            maxlength="1"
            autocomplete="one-time-code"
            :aria-label="`Цифра ${index + 1}`"
            @input="onDigitInput($event, index)"
            @keydown="onKeydown($event, index)"
            @focus="$event.target.select()"
            @paste="onPaste"
          >
        </div>
        <button class="access__submit" type="submit" :disabled="!codeComplete">Открыть</button>
        <p class="access__error" role="alert" aria-live="polite">{{ codeError }}</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.results__tabs {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  flex-wrap: wrap;
}

.results__tab {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.results__tab--active {
  border-color: var(--color-primary);
  font-weight: var(--fw-bold);
}

.results__tab--locked {
  color: var(--color-text-muted);
}

.results__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  width: min(100%, 48rem);
  margin-inline: auto;
  padding: var(--space-4);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
}

.results__panel--access {
  justify-content: center;
  align-items: center;
  text-align: center;
}

.access {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 24rem;
}

.access__cells {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.access__cell {
  width: clamp(2.5rem, 12vw, 3.25rem);
  height: clamp(3rem, 14vw, 3.75rem);
  padding: 0;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  text-align: center;
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  caret-color: var(--color-primary);
  transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease), background-color var(--dur-fast) var(--ease);
}

.access__cell:focus {
  border-color: var(--color-primary);
  background-color: var(--color-surface);
  box-shadow: 0 0 0 3px rgb(75 132 209 / 0.18);
}

.access__cells--error .access__cell {
  border-color: var(--color-negative);
}

.access__cells--shake {
  animation: cells-shake 0.4s var(--ease);
}

@keyframes cells-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

.access__submit {
  padding: var(--space-2) var(--space-5);
  font-size: var(--fs-base);
  font-weight: var(--fw-bold);
  color: var(--color-surface);
  background-color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.access__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.access__error {
  min-height: 1.4em;
  font-size: var(--fs-sm);
  line-height: 1.4;
  color: var(--color-negative);
}

.results__title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
}

.results__text {
  font-size: var(--fs-md);
  line-height: var(--lh-snug);
}

.results__members {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.member {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.member__head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: baseline;
}

.member__name {
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
}

.member__ratio {
  font-weight: var(--fw-bold);
}

.member__line {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.member__blocks {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--fs-sm);
}

.member__block {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-3);
  padding-block: var(--space-1);
  border-bottom: 1px solid var(--color-border);
}

.member__block:last-child {
  border-bottom: none;
}

.member__block-name {
  color: var(--color-text-muted);
}

.member__block-value {
  flex: 0 0 auto;
  font-weight: var(--fw-bold);
  white-space: nowrap;
}

.member__block--positive .member__block-name,
.member__block--positive .member__block-value {
  color: var(--color-positive);
}

.member__block--negative .member__block-name,
.member__block--negative .member__block-value {
  color: var(--color-negative);
}

.results__subtitle {
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
}

.answers__wrap {
  width: 100%;
  overflow-x: auto;
}

.answers {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-sm);
}

.answers th,
.answers td {
  padding: var(--space-2) var(--space-2) var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: top;
}

.answers th {
  font-weight: var(--fw-bold);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.answers__num {
  width: 1%;
  white-space: nowrap;
  font-weight: var(--fw-bold);
}

.answers__target {
  width: 1%;
  white-space: nowrap;
  font-weight: var(--fw-bold);
}

.answers__text {
  color: var(--color-text-muted);
}
</style>
