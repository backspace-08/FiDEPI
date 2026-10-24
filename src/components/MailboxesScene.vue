<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import BagScene from './BagScene.vue'
import LetterCard from './LetterCard.vue'
import { cropFor, cropForMember } from '../avatars.js'
import { pickQuestions } from '../data/questions.js'
import { PHRASES } from '../data/phrases.js'
import { playAudio } from '../lib/audio.js'
import VoiceToggleButton from './VoiceToggleButton.vue'
import stranger from '../../svg/normalized/special_out/stranger.svg'
import mailbox from '../../svg/normalized/props/mailbox.svg'
import letterIcon from '../../svg/normalized/props/letter.svg'

const props = defineProps({
  bag: { type: Boolean, default: false },
  drawSignal: { type: Number, default: 0 },
  backDisabled: { type: Boolean, default: false },
  nextDisabled: { type: Boolean, default: false },
  voiceEnabled: { type: Boolean, default: false },
})

const emit = defineEmits(['say', 'letter-active', 'answered', 'complete', 'back', 'next', 'toggle-voice'])

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// null — полный набор (65). Для быстрой отладки можно поставить 10.
const DEV_QUESTION_LIMIT = null
const queue = shuffle(pickQuestions(DEV_QUESTION_LIMIT))
const total = queue.length

function loadFamily() {
  try {
    const data = JSON.parse(localStorage.getItem('fidepi-family') || 'null')
    if (Array.isArray(data) && data.length) return data
  } catch {}
  return []
}

const rows = computed(() => [
  ...loadFamily().map((m) => ({
    id: m.id,
    name: m.name || 'Без имени',
    figure: m,
    crop: cropForMember(m),
  })),
  { id: 'stranger', name: 'Незнакомец', src: stranger, crop: cropFor('stranger') },
])

const delivered = ref(0)
const done = ref(false)

const showCounter = ref(false)
let counterTimer
let doneTimer
watch(
  () => props.bag,
  (bag) => {
    clearTimeout(counterTimer)
    showCounter.value = false
    if (bag) counterTimer = setTimeout(() => (showCounter.value = true), 800)
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  clearTimeout(counterTimer)
  clearTimeout(doneTimer)
})

const bagRef = ref(null)
const slotRef = ref(null)
const slotLetterRef = ref(null)
const flyerRef = ref(null)

const flying = ref(false)
const letterInSlot = ref(false)
const reading = ref(false)
const sending = ref(false)
const currentLetter = ref(null)
const currentQuestion = ref(null)

const busy = computed(
  () => flying.value || letterInSlot.value || reading.value || sending.value,
)
watch(busy, (value) => emit('letter-active', value))

