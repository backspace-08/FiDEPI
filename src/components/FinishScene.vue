<script setup>
import psychImage from '../../svg/normalized/special_out/psych.svg'
import AudioIconButton from './AudioIconButton.vue'

defineProps({
  text: { type: String, default: '' },
})

const COLORS = ['#4b84d1', '#e8a33d', '#e86a7a', '#6fbf8b', '#8a7bd8']

const confetti = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: Math.random() * 100,
  size: 5 + Math.random() * 7,
  delay: Math.random() * 4,
  duration: 3.5 + Math.random() * 3,
  drift: (Math.random() - 0.5) * 140,
  color: COLORS[index % COLORS.length],
  opacity: 0.45 + Math.random() * 0.4,
}))
</script>

<template>
  <section class="finish">
    <div class="finish__confetti" aria-hidden="true">
      <span
        v-for="piece in confetti"
        :key="piece.id"
        class="finish__piece"
        :style="{
          left: `${piece.left}%`,
          width: `${piece.size}px`,
          height: `${piece.size * 1.7}px`,
          backgroundColor: piece.color,
          opacity: piece.opacity,
          animationDelay: `${piece.delay}s`,
          animationDuration: `${piece.duration}s`,
          '--drift': `${piece.drift}px`,
        }"
      />
    </div>
    <div class="finish__inner">
      <p class="finish__message">{{ text }}</p>
      <AudioIconButton audio="psych-finish.ogg" :text="text" />
      <img class="finish__image" :src="psychImage" alt="Психолог" width="160" height="388">
    </div>
  </section>
</template>

<style scoped>
.finish {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  overflow: hidden;
}

.finish__confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.finish__piece {
  position: absolute;
  top: -12vh;
  border-radius: 1px;
  animation-name: confetti-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.finish__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 40rem;
}

.finish__message {
  position: relative;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-sm);
  line-height: var(--lh-snug);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: bubble-in 0.6s var(--ease) 0.15s both;
}

.finish__message::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -9px;
  width: 16px;
  height: 16px;
  background-color: var(--color-surface);
  border-right: 2px solid var(--color-border);
  border-bottom: 2px solid var(--color-border);
  transform: translateX(-50%) rotate(45deg);
}

.finish__image {
  height: clamp(200px, 42vh, 380px);
  width: auto;
  margin-left: 1rem;
  animation: rise-in 0.7s var(--ease) 0.35s both;
}

@keyframes confetti-fall {
  from {
    transform: translate3d(0, -12vh, 0) rotate(0deg);
  }
  to {
    transform: translate3d(var(--drift), 112vh, 0) rotate(720deg);
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
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
