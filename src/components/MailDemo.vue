<script setup>
import bag from '../../svg/normalized/props/bag.svg'
import letter from '../../svg/normalized/props/letter.svg'
import mailbox from '../../svg/normalized/props/mailbox.svg'
import CharacterAvatar from './CharacterAvatar.vue'
import IconChevron from './IconChevron.vue'
import { cropFor } from '../avatars.js'
</script>

<template>
  <div class="demo">
    <div class="demo__station" style="animation-delay: 0s">
      <img class="demo__icon" :src="bag" alt="">
    </div>
    <IconChevron class="demo__arrow" direction="right" />
    <div class="demo__station" style="animation-delay: 0.5s">
      <img class="demo__icon demo__icon--letter" :src="letter" alt="">
    </div>
    <IconChevron class="demo__arrow" direction="right" />
    <div class="demo__station" style="animation-delay: 1s">
      <CharacterAvatar :figure="{ gender: null }" :crop="cropFor('neutral')" shape="rounded" size="2.5rem" />
    </div>
    <IconChevron class="demo__arrow" direction="right" />
    <div class="demo__station" style="animation-delay: 1.5s">
      <img class="demo__icon" :src="mailbox" alt="">
    </div>
  </div>
</template>

<style scoped>
.demo {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding-bottom: var(--space-3);
}

.demo__station {
  display: grid;
  place-items: center;
  min-width: 3.5rem;
  min-height: 3.5rem;
  padding: var(--space-1);
  border-radius: var(--radius-md);
  animation: station-pulse 2.4s var(--ease) infinite;
}

.demo__icon {
  height: 2.5rem;
  width: auto;
}

.demo__icon--letter {
  height: 2rem;
}

.demo__arrow {
  color: var(--color-text-muted);
}

@keyframes station-pulse {
  0% {
    background-color: transparent;
    transform: scale(1);
  }
  12% {
    background-color: rgb(75 132 209 / 0.18);
    transform: scale(1.12);
  }
  32% {
    background-color: transparent;
    transform: scale(1);
  }
  100% {
    background-color: transparent;
    transform: scale(1);
  }
}
</style>
