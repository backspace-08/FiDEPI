const BASE = import.meta.env.BASE_URL

export function audioUrl(name) {
  return `${BASE}audio/${name}`
}

let player = null
const preloadCache = new Map()

export function preloadAudio(name) {
  if (!name || preloadCache.has(name)) return
  const audio = new Audio()
  audio.preload = 'auto'
  audio.src = audioUrl(name)
  audio.addEventListener('error', () => preloadCache.delete(name), { once: true })
  audio.load()
  preloadCache.set(name, audio)
}

function stopPlayer() {
  if (!player) return
  player.pause()
  player.currentTime = 0
  player = null
}

function speakFallback(text) {
  if (!text || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ru-RU'
  const voice = window.speechSynthesis.getVoices().find((item) => item.lang?.startsWith('ru'))
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

export function playAudio(name, fallbackText = '') {
  if (!name) {
    speakFallback(fallbackText)
    return
  }
  stopPlayer()

  let audio = preloadCache.get(name)
  if (!audio) {
    audio = new Audio(audioUrl(name))
    preloadCache.set(name, audio)
  }

  let handled = false
  const onError = () => {
    if (handled) return
    handled = true
    audio.removeEventListener('error', onError)
    preloadCache.delete(name)
    if (player === audio) player = null
    speakFallback(fallbackText)
  }
  audio.addEventListener('error', onError, { once: true })

  try {
    audio.currentTime = 0
  } catch {}
  player = audio

  audio.play().catch((error) => {
    if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
      if (player === audio) player = null
      return
    }
    onError()
  })
}

export function stopAudio() {
  stopPlayer()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