function center(el) {
  const r = el?.getBoundingClientRect?.()
  if (!r) return null
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

async function flyBetween(from, to, { duration = 600, startScale = 0.4 } = {}) {
  if (!from || !to) return
  flying.value = true
  await nextTick()
  const flyer = flyerRef.value
  if (flyer) {
    const anim = flyer.animate(
      [
        {
          transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(${startScale}) rotate(-12deg)`,
          opacity: 0.9,
        },
        {
          transform: `translate(${(from.x + to.x) / 2}px, ${Math.min(from.y, to.y) - 60}px) translate(-50%, -50%) scale(${Math.max(startScale, 0.8)}) rotate(0deg)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(1) rotate(0deg)`,
          opacity: 1,
        },
      ],
      { duration, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
    )
    try {
      await anim.finished
    } catch {}
  }
  flying.value = false
}

const screenCenter = () => ({ x: innerWidth / 2, y: innerHeight / 2 })

async function drawLetter() {
  if (busy.value) return
  const question = queue[delivered.value]
  if (!question) return

  const from = center(bagRef.value?.$el)
  const to = screenCenter()
  await flyBetween(from, to, { duration: 600, startScale: 0.4 })

  currentQuestion.value = question
  currentLetter.value = question.text
  reading.value = true
  playQuestion(question)
  emit('say', PHRASES.readLetter)
}

function openLetter() {
  if (!letterInSlot.value) return
  letterInSlot.value = false
  reading.value = true
  playQuestion(currentQuestion.value)
}

function playQuestion(question) {
  if (!props.voiceEnabled || !question) return
  playAudio(`q-${question.n}.ogg`, question.text)
}

function playCurrentLetter() {
  const question = currentQuestion.value
  if (!question) return
  playAudio(`q-${question.n}.ogg`, question.text)
}

watch(
  () => props.voiceEnabled,
  (enabled) => {
    if (enabled && reading.value) playQuestion(currentQuestion.value)
  },
)

async function closeLetter() {
  if (!reading.value) return
  reading.value = false
  const from = screenCenter()
  const to = center(slotRef.value)
  await flyBetween(from, to, { duration: 450, startScale: 0.6 })
  letterInSlot.value = true
  emit('say', PHRASES.chooseMember)
}

async function deliverTo(event, memberId) {
  if (!letterInSlot.value || reading.value || sending.value) return
  const row = event.currentTarget
  const target = row?.querySelector?.('.row__mailbox')
  const letterEl = slotLetterRef.value
  if (!target || !letterEl) return

  const lr = letterEl.getBoundingClientRect()
  const tr = target.getBoundingClientRect()
  const dx = tr.left + tr.width / 2 - (lr.left + lr.width / 2)
  const dy = tr.top + tr.height / 2 - (lr.top + lr.height / 2)

  sending.value = true
  const anim = letterEl.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.5 },
    ],
    { duration: 420, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
  )
  try {
    await anim.finished
  } catch {}

  const question = currentQuestion.value
  letterInSlot.value = false
  currentQuestion.value = null
  currentLetter.value = null
  sending.value = false
  delivered.value += 1
  if (question) emit('answered', { n: question.n, memberId })
  if (delivered.value === total) {
    emit('complete')
    doneTimer = setTimeout(() => (done.value = true), 500)
  }
}

watch(
  () => props.drawSignal,
  (value) => {
    if (value > 0) drawLetter()
  },
)
</script>

<template>
  <section class="mailboxes" :class="{ 'mailboxes--done': done, 'mailboxes--bag': bag }">
    <div class="mailboxes__counter" :class="{ 'mailboxes__counter--visible': showCounter }">
      Писем доставлено: {{ delivered }} из {{ total }}
    </div>

    <div class="mailboxes__list">
      <div
        v-for="(row, i) in rows"
        :key="row.id"
        class="row"
        :class="{ 'row--target': letterInSlot && !reading }"
        :style="{ animationDelay: `${i * 0.1}s` }"
        @click="deliverTo($event, row.id)"
      >
        <CharacterAvatar
          class="row__avatar"
          :src="row.src"
          :figure="row.figure"
          :crop="row.crop"
          shape="rounded"
          size="clamp(3.25rem, 11vw, 5rem)"
        />
        <span class="row__name">{{ row.name }}</span>
        <img class="row__mailbox" :src="mailbox" alt="">
      </div>
    </div>

    <div v-if="bag" class="mailboxes__bottom">
      <div class="mailboxes__bag">
        <BagScene ref="bagRef" />
        <button
          class="mailboxes__draw"
          type="button"
          :disabled="busy || delivered >= total"
          @click="drawLetter"
        >Достать письмо</button>
      </div>
      <div class="mailboxes__side">
        <div ref="slotRef" class="mailboxes__slot">
          <button
            v-if="letterInSlot"
            ref="slotLetterRef"
            class="mailboxes__slot-letter"
            type="button"
            aria-label="Прочитать письмо"
            @click="openLetter"
          >
            <img :src="letterIcon" alt="">
          </button>
        </div>
        <div class="mailboxes__nav">
          <button
            class="mailboxes__nav-btn"
            type="button"
            :disabled="backDisabled"
            @click="emit('back')"
          >Назад</button>
          <VoiceToggleButton :enabled="voiceEnabled" @toggle="emit('toggle-voice')" />
          <button
            class="mailboxes__nav-btn"
            type="button"
            :disabled="nextDisabled"
            @click="emit('next')"
          >Далее</button>
        </div>
      </div>
    </div>

    <img v-if="flying" ref="flyerRef" class="mailboxes__flyer" :src="letterIcon" alt="">

    <div v-if="reading" class="mailboxes__letter" @click.self="closeLetter">
      <LetterCard :text="currentLetter" @listen="playCurrentLetter" @close="closeLetter" />
    </div>
  </section>
</template>

<style scoped>
.mailboxes {
  --letter-size: clamp(4rem, 12vw, 6rem);
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.mailboxes--done .mailboxes__counter,
.mailboxes--done .mailboxes__list,
.mailboxes--done .mailboxes__bottom,
.mailboxes--done .mailboxes__bag,
.mailboxes--done .mailboxes__side {
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
}

.mailboxes__counter {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--color-text);
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
  transition: opacity 0.45s var(--ease), transform 0.45s var(--ease);
}

.mailboxes__counter--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.mailboxes__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: min(100%, 24rem);
  padding: var(--space-1) var(--space-2);
  animation: slide-in 0.4s var(--ease) both;
}

.row--target {
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color var(--dur-fast) var(--ease);
}

.row--target:hover {
  background-color: var(--color-surface);
}

.row__name {
  flex: 1;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__mailbox {
  flex: 0 0 auto;
  height: clamp(2.25rem, 8vw, 3.25rem);
  width: auto;
}

.mailboxes__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
}

.mailboxes__bag,
.mailboxes__side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.mailboxes__draw,
.mailboxes__nav {
  display: none;
}

.mailboxes__nav {
  gap: var(--space-2);
}

.mailboxes__draw,
.mailboxes__nav-btn {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.mailboxes__draw:disabled,
.mailboxes__nav-btn:disabled {
  color: var(--color-text-muted);
  background-color: transparent;
  border-color: transparent;
  cursor: default;
}

.mailboxes__slot {
  width: var(--letter-size);
  height: var(--letter-size);
  display: grid;
  place-items: center;
}

.mailboxes__slot-letter {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: var(--space-2);
  background-color: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  animation: letter-ready 1.6s var(--ease) infinite;
}

.mailboxes__slot-letter img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.mailboxes__flyer {
  position: fixed;
  left: 0;
  top: 0;
  height: var(--letter-size);
  width: auto;
  z-index: 40;
  pointer-events: none;
  will-change: transform;
}

.mailboxes__letter {
  position: fixed;
  inset: 0;
  z-index: 45;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background-color: rgb(0 0 0 / 0.25);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes letter-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes letter-ready {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgb(75 132 209 / 0.45), 0 8px 20px rgb(0 0 0 / 0.15);
  }
  70% {
    transform: scale(1.04);
    box-shadow: 0 0 0 10px rgb(75 132 209 / 0), 0 8px 20px rgb(0 0 0 / 0.15);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgb(75 132 209 / 0), 0 8px 20px rgb(0 0 0 / 0.15);
  }
}

@media (min-width: 1024px) {
  .mailboxes--bag {
    display: grid;
    grid-template-columns: minmax(9rem, 15rem) minmax(0, 1fr) minmax(9rem, 15rem);
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      "counter counter counter"
      "bag list side";
    align-items: end;
    justify-items: center;
    column-gap: var(--space-5);
    row-gap: var(--space-4);
  }

  .mailboxes--bag .mailboxes__counter {
    grid-area: counter;
  }

  .mailboxes--bag .mailboxes__list {
    grid-area: list;
    align-self: stretch;
    width: 100%;
    max-width: 34rem;
    min-height: 0;
    max-height: 100%;
  }

  .mailboxes--bag .mailboxes__bottom {
    display: contents;
  }

  .mailboxes--bag .mailboxes__bag {
    grid-area: bag;
  }

  .mailboxes--bag .mailboxes__side {
    grid-area: side;
  }

  .mailboxes--bag .mailboxes__draw {
    display: block;
  }

  .mailboxes--bag .mailboxes__nav {
    display: flex;
  }

  .row {
    width: min(100%, 28rem);
  }
}
</style>
