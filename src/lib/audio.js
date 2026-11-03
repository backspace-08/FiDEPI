const BASE = import.meta.env.BASE_URL

const MAX_CACHE = 16

let player = null
let serial = 0
let pending = null
let retryArmed = false
const preloadCache = new Map()

export function audioUrl(name) {
  return `${BASE}audio/${name}`
}

function forget(audio) {
  for (const [key, value] of preloadCache) {
    if (value === audio) preloadCache.delete(key)
  }
}

function cacheAudio(name, audio) {
  preloadCache.set(name, audio)
  if (preloadCache.size <= MAX_CACHE) return
  for (const [key, value] of preloadCache) {
    if (preloadCache.size <= MAX_CACHE) break
    if (value === player || value === pending?.audio) continue
    preloadCache.delete(key)
    try {
      value.pause()
    } catch {}
  }
}

export function preloadAudio(name) {
  if (!name || preloadCache.has(name)) return
  const audio = new Audio()
  audio.preload = 'auto'
  audio.src = audioUrl(name)
  audio.addEventListener(
    'error',
    () => {
      if (preloadCache.get(name) === audio) preloadCache.delete(name)
    },
    { once: true },
  )
  audio.load()
  cacheAudio(name, audio)
}

function stopPlayer() {
  if (!player) return
  const audio = player
  player = null
  try {
    audio.pause()
  } catch {}
  try {
    audio.currentTime = 0
  } catch {}
}

function cancelSpeech() {
  if (!('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
  } catch {}
}

function speakFallback(text) {
  if (!text || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ru-RU'
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang?.startsWith('ru'))
    if (voice) utterance.voice = voice
    window.speechSynthesis.speak(utterance)
  } catch {}
}

// Autoplay may be blocked when playback is requested outside of a user gesture
// (after an animation, a timer or on resume). Keep the track and retry on the
// next click, once other click handlers had a chance to supersede it.
function armRetry() {
  if (retryArmed || typeof document === 'undefined') return
  retryArmed = true
  const onGesture = () => {
    retryArmed = false
    const item = pending
    queueMicrotask(() => {
      if (!item || pending !== item || item.token !== serial) return
      pending = null
      item.attempt()
    })
  }
  document.addEventListener('click', onGesture, { once: true })
}

function startPlayback(audio, fallbackText, token) {
  let failed = false

  const fail = () => {
    if (failed || token !== serial) return
    failed = true
    audio.onerror = null
    try {
      audio.pause()
    } catch {}
    if (player === audio) player = null
    forget(audio)
    speakFallback(fallbackText)
  }

  audio.onerror = fail

  const attempt = () => {
    if (failed || token !== serial) return
    player = audio
    let promise
    try {
      promise = audio.play()
    } catch {
      fail()
      return
    }
    if (!promise || typeof promise.catch !== 'function') return
    promise.catch((error) => {
      if (failed || token !== serial) return
      if (player === audio) player = null
      if (error?.name === 'AbortError') return
      if (error?.name === 'NotAllowedError') {
        pending = { audio, fallbackText, token, attempt }
        armRetry()
        return
      }
      fail()
    })
  }

  attempt()
}

export function playAudio(name, fallbackText = '') {
  if (!name) {
    stopPlayer()
    speakFallback(fallbackText)
    return
  }

  const token = ++serial
  pending = null
  stopPlayer()

  let audio = preloadCache.get(name)
  if (!audio) {
    audio = new Audio(audioUrl(name))
    cacheAudio(name, audio)
  }

  try {
    audio.currentTime = 0
  } catch {}

  startPlayback(audio, fallbackText, token)
}

export function cancelPendingAudio() {
  pending = null
}

export function stopAudio() {
  serial += 1
  pending = null
  stopPlayer()
  cancelSpeech()
}
