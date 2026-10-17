<script setup>
import stranger from '../../svg/normalized/special_out/stranger.svg'
import mailbox from '../../svg/normalized/props/mailbox.svg'
</script>

<template>
  <section class="stranger">
    <div class="stranger__row">
      <figure class="stranger__member">
        <img class="stranger__figure" :src="stranger" alt="Незнакомец">
        <figcaption class="stranger__name">Незнакомец</figcaption>
      </figure>
      <img class="stranger__mailbox" :src="mailbox" alt="Почтовый ящик Незнакомца">
    </div>
  </section>
</template>

<style scoped>
.stranger {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.stranger__row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-5);
}

.stranger__member {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
}

.stranger__figure {
  height: clamp(170px, 34vh, 320px);
  width: auto;
  animation: pop-in 0.5s var(--ease) both;
}

.stranger__name {
  position: absolute;
  top: 100%;
  margin-top: var(--space-2);
  white-space: nowrap;
  font-weight: var(--fw-bold);
  color: var(--color-text-muted);
  animation: pop-in 0.4s var(--ease) 0.15s both;
}

.stranger__mailbox {
  height: clamp(80px, 16vh, 150px);
  width: auto;
  animation: pop-in 0.5s var(--ease) 0.7s both;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
