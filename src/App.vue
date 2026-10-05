<script setup>
import { computed, ref } from 'vue'
import PsychologistGreeting from './components/PsychologistGreeting.vue'
import AvatarGallery from './components/AvatarGallery.vue'
import CharacterAvatar from './components/CharacterAvatar.vue'
import AvatarEditor from './components/AvatarEditor.vue'
import CharacterEditor from './components/CharacterEditor.vue'
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
    id: 'mail',
    type: 'message',
    text: 'Сегодня мы с тобой будем играть в почту. В этой игре ты будешь почтальоном, твоя задача разносить письма близким для тебя людям. После создания семьи тебе будут приходить разные письма. Твоя задача — прочитать каждое письмо и решить, кому оно подходит больше всего. После этого ты отправишь письмо в почтовый ящик этого человека. Здесь нет правильных или неправильных ответов. Чтобы получить верные данные, просто выбирай того, кому письмо подходит больше всего.',
  },
  { id: 'demo', type: 'demo' },
  {
    id: 'create-family',
    type: 'message',
    text: 'Но сначала нам нужно подготовить твою игру. Создай всех людей, которые живут вместе с тобой в одном доме. Не переживай, если твоя семья отличается от других. У каждой семьи всё может быть по-разному.',
    actionLabel: 'Создать мою семью',
  },
  {
    id: 'editor',
    type: 'editor',
    text: 'Создай первого человека, который живёт вместе с тобой. Введи имя, выбери пол и настрой внешность.',
  },
]

const index = ref(0)
const scene = computed(() => scenes[index.value])
const isCorner = computed(() => index.value >= 1)

function next() {
  if (index.value < scenes.length - 1) index.value += 1
}

function back() {
  if (index.value > 0) index.value -= 1
}

const editorReady = ref(false)
const nextDisabled = computed(() => !!scene.value.actionLabel)
const nextGhost = computed(
  () => nextDisabled.value || (scene.value.type === 'editor' && !editorReady.value),
)

function onNext() {
  if (scene.value.type === 'editor' && !editorReady.value) {
    onHint('Сначала напиши имя и выбери внешность')
    return
  }
  next()
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
        <p v-if="scene.text" :key="scene.id" class="corner__message" :style="{ animationDelay: scene.id === 'here' ? '0.4s' : '0s' }">{{ scene.text }}</p>
        <CharacterAvatar
          class="corner__psych"
          :src="psychologist.src"
          :crop="psychologistCrop"
          alt="Психолог"
          size="var(--psych-size)"
        />
      </div>
      <AvatarGallery v-if="scene.type === 'demo'" />
      <CharacterEditor v-else-if="scene.type === 'editor'" @hint="onHint" @ready="editorReady = $event" />

      <p v-if="hint" class="corner__hint">{{ hint }}</p>
    </section>

    <footer class="actions">
      <button v-if="scene.actionLabel" class="action-button" type="button" @click="next">{{ scene.actionLabel }}</button>
      <div class="actions__row">
        <button class="action-button" :class="{ 'action-button--ghost': index === 0 }" type="button" :disabled="index === 0" @click="back">Назад</button>
        <button class="action-button" :class="{ 'action-button--ghost': nextGhost }" type="button" :disabled="nextDisabled" @click="onNext">Далее</button>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background-color: var(--color-bg);
}

.corner {
  --psych-size: clamp(50px, 20vw, 150px);
  position: relative;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-4);
}

.corner__hint {
  position: fixed;
  bottom: 5rem;
  left: 0;
  right: 0;
  z-index: 20;
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
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: var(--space-4);
}

.corner__psych {
  flex: 0 0 auto;
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
  gap: var(--space-4);
  padding: var(--space-4);
}

.actions__row {
  display: flex;
  gap: var(--space-3);
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
