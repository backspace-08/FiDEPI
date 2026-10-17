<script setup>
import letterIcon from '../../svg/normalized/props/letter.svg'
import IconVolume from './IconVolume.vue'
import IconClose from './IconClose.vue'

defineProps({
  text: { type: String, required: true },
})

defineEmits(['listen', 'close'])
</script>

<template>
  <div class="letter-card">
    <button class="letter-card__close" type="button" aria-label="Закрыть" @click="$emit('close')">
      <IconClose />
    </button>
    <div class="letter-card__head">
      <img class="letter-card__icon" :src="letterIcon" alt="">
      <span class="letter-card__title">Письмо</span>
    </div>
    <p class="letter-card__text">«{{ text }}»</p>
    <button class="letter-card__listen" type="button" @click="$emit('listen')">
      <IconVolume />
      <span>Послушать</span>
    </button>
  </div>
</template>

<style scoped>
.letter-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: min(90vw, 30rem);
  padding: var(--space-5) var(--space-6);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25);
  animation: card-in 0.3s var(--ease) both;
}

.letter-card__close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-text-muted);
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.letter-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.letter-card__icon {
  height: 1.75rem;
  width: auto;
}

.letter-card__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-black);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.letter-card__text {
  font-size: var(--fs-lg);
  line-height: var(--lh-snug);
  text-align: center;
  text-wrap: balance;
}

.letter-card__listen {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--fs-base);
  font-weight: var(--fw-bold);
  color: var(--color-text);
  background-color: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
