const modules = import.meta.glob('../svg/layered/**/*.svg', { query: '?url', import: 'default' })
const cache = new Map()
const pending = new Map()

const PREFIX = '../svg/layered/'

export function loadLayer(path) {
  if (cache.has(path)) return Promise.resolve(cache.get(path))
  if (pending.has(path)) return pending.get(path)
  const loader = modules[PREFIX + path]
  if (!loader) return Promise.resolve('')
  const p = loader().then((url) => {
    cache.set(path, url)
    pending.delete(path)
    return url
  })
  pending.set(path, p)
  return p
}

let started = false
export function preloadLayers() {
  if (started) return
  started = true
  for (const key of Object.keys(modules)) loadLayer(key.slice(PREFIX.length))
}