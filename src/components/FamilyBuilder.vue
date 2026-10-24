<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import CharacterEditor from './CharacterEditor.vue'
import CharacterFigure from './CharacterFigure.vue'
import IconAdd from './IconAdd.vue'

const emit = defineEmits(['hint', 'start', 'say'])

const FINISH_LINE = 'Посмотри ещё раз на свою семью. Здесь все люди, которые живут вместе с тобой? Если всё правильно — нажимай «Начать игру».'

const STORAGE_KEY = 'fidepi-family'
const MAX = 8

function newMember() {
  const id = crypto?.randomUUID?.() || String(Date.now() + Math.random())
  return { id, name: '', gender: null, age: 'young', hair: 'mid', color: 'light', clothing: 'blue' }
}

function normalizeMember(m) {
  return {
    id: m.id || crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    name: typeof m.name === 'string' ? m.name : '',
    gender: m.gender === 'male' || m.gender === 'female' ? m.gender : null,
    age: m.age === 'old' ? 'old' : 'young',
    hair: typeof m.hair === 'string' ? m.hair : 'mid',
    color: typeof m.color === 'string' ? m.color : 'light',
    clothing: typeof m.clothing === 'string' ? m.clothing : 'blue',
  }
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(data) && data.length) return data.map(normalizeMember)
  } catch {}
  return null
}

const savedFamily = load()
const members = ref(savedFamily || [newMember()])
const selected = ref(0)
const editing = ref(null)
const confirmed = ref(false)

watch(
  members,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {}
  },
  { deep: true },
)

const ADD_LINE = 'Отлично! Если с тобой живёт ещё кто-нибудь, можешь добавить его.'

const sayText = computed(() => {
  if (confirmed.value) return FINISH_LINE
  if (editing.value !== null) return ''
  if (members.value.some((m) => !(m.gender && String(m.name).trim()))) return 'Нажми на персонажа, чтобы изменить'
  if (members.value.length === 1) return ADD_LINE
  return ''
})
watch(sayText, (value) => emit('say', value))

onMounted(() => {
  if (savedFamily) {
    const i = members.value.findIndex((m) => !(m.gender && String(m.name).trim()))
    if (i !== -1) {
      selected.value = i
      editing.value = i
    }
  }
  window.addEventListener('keydown', onKeydown)
  emit('say', sayText.value)
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const allReady = computed(
  () => members.value.length > 0 && members.value.every((m) => m.gender && String(m.name).trim().length > 0),
)
const canAdd = computed(() => members.value.length < MAX && allReady.value)
const editingReady = computed(() => {
  const m = editing.value !== null ? members.value[editing.value] : null
  return !!(m && m.gender && String(m.name).trim())
})

function select(i) {
  selected.value = i
  editing.value = i
  confirmed.value = false
}

function addMember() {
  if (!canAdd.value) return
  members.value.push(newMember())
  selected.value = members.value.length - 1
  editing.value = selected.value
  confirmed.value = false
}

function removeMember(i) {
  if (members.value.length <= 1) {
    emit('hint', 'Нужен хотя бы один человек')
    return
  }
  members.value.splice(i, 1)
  if (selected.value >= members.value.length) selected.value = members.value.length - 1
  confirmed.value = false
}

function closeEditor() {
  if (!editingReady.value) {
    emit('hint', 'Сначала напиши имя и выбери пол')
    return
  }
  editing.value = null
}

function cancelEditing() {
  if (editing.value === null) return
  const m = members.value[editing.value]
  const filled = !!(m.gender && String(m.name).trim())
  const blank = !m.gender && !String(m.name).trim()
  if (filled) {
    editing.value = null
    return
  }
  if (blank && members.value.length > 1) {
    members.value.splice(editing.value, 1)
    selected.value = Math.min(selected.value, members.value.length - 1)
    editing.value = null
    confirmed.value = false
    return
  }
  emit('hint', 'Сначала напиши имя и выбери пол')
}

function onKeydown(e) {
  if (e.key === 'Escape') cancelEditing()
}

function confirmFamily() {
  if (!allReady.value) {
    emit('hint', 'Сначала задай имя и выбери пол каждому человеку')
    return
  }
  confirmed.value = true
}

function startGame() {
  emit('start', members.value)
}
</script>

<template>
  <section class="family">
    <div class="family__row">
      <button
        v-for="(m, i) in members"
        :key="m.id"
        class="member"
        :class="{ 'member--active': i === selected }"
        type="button"
        @click="select(i)"
      >
        <CharacterFigure
          class="member__figure"
          :gender="m.gender"
          :age="m.age"
          :hair="m.hair"
          :color="m.color"
          :clothing="m.clothing"
        />
        <span class="member__name">{{ m.name || 'без имени' }}</span>
        <span v-if="members.length > 1" class="member__remove" @click.stop="removeMember(i)">×</span>
      </button>

      <button v-if="canAdd" class="add" type="button" @click="addMember">
        <IconAdd />
      </button>
    </div>

    <div class="family__actions">
      <button v-if="!confirmed" class="btn" :class="{ 'btn--ghost': !allReady }" type="button" :disabled="!allReady" @click="confirmFamily">
        Моя семья готова
      </button>
      <button v-else class="btn btn--primary" type="button" @click="startGame">Начать игру</button>
    </div>

    <div v-if="editing !== null" class="overlay" @click.self="closeEditor">
      <div class="modal">
        <CharacterEditor :member="members[editing]" @hint="emit('hint', $event)" />
        <button class="btn" :class="editingReady ? 'btn--primary' : 'btn--ghost'" type="button" @click="closeEditor">Готово</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.family {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-5);
  width: 100%;
  overflow-y: auto;
}

.family__row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-1) var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.member {
  position: relative;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: 6.5rem;
  padding: var(--space-2);
  background: none;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  scroll-snap-align: center;
}

.member--active {
  border-color: var(--color-primary);
  background-color: var(--color-surface);
}

.member__figure {
  height: clamp(120px, 26vh, 220px);
  width: auto;
}

.member__name {
  max-width: 100%;
  font-size: var(--fs-sm);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member__remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
  line-height: 1;
  color: var(--color-surface);
  background-color: var(--color-text-muted);
  border-radius: 50%;
}

.add {
  flex: 0 0 auto;
  align-self: stretch;
  width: 6.5rem;
  display: grid;
  place-items: center;
  color: var(--color-text-muted);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  cursor: pointer;
}

.family__actions {
  display: flex;
  justify-content: center;
}

.btn {
  padding: var(--space-3) var(--space-5);
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.btn--primary {
  color: var(--color-surface);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn--ghost {
  color: var(--color-text-muted);
  background-color: transparent;
  border-color: transparent;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background-color: rgb(0 0 0 / 0.4);
  overflow-y: auto;
}

.modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: min(100%, 32rem);
  padding: var(--space-5);
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
}
</style>
