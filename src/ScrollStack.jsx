import { useEffect, useRef, useState } from 'react'
import './scroll-stack.css'

export default function ScrollStack({ items }) {
  const rootRef = useRef(null)
  const videoRefs = useRef([])
  const lockRef = useRef(false)
  const [active, setActive] = useState(0)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [errors, setErrors] = useState({})

  const selectVideo = index => {
    videoRefs.current.forEach(video => video?.pause())
    setPlayingIndex(null)
    setActive(index)
  }

  useEffect(() => {
    const onWheel = event => {
      const root = rootRef.current
      if (!root || lockRef.current) return
      const rect = root.getBoundingClientRect()
      const inStack = rect.top <= window.innerHeight * 0.18 && rect.bottom >= window.innerHeight * 0.82
      if (!inStack) return
      const direction = Math.sign(event.deltaY)
      if (!direction || (direction > 0 && active === items.length - 1) || (direction < 0 && active === 0)) return
      event.preventDefault()
      lockRef.current = true
      selectVideo(Math.max(0, Math.min(items.length - 1, active + direction)))
      window.setTimeout(() => { lockRef.current = false }, 620)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [active, items.length])

  const togglePlayback = index => {
    const video = videoRefs.current[index]
    if (!video) return
    if (video.paused) {
      setErrors(previous => ({ ...previous, [index]: false }))
      if (video.error) video.load()
      video.play().catch(error => {
        if (error.name !== 'AbortError') setErrors(previous => ({ ...previous, [index]: true }))
      })
    }
    else { video.pause(); setPlayingIndex(null) }
  }

  return (
    <section className="scroll-stack" ref={rootRef} aria-label="视频作品滚动卡片">
      <div className="scroll-stack__stage">
        <div className="scroll-stack__heading"><span>04 / MOTION REELS</span><p>SCROLL TO BROWSE <b>↓</b></p></div>
        <div className="scroll-stack__deck">
          {items.map((item, index) => {
            const offset = index - active
            const visible = Math.abs(offset) <= 2
            const isPlaying = playingIndex === index
            return <article key={item.name} className={`scroll-stack__card${index === active ? ' is-active' : ''}`} style={{ '--stack-order': index, '--offset': offset, '--visible': visible ? 1 : 0 }} aria-hidden={!visible}>
              {item.src ? <video ref={node => { videoRefs.current[index] = node }} src={item.src} poster={item.poster} playsInline preload="metadata"
                onPlaying={() => setPlayingIndex(index)}
                onPause={() => setPlayingIndex(current => current === index ? null : current)}
                onError={() => setErrors(previous => ({ ...previous, [index]: true }))}
                onEnded={() => setPlayingIndex(current => current === index ? null : current)} />
                : <img className="scroll-stack__poster" src={item.poster} alt={item.name} />}
              <div className="scroll-stack__scrim" />
              {item.src ? <><button className={`scroll-stack__play${isPlaying ? ' is-playing' : ''}`} tabIndex={index === active ? 0 : -1} onClick={() => togglePlayback(index)} aria-label={isPlaying ? `暂停 ${item.name}` : `播放 ${item.name}`}><span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span><em>{isPlaying ? 'PAUSE' : 'PLAY FILM'}</em></button>
                {errors[index] && <p className="scroll-stack__status" role="status">视频加载失败，请点击播放重试</p>}</>
                : <p className="scroll-stack__status">视频待上传</p>}
              <span className="scroll-stack__counter">{String(index + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}</span>
              <div className={`scroll-stack__copy${isPlaying ? ' is-hidden' : ''}`} aria-hidden={isPlaying}><small>{item.kicker}</small><h2>{item.name}</h2><p>{item.detail}</p></div>
            </article>
          })}
        </div>
        <div className="scroll-stack__dots">{items.map((item, index) => <button key={item.name} className={index === active ? 'is-current' : ''} onClick={() => selectVideo(index)} aria-label={`显示 ${item.name}`} />)}</div>
      </div>
    </section>
  )
}
