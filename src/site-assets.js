const API = '/api/portfolio/content'

const normalizeAssetPath = value => {
  try {
    const url = new URL(value, window.location.origin)
    return url.origin === window.location.origin && url.pathname.startsWith('/assets/') ? decodeURI(url.pathname) : ''
  } catch {
    return ''
  }
}

export function installSiteAssetOverrides() {
  let overrides = {}

  const applyAttribute = (element, attribute) => {
    const key = attribute === 'poster' ? 'cmsOriginalPoster' : 'cmsOriginalSrc'
    const current = element.getAttribute(attribute)
    const original = element.dataset[key] || normalizeAssetPath(current)
    if (!original) return
    element.dataset[key] = original
    const override = overrides[original]
    const target = override?.url || original
    if (current !== target) element.setAttribute(attribute, target)
    element.hidden = Boolean(override?.hidden)
    if (element.tagName === 'VIDEO' && attribute === 'src' && current !== target) element.load()
  }

  const applyMedia = element => {
    if (element.hasAttribute('src')) applyAttribute(element, 'src')
    if (element.tagName === 'VIDEO' && element.hasAttribute('poster')) applyAttribute(element, 'poster')
  }

  const scan = root => {
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return
    if (root.matches?.('img[src],video[src],video[poster],source[src]')) applyMedia(root)
    root.querySelectorAll?.('img[src],video[src],video[poster],source[src]').forEach(applyMedia)
  }

  const observer = new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes') applyMedia(record.target)
    record.addedNodes.forEach(scan)
  }))
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'poster'] })

  fetch(API, { credentials: 'same-origin', cache: 'no-store' })
    .then(response => response.ok ? response.json() : { assets: {} })
    .then(data => { overrides = data.assets || {}; scan(document) })
    .catch(() => {})

  scan(document)
}
