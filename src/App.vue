<script setup>
import { computed, ref } from 'vue'
import PsychologistGreeting from './components/PsychologistGreeting.vue'
import MailDemo from './components/MailDemo.vue'
import CharacterAvatar from './components/CharacterAvatar.vue'
import AvatarEditor from './components/AvatarEditor.vue'
import FamilyBuilder from './components/FamilyBuilder.vue'
import StrangerIntro from './components/StrangerIntro.vue'
import MailboxesScene from './components/MailboxesScene.vue'
import { avatars, cropFor } from './avatars.js'

const editorMode = new URLSearchParams(window.location.search).has('editor')
const psychologist = avatars.find((a) => a.id === 'psychologist')
const psychologistCrop = cropFor('psychologist')

const scenes = [
  { id: 'greeting', type: 'greeting' },
  {
    id: 'here',
    type: 'message',
    text: 'А вот и я! Теперь ты всегда сможешь найти меня здесь, в правом верхнем углу. Если тебе станет непонятно, что делать, нажми на меня — я постараюсь помочь.',
  },
  {
    id: 'mail1',
    type: 'message',
    text: 'Сегодня мы с тобой будем играть в почту. В этой игре ты будешь почтальоном, твоя задача разносить письма близким для тебя людям. После создания семьи тебе будут приходить разные письма.',
  },
  {
    id: 'mail2',
    type: 'message',
    text: 'Твоя задача — прочитать каждое письмо и решить, кому оно подходит больше всего. После этого ты отправишь письмо в почтовый ящик этого человека. Здесь нет правильных или неправильных ответов. Чтобы получить верные данные, просто выбирай того, кому письмо подходит больше всего.',
    demo: true,
  },
  {
    id: 'create-family',
    type: 'message',
    text: 'Но сначала нам нужно подготовить твою игру. Создай всех людей, которые живут вместе с тобой в одном доме. Не переживай, если твоя семья отличается от других. У каждой семьи всё может быть по-разному.',
    actionLabel: 'Создать мою семью',
  },
  { id: 'family', type: 'family' },
  {
    id: 'stranger',
    type: 'stranger',
    text: 'А это — Незнакомец. Он не живёт с тобой и не относится к твоей семье. Иногда тебе будут попадаться письма, которые не подходят ни одному человеку из твоей семьи. В таком случае ты сможешь отправить письмо Незнакомцу.',
  },
  { id: 'mailboxes', type: 'mailboxes', text: 'У каждого персонажа появился свой почтовый ящик.' },
  {
    id: 'bag',
    type: 'bag',
    text: 'Вот и наша почта! В этом мешке находятся письма. Доставай их по одному, читай и отправляй тому человеку, которому они подходят больше всего.',
    actionLabel: 'Достать письмо',
    actionInline: true,
  },
]

const index = ref(0)
const scene = computed(() => scenes[index.value])
const isCorner = computed(() => index.value >= 1)

function next() {
  say.value = ''
  letterActive.value = false
  if (index.value < scenes.length - 1) index.value += 1
}

function back() {
  say.value = ''
  letterActive.value = false
  if (index.value > 0) index.value -= 1
}

const nextDisabled = computed(
  () => !!scene.value.actionLabel || scene.value.type === 'family',
)
const backDisabled = computed(
  () => index.value === 0 || scene.value.type === 'bag',
)

const say = ref('')
const drawSignal = ref(0)
const letterActive = ref(false)
function drawLetter() {
  drawSignal.value += 1
}

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
  <main v-else class="page">
    <PsychologistGreeting v-if="scene.type === 'greeting'" />

    <section v-if="isCorner" class="corner">
      <div class="corner__top">
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
        @say="say = $event"
        @letter-active="letterActive = $event"
      />

      <p v-if="hint" class="corner__hint">{{ hint }}</p>
    </section>

    <footer class="actions" :class="{ 'actions--bag': scene.type === 'bag' }">
      <div class="actions__group" :class="{ 'actions__group--row': scene.actionInline }">
        <button v-if="scene.actionLabel && !scene.actionInline" class="action-button" type="button" @click="next">{{ scene.actionLabel }}</button>
        <button
          v-if="scene.actionInline"
          class="action-button actions__action"
          :class="{ 'action-button--ghost': letterActive }"
          type="button"
          :disabled="letterActive"
          @click="drawLetter"
        >{{ scene.actionLabel }}</button>
        <div class="actions__nav">
          <button class="action-button" :class="{ 'action-button--ghost': backDisabled }" type="button" :disabled="backDisabled" @click="back">Назад</button>
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
</style>
