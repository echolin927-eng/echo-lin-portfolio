import { useCallback, useEffect, useRef } from 'react'
import './scroll-expand.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const smoothstep = (start, end, value) => { const t = clamp((value - start) / (end - start || 1e-6), 0, 1); return t * t * (3 - 2 * t) }

export default function ScrollExpand({ src = '', poster = '', alt = '', title = '', hint = 'SCROLL TO EXPAND', children, startWidth = 48, startHeight = 62, mediaZoom = 1.26, scrollDistance = 1.05, holdDistance = .28 }) {
  const root = useRef(null), track = useRef(null), stage = useRef(null), frame = useRef(null), media = useRef(null), titleRef = useRef(null), overlay = useRef(null), scrim = useRef(null), hintRef = useRef(null)
  const update = useCallback(progress => {
    const eased = smoothstep(0, 1, progress), width = startWidth + (100 - startWidth) * eased, height = startHeight + (100 - startHeight) * eased
    const x = (100 - width) / 2, y = (100 - height) / 2
    frame.current.style.clipPath = `inset(${y}% ${x}% ${y}% ${x}% round ${24 * (1 - eased)}px)`
    media.current.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * eased})`
    scrim.current.style.opacity = `${.5 * eased}`
    const titleOut = smoothstep(.36, .84, progress); titleRef.current.style.opacity = `${1 - titleOut}`; titleRef.current.style.transform = `translateY(${-32 * titleOut}px)`
    const overlayIn = smoothstep(.68, 1, progress); overlay.current.style.opacity = `${overlayIn}`; overlay.current.style.transform = `translateY(${20 * (1 - overlayIn)}px)`
    const hintOut = smoothstep(0, .14, progress); hintRef.current.style.opacity = `${1 - hintOut}`
  }, [mediaZoom, startHeight, startWidth])
  useEffect(() => {
    const measure = () => { const height = window.innerHeight; stage.current.style.height = `${height}px`; track.current.style.height = `${height * (1 + scrollDistance + holdDistance)}px`; update(clamp(-track.current.getBoundingClientRect().top / (height * scrollDistance), 0, 1)) }
    const scroll = () => update(clamp(-track.current.getBoundingClientRect().top / (window.innerHeight * scrollDistance), 0, 1))
    measure(); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', measure); return () => { window.removeEventListener('scroll', scroll); window.removeEventListener('resize', measure) }
  }, [holdDistance, scrollDistance, update])
  return <section className="scroll-expand" ref={root} aria-label={title}><div className="scroll-expand__track" ref={track}><div className="scroll-expand__stage" ref={stage}><div className="scroll-expand__frame" ref={frame}><video ref={media} className="scroll-expand__media" src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-label={alt} /><div className="scroll-expand__scrim" ref={scrim} /><div className="scroll-expand__overlay" ref={overlay}>{children}</div></div><h2 className="scroll-expand__title" ref={titleRef}>{title}</h2><p className="scroll-expand__hint" ref={hintRef}>{hint} <span>↓</span></p></div></div></section>
}
