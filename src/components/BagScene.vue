<script setup>
import bag from '../../svg/normalized/props/bag.svg'
</script>

<template>
  <div class="bag">
    <img class="bag__image" :src="bag" alt="">
    <span class="bag__label">Письма</span>
  </div>
</template>

<style scoped>
.bag {
  display: grid;
  place-items: center;
  pointer-events: none;
  animation: rise 0.5s var(--ease) 0.15s both;
}

.bag__image {
  height: var(--bag-size);
  width: auto;
}

.bag__label {
  position: absolute;
  top: 46%;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--color-text);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
