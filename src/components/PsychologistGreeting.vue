<script setup>
import psychImage from '../../svg/normalized/special_out/psych.svg'
</script>

<template>
  <section class="stage">
    <div class="psychologist">
      <p class="psychologist__message">Привет! Я рада тебя видеть. Добро пожаловать в FiDEPI — инновационный проект, который помогает понимать эмоциональное состояние и отношения людей. Сегодня тебе предстоит небольшая игра. После её прохождения ты сможешь узнать кое-что новое о себе. Я буду рядом с тобой на протяжении всей игры и помогу тебе, если что-то будет непонятно.</p>
      <img class="psychologist__image" :src="psychImage" alt="Психолог" width="160" height="388">
    </div>
  </section>
</template>

<style scoped>
.stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.psychologist {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 40rem;
}

.psychologist__message {
  position: relative;
  width: 100%;
  animation: bubble-in 0.5s var(--ease) 0.1s both;
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-sm);
  line-height: var(--lh-snug);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.psychologist__message::before {
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

.psychologist__image {
  height: clamp(200px, 42vh, 380px);
  width: auto;
  animation: rise-in 0.55s var(--ease) 0.35s both;
  margin-left: 1rem;
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
