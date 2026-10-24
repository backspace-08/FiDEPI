import { reactive, watch } from 'vue'
import { pickQuestions } from '../data/questions.js'

const STORAGE_KEY = 'fidepi-assessment'
const VERSION = 1
const DEV_QUESTION_LIMIT = null

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function loadFamily() {
  try {
    const data = JSON.parse(localStorage.getItem('fidepi-family') || 'null')
    if (Array.isArray(data) && data.length) return data
  } catch {}
  return []
}

function create() {
  const now = new Date().toISOString()
  return {
    version: VERSION,
    id: crypto?.randomUUID?.() || String(Date.now()),
    createdAt: now,
    updatedAt: now,
    family: [],
    questionOrder: [],
    answers: [],
    sceneIndex: 0,
    sceneId: null,
    delivered: 0,
    currentN: null,
    stage: null,
    voiceEnabled: false,
    completed: false,
  }
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!data || data.version !== VERSION) return null
    return data
  } catch {
    return null
  }
}

export const assessment = reactive(load() || create())

function saveNow() {
  const payload = { ...assessment, updatedAt: new Date().toISOString() }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

let saveTimer
watch(
  assessment,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(saveNow, 100)
  },
  { deep: true },
)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', saveNow)
  window.addEventListener('pagehide', saveNow)
}

export function startAssessment(family) {
  const voiceEnabled = assessment.voiceEnabled
  const questionOrder = shuffle(pickQuestions(DEV_QUESTION_LIMIT)).map(
    (question) => question.n,
  )
  Object.assign(assessment, create(), {
    family: Array.isArray(family) && family.length ? family : loadFamily(),
    questionOrder,
    voiceEnabled,
  })
}

export function clearAssessment() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
  Object.assign(assessment, create())
}
