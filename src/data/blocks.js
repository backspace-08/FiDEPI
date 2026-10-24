export const BLOCKS = {
  A: {
    key: 'A',
    title: 'Положительные чувства ребёнка к члену семьи',
    valence: 'positive',
    direction: 'from-child',
    max: 10,
  },
  B: {
    key: 'B',
    title: 'Слабые отрицательные чувства ребёнка к члену семьи',
    valence: 'negative',
    direction: 'from-child',
    max: 10,
  },
  C: {
    key: 'C',
    title: 'Сильные отрицательные чувства ребёнка к члену семьи',
    valence: 'negative',
    direction: 'from-child',
    max: 8,
  },
  D: {
    key: 'D',
    title: 'Положительное отношение члена семьи к ребёнку',
    valence: 'positive',
    direction: 'to-child',
    max: 8,
  },
  E: {
    key: 'E',
    title: 'Слабые отрицательные чувства, которые ребёнок приписывает члену семьи по отношению к себе',
    valence: 'negative',
    direction: 'to-child',
    max: 8,
  },
  F: {
    key: 'F',
    title: 'Сильные отрицательные чувства, которые ребёнок приписывает члену семьи по отношению к себе',
    valence: 'negative',
    direction: 'to-child',
    max: 8,
  },
  G: {
    key: 'G',
    title: 'Материнская сверхопека',
    valence: 'special',
    direction: null,
    max: 8,
  },
  H: {
    key: 'H',
    title: 'Отцовское сверхпотакание',
    valence: 'special',
    direction: null,
    max: 5,
  },
}

export const BLOCK_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export const POSITIVE_BLOCKS = ['A', 'D']
export const NEGATIVE_BLOCKS = ['B', 'C', 'E', 'F']
export const FROM_CHILD_BLOCKS = ['A', 'B', 'C']
export const TO_CHILD_BLOCKS = ['D', 'E', 'F']
