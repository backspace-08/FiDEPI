<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import BagScene from './BagScene.vue'
import LetterCard from './LetterCard.vue'
import { cropFor, cropForMember } from '../avatars.js'
import stranger from '../../svg/normalized/special_out/stranger.svg'
import mailbox from '../../svg/normalized/props/mailbox.svg'
import letterIcon from '../../svg/normalized/props/letter.svg'

const props = defineProps({
  bag: { type: Boolean, default: false },
  drawSignal: { type: Number, default: 0 },
})

const emit = defineEmits(['say', 'letter-active'])

const QUESTIONS = [
  'Этот член семьи очень хороший.',
  'Этот член семьи очень весёлый.',
  'Этот член семьи всегда помогает другим.',
  'С этим членом семьи хорошо играть.',
  'Этот член семьи очень добрый.',
  'Этот член семьи заслуживает хорошего подарка.',
  'Мне нравится обнимать этого члена семьи.',
  'Этот член семьи иногда придирается.',
  'Этот член семьи очень меня любит.',
  'Этот член семьи всегда выслушает меня.',
]

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

const showCounter = ref(false)
let counterTimer
watch(
  () => props.bag,
  (bag) => {
    clearTimeout(counterTimer)
    showCounter.value = false
    if (bag) counterTimer = setTimeout(() => (showCounter.value = true), 800)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(counterTimer))

const bagRef = ref(null)
const slotRef = ref(null)
const slotLetterRef = ref(null)
const flyerRef = ref(null)

const flying = ref(false)
const letterInSlot = ref(false)
const reading = ref(false)
const sending = ref(false)
const currentLetter = ref(null)
let questionIndex = 0

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
  const question = QUESTIONS[questionIndex % QUESTIONS.length]
  questionIndex += 1

  const from = center(bagRef.value?.$el)
  const to = screenCenter()
  await flyBetween(from, to, { duration: 600, startScale: 0.4 })

  currentLetter.value = question
  reading.value = true
  emit('say', 'Прочитай письмо и реши, кому его отправить.')
}

function openLetter() {
  if (!letterInSlot.value) return
  letterInSlot.value = false
  reading.value = true
}

async function closeLetter() {
  if (!reading.value) return
  reading.value = false
  const from = screenCenter()
  const to = center(slotRef.value)
  await flyBetween(from, to, { duration: 450, startScale: 0.6 })
  letterInSlot.value = true
  emit('say', 'Нажми на того, кому хочешь отправить письмо.')
}

async function deliverTo(event) {
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

  letterInSlot.value = false
  currentLetter.value = null
  sending.value = false
  delivered.value += 1
}

watch(
  () => props.drawSignal,
  (value) => {
    if (value > 0) drawLetter()
  },
)
</script>

<template>
  <section class="mailboxes">
    <div class="mailboxes__counter" :class="{ 'mailboxes__counter--visible': showCounter }">
      Писем доставлено: {{ delivered }} из 50
    </div>

    <div class="mailboxes__list">
      <div
        v-for="(row, i) in rows"
        :key="row.id"
        class="row"
        :class="{ 'row--target': letterInSlot && !reading }"
        :style="{ animationDelay: `${i * 0.1}s` }"
        @click="deliverTo"
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
      <BagScene ref="bagRef" />
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
    </div>

    <img v-if="flying" ref="flyerRef" class="mailboxes__flyer" :src="letterIcon" alt="">

    <div v-if="reading" class="mailboxes__letter" @click.self="closeLetter">
      <LetterCard :text="currentLetter" @listen="() => {}" @close="closeLetter" />
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
</style>
