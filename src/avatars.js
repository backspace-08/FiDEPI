import stranger from '../svg/normalized/special_out/stranger.svg'
import psychoStill from '../svg/normalized/special_out/psycho_still.svg'

export const DEFAULT_CROP = { top: 11.7, left: 11.9, zoom: 76.2 }

export const crops = {
  psychologist: { top: -13.8, left: 8.9, zoom: 86.1 },
  stranger: { top: -21.2, left: 6.4, zoom: 88.4 },
  female_short: { top: -5, left: 9.3, zoom: 80.9 },
  female_mid: { top: -4.6, left: 9.8, zoom: 80.9 },
  female_long: { top: -3.5, left: 10.8, zoom: 78.5 },
  male_a: { top: 2.9, left: 7.9, zoom: 83.3 },
  male_b: { top: 8.1, left: 8.4, zoom: 83.3 },
  male_c: { top: 5.6, left: 9.5, zoom: 83.3 },
}

export const avatars = [
  { id: 'psychologist', label: 'психолог', src: psychoStill },
  { id: 'stranger', label: 'незнакомец', src: stranger },
  {
    id: 'female_short',
    label: 'женщина · короткие',
    figure: { gender: 'female', age: 'young', hair: 'short', color: 'light', clothing: 'blue' },
  },
  {
    id: 'female_mid',
    label: 'женщина · средние',
    figure: { gender: 'female', age: 'young', hair: 'mid', color: 'red', clothing: 'red' },
  },
  {
    id: 'female_long',
    label: 'женщина · длинные',
    figure: { gender: 'female', age: 'young', hair: 'long', color: 'dark', clothing: 'black' },
  },
  {
    id: 'male_a',
    label: 'мужчина · джинсы',
    figure: { gender: 'male', age: 'young', hair: 'a', color: 'dark', clothing: 'jeans' },
  },
  {
    id: 'male_b',
    label: 'мужчина · футболка',
    figure: { gender: 'male', age: 'young', hair: 'b', color: 'light', clothing: 'whitetee' },
  },
  {
    id: 'male_c',
    label: 'мужчина · костюм',
    figure: { gender: 'male', age: 'young', hair: 'c', color: 'red', clothing: 'costume' },
  },
]

export function cropFor(id) {
  const key = id === 'neutral' ? 'stranger' : id
  return { ...DEFAULT_CROP, ...(crops[key] || {}) }
}