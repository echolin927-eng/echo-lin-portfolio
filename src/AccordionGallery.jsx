import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './accordion-gallery.css'

export default function AccordionGallery({ items, defaultIndex = 0, expandRatio = .5, accentColor = '#fd86db', height = 610 }) {
  const rootRef = useRef(null)
  const panels = useRef([])
  const media = useRef([])
  const labels = useRef([])
  const timeline = useRef(null)
  const [active, setActive] = useState(defaultIndex)

  const layout = useCallback((animate = true) => {
    const root = rootRef.current
    if (!root) return
    const panelNodes = panels.current.filter(Boolean)
    const count = panelNodes.length
    if (!count) return
    const grow = count > 1 ? (expandRatio * (count - 1)) / (1 - expandRatio) : 1
    timeline.current?.kill()
    timeline.current = gsap.timeline({ defaults: { duration: animate ? .62 : 0, ease: 'power3.out' } })
    panelNodes.forEach((panel, index) => {
      const selected = index === active
      const direction = index < active ? 1 : -1
      timeline.current.to(panel, { flexGrow: selected ? grow : 1, rotateY: selected ? 0 : direction * 7 }, 0)
      timeline.current.to(media.current[index], { xPercent: -50, x: selected ? 0 : (active - index) * 22, filter: selected ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(.54)' }, 0)
      timeline.current.to(labels.current[index], { opacity: selected ? 1 : 0, x: selected ? 0 : -16, duration: selected ? .54 : .28 }, 0)
    })
  }, [active, expandRatio])

  useEffect(() => { layout(false); const observer = new ResizeObserver(() => layout(false)); observer.observe(rootRef.current); return () => { observer.disconnect(); timeline.current?.kill() } }, [layout])
  useEffect(() => { layout(true) }, [active, layout])

  const activate = (index) => setActive(index)
  return <div className="accordion-gallery" ref={rootRef} style={{ '--ag-accent': accentColor, height }} role="list" aria-label="精选项目">
    {items.map((item, index) => <button key={item.label} ref={node => { panels.current[index] = node }} className={`ag-panel${active === index ? ' ag-active' : ''}`} onMouseEnter={() => activate(index)} onFocus={() => activate(index)} onClick={() => activate(index)} onKeyDown={event => { if (event.key === 'ArrowRight') activate((index + 1) % items.length); if (event.key === 'ArrowLeft') activate((index - 1 + items.length) % items.length) }} aria-label={`查看 ${item.label}`} aria-current={active === index} role="listitem">
      <span className="ag-frame"><span className="ag-media" ref={node => { media.current[index] = node }}><img src={item.image} alt={item.alt || item.label} /></span><span className="ag-overlay" /></span>
      <span className="ag-index">0{index + 1}</span>
      <span className="ag-label" ref={node => { labels.current[index] = node }}><i /><span><small>{item.type}</small><strong>{item.label}</strong><em>{item.subtitle}</em></span><b>↗</b></span>
    </button>)}
  </div>
}
