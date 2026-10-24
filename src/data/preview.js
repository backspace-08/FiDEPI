import { QUESTIONS } from './questions.js'

const TO_ME = { A: 8, B: 3, C: 1, D: 7, E: 2, F: 0, G: 5, H: 2 }

const seen = {}

export const DEMO_ANSWERS = QUESTIONS.map((question) => {
  seen[question.block] = (seen[question.block] || 0) + 1
  return {
    n: question.n,
    memberId: seen[question.block] <= TO_ME[question.block] ? 'me' : 'stranger',
  }
})

export const DEMO_MEMBERS = [{ id: 'me', name: 'Я' }]
