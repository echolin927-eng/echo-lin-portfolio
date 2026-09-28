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

  const applyMedia = element => {
    const attribute = element.tagName === 'VIDEO' && element.hasAttribute('poster') ? 'poster' : 'src'
    const current = element.getAttribute(attribute)
    const original = element.dataset.cmsOriginalAsset || normalizeAssetPath(current)
    if (!original) return
    element.dataset.cmsOriginalAsset = original
    const override = overrides[original]
    const target = override?.url || original
    if (current !== target) element.setAttribute(attribute, target)
    element.hidden = Boolean(override?.hidden)
    element.closest('figure, article')?.classList.toggle('cms-asset-hidden', Boolean(override?.hidden))
    if (element.tagName === 'VIDEO' && attribute === 'src' && current !== target) element.load()
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
