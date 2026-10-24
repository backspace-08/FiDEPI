const BASE = import.meta.env.BASE_URL

export function audioUrl(name) {
  return `${BASE}audio/${name}`
}

let player = null

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
  const audio = new Audio(audioUrl(name))
  player = audio
  audio.play().catch(() => {
    if (player === audio) player = null
    speakFallback(fallbackText)
  })
}

export function stopAudio() {
  stopPlayer()
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
