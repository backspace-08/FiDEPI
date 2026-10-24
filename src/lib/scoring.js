import { QUESTION_BY_N } from '../data/questions.js'
import {
  BLOCK_ORDER,
  FROM_CHILD_BLOCKS,
  NEGATIVE_BLOCKS,
  POSITIVE_BLOCKS,
  TO_CHILD_BLOCKS,
} from '../data/blocks.js'

export const POSITIVE_THRESHOLD = 80
export const NEGATIVE_THRESHOLD = 60

export function statusFor(positive, negative) {
  const total = positive + negative
  if (!total) return 'unknown'
  const positivePct = (positive / total) * 100
  const negativePct = (negative / total) * 100
  if (positivePct >= POSITIVE_THRESHOLD) return 'positive'
  if (negativePct >= NEGATIVE_THRESHOLD) return 'negative'
  return 'normal'
}

function emptyCounts() {
  return Object.fromEntries(BLOCK_ORDER.map((block) => [block, 0]))
}

function sumBlocks(counts, blocks) {
  return blocks.reduce((sum, block) => sum + (counts[block] || 0), 0)
}

function ratio(positive, negative) {
  const total = positive + negative
  const positivePct = total ? Math.round((positive / total) * 100) : 0
  return {
    positive,
    negative,
    total,
    positivePct,
    negativePct: total ? 100 - positivePct : 0,
    status: statusFor(positive, negative),
  }
}

function scoreAnswers(answers, keepMember) {
  const counts = emptyCounts()
  for (const answer of answers) {
    if (!keepMember(answer.memberId)) continue
    const question = QUESTION_BY_N.get(answer.n)
    if (question) counts[question.block] += 1
  }
  const positive = sumBlocks(counts, POSITIVE_BLOCKS)
  const negative = sumBlocks(counts, NEGATIVE_BLOCKS)
  const assigned = BLOCK_ORDER.reduce((sum, block) => sum + counts[block], 0)
  return {
    counts,
    ...ratio(positive, negative),
    assigned,
    fromChild: sumBlocks(counts, FROM_CHILD_BLOCKS),
    toChild: sumBlocks(counts, TO_CHILD_BLOCKS),
    special: { G: counts.G, H: counts.H },
  }
}

export function scoreMember(answers, memberId) {
  return { memberId, ...scoreAnswers(answers, (id) => id === memberId) }
}

export function scoreOverall(answers, memberIds) {
  const ids = new Set(memberIds)
  return scoreAnswers(answers, (id) => ids.has(id))
}

export function scoreAssessment(answers, members) {
  const memberIds = members.map((member) => member.id)
  const total = answers.length
  const withShare = (member) => ({
    ...member,
    share: total ? Math.round((member.assigned / total) * 100) : 0,
  })
  return {
    members: [
      ...members.map((member) =>
        withShare({
          ...scoreMember(answers, member.id),
          name: member.name || 'Без имени',
        }),
      ),
      withShare({
        ...scoreMember(answers, 'stranger'),
        name: 'Никто',
        isNobody: true,
      }),
    ],
    overall: scoreOverall(answers, memberIds),
    stranger: answers.filter((answer) => answer.memberId === 'stranger').length,
    total,
  }
}
