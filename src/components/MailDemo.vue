<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import bag from '../../svg/normalized/props/bag.svg'
import letter from '../../svg/normalized/props/letter.svg'
import mailbox from '../../svg/normalized/props/mailbox.svg'
import CharacterAvatar from './CharacterAvatar.vue'
import { cropFor } from '../avatars.js'

const stageRef = ref(null)
const bagRef = ref(null)
const mailboxRef = ref(null)
const flyerRef = ref(null)

const count = ref(0)
const flying = ref(false)
let stopped = false

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function centerOf(el) {
  const stage = stageRef.value?.getBoundingClientRect()
  if (!el || !stage) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2 - stage.left, y: r.top + r.height / 2 - stage.top }
}

async function loop() {
  while (!stopped) {
    await wait(700)
    if (stopped) break

    const from = centerOf(bagRef.value)
    const to = centerOf(mailboxRef.value)
    if (!from || !to) continue

    flying.value = true
    await nextTick()
    const flyer = flyerRef.value
    if (flyer) {
      const anim = flyer.animate(
        [
          {
            transform: `translate(${from.x}px, ${from.y}px) translate(-50%, -50%) scale(0.7)`,
            opacity: 0,
          },
          {
            transform: `translate(${(from.x + to.x) / 2}px, ${Math.min(from.y, to.y) - 40}px) translate(-50%, -50%) scale(1)`,
            opacity: 1,
            offset: 0.5,
          },
          {
            transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(0.6)`,
            opacity: 0.3,
          },
        ],
        { duration: 850, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
      )
      try {
        await anim.finished
      } catch {}
    }
    flying.value = false
    count.value = (count.value % 3) + 1
    await wait(900)
    if (count.value === 3) {
      count.value = 0
      await wait(500)
    }
  }
}

onMounted(loop)
onBeforeUnmount(() => {
  stopped = true
})
</script>

<template>
  <section class="demo">
    <span class="demo__badge">Пример</span>
    <div class="demo__counter">Писем доставлено: {{ count }} из 3</div>

    <div ref="stageRef" class="demo__stage">
      <img ref="bagRef" class="demo__bag" :src="bag" alt="">

      <div class="demo__person">
        <CharacterAvatar
          :figure="{ gender: null }"
          :crop="cropFor('neutral')"
          shape="rounded"
          size="clamp(2.5rem, 7vw, 3.5rem)"
        />
        <span class="demo__name">Мама</span>
        <img ref="mailboxRef" class="demo__mailbox" :src="mailbox" alt="">
      </div>

      <img v-if="flying" ref="flyerRef" class="demo__flyer" :src="letter" alt="">
    </div>
  </section>
</template>

<style scoped>
.demo {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 40rem;
  margin-inline: auto;
  padding: var(--space-5) var(--space-4) var(--space-4);
  background-color: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  pointer-events: none;
}

.demo__badge {
  position: absolute;
  top: calc(-1 * var(--space-2));
  left: var(--space-4);
  padding: 0 var(--space-2);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background-color: var(--color-bg);
  border-radius: var(--radius-full);
}

.demo__counter {
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--color-text-muted);
}

.demo__stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.demo__bag {
  height: clamp(3.5rem, 11vw, 6rem);
  width: auto;
}

.demo__person {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.demo__name {
  font-weight: var(--fw-bold);
}

.demo__mailbox {
  height: clamp(2.5rem, 7vw, 3.75rem);
  width: auto;
}

.demo__flyer {
  position: absolute;
  left: 0;
  top: 0;
  height: clamp(2rem, 5.5vw, 3rem);
  width: auto;
  z-index: 2;
  will-change: transform;
}
</style>
