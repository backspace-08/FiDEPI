<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import PsychologistGreeting from './components/PsychologistGreeting.vue'
import MailDemo from './components/MailDemo.vue'
import CharacterAvatar from './components/CharacterAvatar.vue'
import AvatarEditor from './components/AvatarEditor.vue'
import FamilyBuilder from './components/FamilyBuilder.vue'
import StrangerIntro from './components/StrangerIntro.vue'
import MailboxesScene from './components/MailboxesScene.vue'
import FinishScene from './components/FinishScene.vue'
import ResultsScene from './components/ResultsScene.vue'
import VoiceToggleButton from './components/VoiceToggleButton.vue'
import { avatars, cropFor } from './avatars.js'
import { DEMO_ANSWERS, DEMO_MEMBERS } from './data/preview.js'
import { PHRASES } from './data/phrases.js'
import { playAudio, stopAudio } from './lib/audio.js'

const editorMode = new URLSearchParams(window.location.search).has('editor')
const previewResults = new URLSearchParams(window.location.search).has('preview-results')
const psychologist = avatars.find((a) => a.id === 'psychologist')
const psychologistCrop = cropFor('psychologist')

const scenes = [
  { id: 'greeting', type: 'greeting', text: PHRASES.greeting, audio: 'psych-greeting.ogg' },
  {
    id: 'here',
    type: 'message',
    text: PHRASES.here,
    audio: 'psych-here.ogg',
  },
  {
    id: 'mail1',
    type: 'message',
    text: PHRASES.mail1,
    audio: 'psych-mail1.ogg',
  },
  {
    id: 'mail2',
    type: 'message',
    text: PHRASES.mail2,
    audio: 'psych-mail2.ogg',
    demo: true,
  },
  {
    id: 'create-family',
    type: 'message',
    text: PHRASES.createFamily,
    audio: 'psych-createFamily.ogg',
    actionLabel: 'Создать мою семью',
  },
  { id: 'family', type: 'family' },
  {
    id: 'stranger',
    type: 'stranger',
    text: PHRASES.stranger,
    audio: 'psych-stranger.ogg',
  },
  { id: 'mailboxes', type: 'mailboxes', text: PHRASES.mailboxes, audio: 'psych-mailboxes.ogg' },
  {
    id: 'bag',
    type: 'bag',
    text: PHRASES.bag,
    audio: 'psych-bag.ogg',
    actionLabel: 'Достать письмо',
    actionInline: true,
  },
  {
    id: 'finish',
    type: 'finish',
    text: PHRASES.finish,
    audio: 'psych-finish.ogg',
    actionLabel: 'Посмотреть результат',
  },
  {
    id: 'result',
    type: 'result',
  },
]

const index = ref(0)
const scene = computed(() => scenes[index.value])
const isCorner = computed(() => index.value >= 1 && scene.value.type !== 'finish')

const say = ref('')
const answers = ref([])
const completed = ref(false)
const drawSignal = ref(0)
const letterActive = ref(false)
const resultAudio = ref(null)
const voiceEnabled = ref(false)

function toggleVoice() {
  voiceEnabled.value = !voiceEnabled.value
  if (!voiceEnabled.value) {
    stopAudio()
    return
  }
  if (scene.value.type === 'result') {
    if (resultAudio.value) playAudio(resultAudio.value.audio, resultAudio.value.text)
    return
  }
  if (letterActive.value) return
  if (scene.value.audio) playAudio(scene.value.audio, scene.value.text || '')
}

watch(index, () => {
  if (!voiceEnabled.value) return
  if (scene.value.type === 'result') return
  if (scene.value.audio) playAudio(scene.value.audio, scene.value.text || '')
})

watch(resultAudio, (payload) => {
  if (!voiceEnabled.value) return
  if (payload) playAudio(payload.audio, payload.text)
  else stopAudio()
})

const topRef = ref(null)
const topZone = ref(0)
let topObserver
function measureTop() {
  if (topRef.value) topZone.value = topRef.value.offsetHeight
}
function observeTop() {
  topObserver?.disconnect()
  const el = topRef.value
  if (!el) return
  topZone.value = el.offsetHeight
  topObserver = new ResizeObserver(measureTop)
  topObserver.observe(el)
}
watch(isCorner, async (value) => {
  if (!value) return
  await nextTick()
  observeTop()
})
onBeforeUnmount(() => topObserver?.disconnect())

function next() {
  say.value = ''
  letterActive.value = false
  if (scene.value.type === 'family') {
    answers.value = []
    completed.value = false
  }
  if (index.value < scenes.length - 1) index.value += 1
}

function back() {
  say.value = ''
  letterActive.value = false
  if (index.value > 0) index.value -= 1
}

const nextDisabled = computed(
  () => !!scene.value.actionLabel || scene.value.type === 'family' || scene.value.type === 'result',
)
const backDisabled = computed(
  () => index.value === 0 || ['bag', 'mailboxes', 'finish', 'result'].includes(scene.value.type),
)

function drawLetter() {
  drawSignal.value += 1
}
function onAnswered(answer) {
  answers.value.push(answer)
}
let finishTimer
function onComplete() {
  completed.value = true
  clearTimeout(finishTimer)
  finishTimer = setTimeout(() => {
    if (scene.value.type === 'bag') next()
  }, 1200)
}
function onResultAudio(payload) {
  resultAudio.value = payload
}
onBeforeUnmount(() => clearTimeout(finishTimer))

