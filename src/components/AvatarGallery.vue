<script setup>
import { avatars, cropFor } from '../avatars.js'
import CharacterAvatar from './CharacterAvatar.vue'
</script>

<template>
  <div class="gallery">
    <figure v-for="a in avatars" :key="a.id" class="gallery__item">
      <CharacterAvatar :src="a.src" :figure="a.figure" :crop="cropFor(a.id)" size="5rem" :alt="a.label" />
      <figcaption class="gallery__label">{{ a.label }}</figcaption>
    </figure>
  </div>
</template>

<style scoped>
.gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 20rem;
  margin-inline: auto;
}

.gallery__item {
  flex: 0 0 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
}

.gallery__label {
  max-width: 7rem;
  font-size: var(--fs-xs);
  line-height: var(--lh-tight);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