const hint = ref('')
let hintTimer
function onHint(text) {
  hint.value = text
  clearTimeout(hintTimer)
  hintTimer = setTimeout(() => (hint.value = ''), 3000)
}
</script>

<template>
  <AvatarEditor v-if="editorMode" />
  <main v-else-if="previewResults" class="page">
    <section class="preview">
      <ResultsScene :answers="DEMO_ANSWERS" :members="DEMO_MEMBERS" initial-view="psychologist" />
    </section>
  </main>
  <main v-else class="page">
    <PsychologistGreeting v-if="scene.type === 'greeting'" />
    <FinishScene v-else-if="scene.type === 'finish'" :text="scene.text" />

    <section
      v-if="isCorner"
      class="corner"
      :class="{ 'corner--bag': scene.type === 'bag' }"
      :style="scene.demo && topZone ? { paddingTop: `calc(var(--space-4) + ${topZone}px + var(--space-3))` } : null"
    >
      <div ref="topRef" class="corner__top">
        <p v-if="scene.text || say" :key="say || scene.id" class="corner__message" :style="{ animationDelay: scene.id === 'here' ? '0.4s' : '0s' }">{{ say || scene.text }}</p>
        <CharacterAvatar
          class="corner__psych"
          :src="psychologist.src"
          :crop="psychologistCrop"
          alt="Психолог"
          size="var(--psych-size)"
        />
      </div>
      <MailDemo v-if="scene.demo" />
      <FamilyBuilder v-else-if="scene.type === 'family'" @hint="onHint" @start="next" @say="say = $event" />
      <StrangerIntro v-else-if="scene.type === 'stranger'" />
      <MailboxesScene
        v-else-if="scene.type === 'mailboxes' || scene.type === 'bag'"
        :bag="scene.type === 'bag'"
        :draw-signal="drawSignal"
        :back-disabled="backDisabled"
        :next-disabled="nextDisabled"
        :voice-enabled="voiceEnabled"
        @say="say = $event"
        @letter-active="letterActive = $event"
        @answered="onAnswered"
        @complete="onComplete"
        @back="back"
        @next="next"
        @toggle-voice="toggleVoice"
      />
      <ResultsScene v-else-if="scene.type === 'result'" :answers="answers" @audio-context="onResultAudio" />

      <p v-if="hint" class="corner__hint">{{ hint }}</p>
    </section>

    <footer class="actions" :class="{ 'actions--bag': scene.type === 'bag' }">
      <div class="actions__group" :class="{ 'actions__group--row': scene.actionInline }">
        <button v-if="scene.actionLabel && !scene.actionInline" class="action-button" :class="{ 'action-button--primary': scene.type === 'finish' }" type="button" @click="next">{{ scene.actionLabel }}</button>
        <button
          v-if="scene.actionInline"
          class="action-button actions__action"
          :class="{ 'action-button--ghost': letterActive }"
          type="button"
          :disabled="letterActive || completed"
          @click="drawLetter"
        >{{ scene.actionLabel }}</button>
        <div v-if="scene.type !== 'finish'" class="actions__nav">
          <button class="action-button" :class="{ 'action-button--ghost': backDisabled }" type="button" :disabled="backDisabled" @click="back">Назад</button>
          <VoiceToggleButton :enabled="voiceEnabled" @toggle="toggleVoice" />
          <button class="action-button" :class="{ 'action-button--ghost': nextDisabled }" type="button" :disabled="nextDisabled" @click="next">Далее</button>
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100svh;
  overflow: hidden;
  background-color: var(--color-bg);
}

.preview {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: var(--space-4);
}

.corner {
  --psych-size: clamp(50px, 20vw, 150px);
  --bag-size: clamp(120px, 24vw, 230px);
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: calc( max(var(--psych-size), 8rem) + var(--space-2)) var(--space-4) var(--space-4);
}

.corner__hint {
  position: fixed;
  bottom: 5rem;
  left: 0;
  right: 0;
  z-index: 60;
  width: fit-content;
  margin-inline: auto;
  max-width: min(90vw, 26rem);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-sm);
  line-height: var(--lh-snug);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  pointer-events: none;
  animation: bubble-in 0.3s var(--ease) both;
}

.corner__top {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  left: var(--space-4);
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: var(--space-4);
  pointer-events: none;
}

.corner__psych {
  flex: 0 0 auto;
  pointer-events: auto;
  animation: rise-in 0.5s var(--ease) both;
}

.corner__message {
  position: relative;
  flex: 0 1 auto;
  max-width: 46rem;
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-sm);
  line-height: var(--lh-snug);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  min-height: 3rem;
  animation: bubble-in 0.5s var(--ease) both;
}


.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-4);
}

.actions__group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.actions__group--row {
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  gap: var(--space-3);
}

.actions__nav {
  display: flex;
  gap: var(--space-3);
}

.actions--bag .actions__nav {
  animation: nav-in 0.45s var(--ease) both;
}

.actions__action {
  animation: slide-in-left 0.4s var(--ease) 0.1s both;
}

@keyframes nav-in {
  from {
    transform: translateX(-30vw);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.action-button {
  animation: rise-in 0.5s var(--ease) 0.6s both;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.action-button--ghost {
  background-color: transparent;
  color: var(--color-text-muted);
  border-color: transparent;
}

.action-button--primary {
  color: var(--color-surface);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bubble-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (min-width: 1024px) {
  .actions--bag {
    display: none;
  }

  .corner--bag {
    padding-bottom: var(--space-7);
  }
}
</style>
