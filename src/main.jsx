import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollStack from './ScrollStack'
import GlareHover from './GlareHover'
import CardSwap, { Card } from './CardSwap'
import './styles.css'
import './orbit-hero.css'

const projects = [
  { number: '01', type: '3D MOTION / PRODUCT', title: 'TFIT NOVA MAX', subtitle: '电子雾化产品 3D 渲染与动态视觉', image: '/assets/tfit-video-show.png', className: 'project-tfit' },
  { number: '02', type: 'E-COMMERCE / A+ CONTENT', title: 'PRODUCT STORIES', subtitle: '从产品卖点到场景化视觉的整合表达', image: '/assets/product-grid.png', className: 'project-products' },
  { number: '03', type: 'BRAND / DIGITAL', title: 'BRAND IN MOTION', subtitle: '品牌官网与数字界面的视觉系统', image: '/assets/web-page.png', className: 'project-brand' },
]

const strengths = [
  { number: '01', keywords: ['审美好', '重细节', '落地稳'], points: ['VI 设计、品牌视觉搭建', '网页设计、品牌物料输出'] },
  { number: '02', keywords: ['深耕设计行业 9 年', '实战足', '出图快'], points: ['3D 建模、产品渲染', '视频渲染制作'] },
  { number: '03', keywords: ['创意强', '善探索', '学习快'], points: ['AI 绘图创作', '搭建 AIGC 创意工作流'] },
  { number: '04', keywords: ['善沟通', '懂统筹', '能协同'], points: ['跨团队对接协作', '全项目落地把控'] },
]

const handleStrengthCardMove = (event) => {
  if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const card = event.currentTarget
  const bounds = card.getBoundingClientRect()
  const horizontal = ((event.clientX - bounds.left) / bounds.width - .5) * 2
  const vertical = ((event.clientY - bounds.top) / bounds.height - .5) * 2
  gsap.to(card, {
    rotateX: vertical * -7,
    rotateY: horizontal * 8,
    y: -8,
    transformPerspective: 900,
    transformOrigin: 'center center',
    duration: .22,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

const handleStrengthCardLeave = (event) => {
  gsap.to(event.currentTarget, {
    rotateX: 0,
    rotateY: 0,
    y: 0,
    duration: .55,
    ease: 'elastic.out(1, .55)',
    overwrite: 'auto',
  })
}

const galleryProjects = [
  { image: '/assets/work-showcase-01-new.png', label: 'TFIT NOVA MAX', type: '3D MOTION / PRODUCT', subtitle: '产品 3D 渲染与动态视觉', href: '/design' },
  { image: '/assets/work-showcase-02-new.png', label: 'PRODUCT STORIES', type: 'E-COMMERCE / A+ CONTENT', subtitle: '从卖点到场景的视觉叙事', href: '/detail-page-design?work=8' },
  { image: '/assets/work-showcase-01.jpg', label: 'AMAZON A+ PAGE', type: 'E-COMMERCE / DETAIL', subtitle: '跨境电商详情页视觉系统', href: '/detail-page-design?work=1' },
  { image: '/assets/work-showcase-04.jpg', label: 'BRAND IDENTITY', type: 'BRAND / VISUAL', subtitle: '从品牌语言到触点表达', href: '/amazon-store-design' },
  { image: '/assets/work-showcase-05.jpg', label: 'DIGITAL EXPERIENCE', type: 'WEB / INTERFACE', subtitle: '数字界面的视觉体验', href: '/commercial-design' },
]

const portfolioVideos = [
  { src: '/assets/motion-reel-01.mp4', poster: '/assets/motion-reel-01-poster.jpg', label: 'MOTION REEL 01', type: '3D MOTION / PRODUCT', subtitle: '产品动态视觉与镜头表达' },
  { src: '/assets/motion-reel-02.mp4', poster: '/assets/motion-reel-02-poster.jpg', label: 'MOTION REEL 02', type: 'MOTION / CAMPAIGN', subtitle: '品牌动画与创意短片' },
  { src: '/assets/motion-reel-03.mp4', poster: '/assets/motion-reel-03-poster.jpg', label: 'MOTION REEL 03', type: '3D / VISUAL STORY', subtitle: '三维场景与产品叙事' },
  { src: '/assets/amazon-ai-prompts.mp4', poster: '/assets/amazon-ai-prompts-cover.png', label: 'AI CREATIVE REEL', type: 'AIGC / E-COMMERCE', subtitle: 'AI 创意与商业视觉实验' },
]

const portfolioImageRows = [
  ['/assets/detail-work-08-main-01.png', '/assets/detail-work-08-main-02.jpg', '/assets/detail-work-08-main-03.jpg', '/assets/detail-work-08-main-04.jpg'],
  ['/assets/detail-work-01-main-01.jpg', '/assets/detail-work-01-main-02.jpg', '/assets/detail-work-01-main-03.jpg', '/assets/detail-work-01-main-04.jpg'],
]

const journeyProjects = [
  { image: '/assets/work-showcase-01-new.png', label: 'TFIT NOVA MAX', href: '/design' },
  { image: '/assets/work-showcase-02-new.png', label: 'PRODUCT STORIES', href: '/detail-page-design?work=8' },
  { image: '/assets/work-showcase-01.jpg', label: 'AMAZON A+ PAGE', href: '/detail-page-design?work=1' },
  { image: '/assets/work-showcase-04.jpg', label: 'BRAND IDENTITY', href: '/amazon-store-design' },
  { image: '/assets/work-showcase-05.jpg', label: 'DIGITAL EXPERIENCE', href: '/commercial-design' },
  { image: '/assets/design-cover-amazon-store.jpg', label: 'AMAZON STORE', href: '/amazon-store-design' },
  { image: '/assets/design-cover-commercial.jpg', label: 'COMMERCIAL DESIGN', href: '/commercial-design' },
  { image: '/assets/design-cover-detail-page.jpg', label: 'DETAIL PAGE', href: '/detail-page-design' },
  { image: '/assets/design-cover-website.jpg', label: 'WEBSITE DESIGN', href: '/website-design' },
]

function PortfolioMosaic({ items }) {
  const [videoIndex, setVideoIndex] = useState(0)
  const [viewer, setViewer] = useState(null)
  const videoCardRef = useRef(null)
  const activeVideo = portfolioVideos[videoIndex]

  useEffect(() => {
    if (!viewer) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') setViewer(null) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [viewer])

  useEffect(() => {
    const card = videoCardRef.current
    if (!card) return undefined

    let accumulatedDelta = 0
    let locked = false
    let unlockTimer = 0
    let resetTimer = 0
    const handleVideoWheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 2) return
      event.preventDefault()
      event.stopPropagation()
      if (locked) return

      accumulatedDelta += event.deltaY
      window.clearTimeout(resetTimer)
      resetTimer = window.setTimeout(() => { accumulatedDelta = 0 }, 160)
      if (Math.abs(accumulatedDelta) < 18) return

      const direction = accumulatedDelta > 0 ? 1 : -1
      accumulatedDelta = 0
      locked = true
      setVideoIndex(current => (current + direction + portfolioVideos.length) % portfolioVideos.length)
      window.clearTimeout(unlockTimer)
      unlockTimer = window.setTimeout(() => { locked = false }, 650)
    }

    card.addEventListener('wheel', handleVideoWheel, { passive: false })
    return () => {
      window.clearTimeout(unlockTimer)
      window.clearTimeout(resetTimer)
      card.removeEventListener('wheel', handleVideoWheel)
    }
  }, [])

  const openVideo = () => setViewer({ ...activeVideo, type: 'video' })
  const activateFeature = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openVideo()
    }
  }

  return <>
    <div className="portfolio-mosaic" role="list" aria-label="精选作品">
      <article className="portfolio-mosaic-card portfolio-mosaic-card--feature portfolio-video-card" ref={videoCardRef} role="listitem" aria-label={`播放 ${activeVideo.label}，滚轮切换视频`} tabIndex={0} onClick={openVideo} onKeyDown={activateFeature}>
        <video key={activeVideo.src} src={activeVideo.src} poster={activeVideo.poster} autoPlay muted loop playsInline preload="metadata" />

        <span className="portfolio-mosaic-number">{String(videoIndex + 1).padStart(2, '0')}</span>
        <span className="portfolio-mosaic-copy">
          <small>{activeVideo.type}</small>
          <strong>{activeVideo.label}</strong>
          <em>{activeVideo.subtitle}</em>
        </span>
        <span className="portfolio-video-dots" aria-label={`第 ${videoIndex + 1} 个视频，共 ${portfolioVideos.length} 个`} onClick={event => event.stopPropagation()}>
          {portfolioVideos.map((video, index) => <button type="button" key={video.src} className={index === videoIndex ? 'is-active' : ''} aria-label={`切换到视频 ${index + 1}`} aria-current={index === videoIndex} onClick={() => setVideoIndex(index)} />)}
        </span>
        <span className="portfolio-mosaic-arrow" aria-hidden="true">↗</span>
      </article>

      {portfolioImageRows.map((images, rowIndex) => {
        const item = items[rowIndex + 1]
        return <article className="portfolio-mosaic-card portfolio-image-card" role="listitem" aria-label={`${item.label} 作品主图`} key={item.label}>
          <div className="portfolio-image-strip">
            {images.map((src, imageIndex) => <button type="button" key={src} aria-label={`放大查看 ${item.label} 主图 ${imageIndex + 1}`} onClick={() => setViewer({ type: 'image', src, label: `${item.label} / 0${imageIndex + 1}` })}>
              <img src={src} alt={`${item.label} 作品主图 ${imageIndex + 1}`} />
            </button>)}
          </div>

          <span className="portfolio-mosaic-number">0{rowIndex + 2}</span>
        </article>
      })}
    </div>

    {viewer && createPortal(<div className="portfolio-lightbox" role="dialog" aria-modal="true" aria-label={`查看 ${viewer.label}`} onClick={() => setViewer(null)}>
      <button className="portfolio-lightbox-close" type="button" onClick={() => setViewer(null)}>关闭</button>
      <div className={`portfolio-lightbox-media is-${viewer.type}`} onClick={event => event.stopPropagation()}>
        {viewer.type === 'video'
          ? <video src={viewer.src} poster={viewer.poster} controls autoPlay playsInline />
          : <img src={viewer.src} alt={viewer.label} />}
        <p>{viewer.label}</p>
      </div>
    </div>, document.body)}
  </>
}
const experience = [
  { period: '2025.10 — 2026.04', company: '深圳市微铸科技有限公司', role: '高级设计师', detail: '负责新品主图与 A+ 视觉、游戏类头戴耳机旗舰店设计，以及旧品图片优化与设计资产归档。' },
  { period: '2024.03 — 2025.08', company: '深圳市森克维普', role: '动画 / 平面设计师', detail: '承担新品动画、电子烟展会物料、海外社交媒体内容，以及品牌 VI 与产品包装设计。' },
  { period: '2022.07 — 2024.03', company: '深圳市德盈丰', role: '美工主管', detail: '统筹设计团队日常工作，建立设计规范，推进跨部门沟通，并组织团队技能培训。' },
  { period: '2020.05 — 2022.06', company: '努斯特（深圳）', role: '设计主管', detail: '负责产品设计、建模渲染、海外平台详情视觉与产品视频拍摄剪辑。' },
]

const toolkitGroups = [
  {
    label: 'SOFTWARE / 软件',
    className: 'toolkit-group--software',
    items: [
      ['Photoshop', '/assets/tool-icons/ps2.png', 'filled', '#001e36'],
      ['Illustrator', '/assets/tool-icons/ai2.png', 'filled', '#330000'],
      ['Premiere Pro', '/assets/tool-icons/pr2.png', 'filled', '#00005a'],
      ['After Effects', '/assets/tool-icons/ae2.png', 'filled', '#00005b'],
      ['Blender', '/assets/tool-icons/blender.svg'],
      ['Figma', '/assets/tool-icons/figma.svg'],
      ['Cinema 4D', '/assets/tool-icons/c4d.png'],
      ['KeyShot', '/assets/tool-icons/keyshot.png'],
      ['more', '/assets/tool-icons/ollama.svg'],
    ],
  },
  {
    label: 'AI TOOLKIT / AI 工具',
    className: 'toolkit-group--ai',
    items: [
      ['ChatGPT', '/assets/tool-icons/chatgpt.svg', 'filled'],
      ['Codex', '/assets/tool-icons/codex.svg'],
      ['Midjourney', '/assets/tool-icons/midjourney.svg', 'midjourney'],
      ['Gemini', '/assets/tool-icons/gemini.svg'],
      ['Claude', '/assets/tool-icons/claude.svg'],
      ['DeepSeek', '/assets/tool-icons/deepseek.svg'],
    ],
  },
]

function Toolkit() {
  return <div className="toolkit" aria-label="工作软件与 AI 工具">
    {toolkitGroups.map((group) => <section className={`toolkit-group ${group.className}`} key={group.label}>
      <h3>{group.label}</h3>
      <ul>{group.items.map(([name, icon, iconVariant, iconBackground]) => <GlareHover as="li" className="tool-card" key={name}
        width="auto" glareOpacity={0.3} glareAngle={-30} glareSize={300}
        transitionDuration={800} playOnce={false}>
        <span className={`tool-card-icon ${iconVariant ? `tool-card-icon--${iconVariant}` : ''}`} style={iconBackground ? { backgroundColor: iconBackground } : undefined}><img src={icon} alt="" /></span>
        <span>{name}</span>
      </GlareHover>)}</ul>
    </section>)}
  </div>
}

const girlImage = '/assets/echo-girl.png'
const girlRevealImage = '/assets/echo-girl-reveal.png'
function GlowCursor() {
  const layerRef = useRef(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return undefined

    const layer = layerRef.current
    const particles = Array.from(layer.querySelectorAll('.glow-cursor-particle'))
    const positions = particles.map(() => ({ x: 0, y: 0 }))
    let targetX = 0
    let targetY = 0
    let hasPosition = false
    let frame = 0

    const move = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!hasPosition) {
        positions.forEach((position) => { position.x = targetX; position.y = targetY })
        hasPosition = true
      }
      layer.classList.add('is-visible')
    }
    const hide = (event) => {
      if (!event.relatedTarget) layer.classList.remove('is-visible')
    }
    const render = () => {
      if (hasPosition) {
        positions[0].x = targetX
        positions[0].y = targetY
        particles.forEach((particle, index) => {
          particle.style.transform = `translate3d(${positions[index].x - 21}px,${positions[index].y - 21}px,0)`
        })
      }
      frame = requestAnimationFrame(render)
    }

    document.documentElement.classList.add('has-glow-cursor')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('mouseout', hide)
    frame = requestAnimationFrame(render)

    return () => {
      document.documentElement.classList.remove('has-glow-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('mouseout', hide)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div className="glow-cursor-layer" ref={layerRef} aria-hidden="true">
    <img className="glow-cursor-particle glow-cursor-main" src="/assets/neon-cursor.png" alt="" />
  </div>
}

function FloatingHeader({ active = 'home', backHref }) {
  return <>
    <header className="floating-header">
      <a className="orbit-mark" href="/" aria-label="Echo 首页"><span /><span /><span /><span /></a>
      <nav className="orbit-nav" aria-label="主导航">
        <a className={active === 'home' ? 'is-active' : ''} href="/">Home丨首页</a>
        <div className="orbit-nav-dropdown">
          <a className={active === 'design' ? 'is-active' : ''} href="/design">Design work丨平面作品</a>
          <div className="orbit-nav-menu" aria-label="平面作品分类">
            <a href="/website-design">网站设计</a>
            <a href="/amazon-store-design">亚马逊旗舰店设计</a>
            <a href="/detail-page-design">详情页设计</a>
            <a href="/commercial-design">商业设计</a>
            <a href="/vi-design">VI 设计</a>
          </div>
        </div>
        <a className={active === 'video' ? 'is-active' : ''} href="/video">video丨视频</a>
        <a href="/#contact">Contact丨联系</a>
      </nav>
      <a href="/#contact" className="orbit-pill">CONTACT <b>↗</b></a>
    </header>
    {backHref && <a className="floating-back" href={backHref} aria-label="返回上一层页面"><span aria-hidden="true">←</span><b>返回</b></a>}
  </>
}
function PortfolioNav({ activeTab = '', backHref }) {
  const jumpToSection = (event, selector) => {
    const target = document.querySelector(selector)
    if (!target) return
    event.preventDefault()
    const targetTop = window.scrollY + target.getBoundingClientRect().top
    window.history.replaceState(null, '', selector)
    window.scrollTo({ top: targetTop, behavior: 'instant' })
  }
  return createPortal(<>
    <nav className="journey-tabs" aria-label="网站导航">
      <a className={activeTab === 'home' ? 'is-active' : ''} href="/">首页</a>
      <a className={activeTab === 'about' ? 'is-active' : ''} href="/#about">关于我</a>
      <a className={activeTab === 'experience' ? 'is-active' : ''} href="/#journey-experience">工作经历</a>
      <a className={activeTab === 'work' ? 'is-active' : ''} href="#work" onClick={event => jumpToSection(event, '#work')}>个人作品</a>
      <a className={activeTab === 'strength' ? 'is-active' : ''} href="#strength" onClick={event => jumpToSection(event, '#strength')}>个人优势</a>
      <a className={activeTab === 'contact' ? 'is-active' : ''} href="#contact" onClick={event => jumpToSection(event, '#contact')}>联系我</a>
    </nav>
    {backHref && <a className="floating-back" href={backHref} aria-label="返回上一层页面"><span aria-hidden="true">←</span><b>返回</b></a>}
  </>, document.body)
}

const marqueeWords = ['VISUAL DESIGN', 'ART DIRECTION', 'BRAND IDENTITY', '3D MOTION', 'AI CREATIVE']

function MarqueeStrip() {
  const group = marqueeWords.map((word) => <span className="marquee-item" key={word}>
    <span>{word}</span><i aria-hidden="true">✦</i>
  </span>)

  return <div className="marquee-strip" aria-label={marqueeWords.join(', ')}>
    <div className="marquee-track">
      <div className="marquee-group">{group}</div>
      <div className="marquee-group" aria-hidden="true">{group}</div>
    </div>
  </div>
}

function OrbitHero() {
  const stageRef = useRef(null)
  const flowerRef = useRef(null)
  const frontRef = useRef(null)
  const revealRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    const flower = flowerRef.current
    const front = frontRef.current
    const reveal = revealRef.current
    const canvas = document.createElement('canvas')
    const frontCanvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const frontCtx = frontCanvas.getContext('2d')
    let frame, hovering = false, headRadius = 0, last = null, time = 0
    let points = []
    const resize = () => { const r = flower.getBoundingClientRect(); const width = Math.max(1, Math.round(r.width)); const height = Math.max(1, Math.round(r.height)); canvas.width = width; canvas.height = height; frontCanvas.width = width; frontCanvas.height = height }
    const addPoint = event => {
      const r = flower.getBoundingClientRect(), x = event.clientX - r.left, y = event.clientY - r.top
      if (x < 0 || y < 0 || x > r.width || y > r.height) return
      if (!last || Math.hypot(x - last.x, y - last.y) > 8) { points.push({ x, y, r: headRadius, alpha: 1, seed: Math.random() * 100 }); points = points.slice(-60); last = { x, y } }
    }
    const blob = (context, x, y, radius, alpha, seed) => {
      if (radius < 2) return
      const nodes = Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; const noise = (Math.sin(a * 3 + time * 1.4 + seed) * .45 + Math.sin(a * 5 - time * .9 + seed * 2.3) * .3 + Math.cos(a * 2 + time * 1.8 + seed * .7) * .25) * 44 * (radius / 140); return [x + Math.cos(a) * (radius + noise), y + Math.sin(a) * (radius + noise)] })
      context.globalAlpha = alpha; context.beginPath(); context.moveTo((nodes[0][0] + nodes[1][0]) / 2, (nodes[0][1] + nodes[1][1]) / 2)
      nodes.forEach((node, i) => { const next = nodes[(i + 1) % nodes.length]; context.quadraticCurveTo(node[0], node[1], (node[0] + next[0]) / 2, (node[1] + next[1]) / 2) }); context.closePath(); context.fill()
    }
    const draw = () => {
      headRadius += ((hovering ? 140 : 0) - headRadius) * (hovering ? .14 : .04); time += .016
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#fff'; points.forEach(p => blob(ctx, p.x, p.y, p.r, p.alpha, p.seed))
      frontCtx.globalCompositeOperation = 'source-over'; frontCtx.globalAlpha = 1; frontCtx.fillStyle = '#fff'; frontCtx.fillRect(0, 0, frontCanvas.width, frontCanvas.height); frontCtx.globalCompositeOperation = 'destination-out'; frontCtx.fillStyle = '#fff'; points.forEach(p => blob(frontCtx, p.x, p.y, p.r, p.alpha, p.seed)); frontCtx.globalCompositeOperation = 'source-over'
      const trail = canvas.toDataURL(), frontMask = frontCanvas.toDataURL(); front.style.maskImage = `url(${frontMask})`; front.style.webkitMaskImage = `url(${frontMask})`; reveal.style.maskImage = `url(${trail})`; reveal.style.webkitMaskImage = `url(${trail})`
      points = points.map(p => ({ ...p, alpha: p.alpha * .92, r: p.r * .995 })).filter(p => p.alpha > .01); frame = requestAnimationFrame(draw)
    }
    const enter = () => { hovering = true }; const leave = () => { hovering = false; last = null }; const move = event => { if (hovering && headRadius > 5) addPoint(event) }
    resize(); const observer = new ResizeObserver(resize); observer.observe(flower); stage.addEventListener('mouseenter', enter); stage.addEventListener('mouseleave', leave); stage.addEventListener('mousemove', move); frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); stage.removeEventListener('mouseenter', enter); stage.removeEventListener('mouseleave', leave); stage.removeEventListener('mousemove', move) }
  }, [])

  return <section className="orbit-stage" id="top" ref={stageRef}>
    <h1 className="orbit-word" aria-label="Echo"><span className="orbit-word-mask"><span className="orbit-word-inner"><span className="orbit-white"><span className="orbit-o">E</span>C</span><span className="orbit-pink">HO</span></span></span></h1>
    <div className="orbit-flower" ref={flowerRef}><img className="orbit-sizer" src={girlRevealImage} alt="" aria-hidden="true" /><div className="orbit-layer orbit-front" ref={frontRef}><img src={girlRevealImage} alt="网点风格女孩插画" /></div><div className="orbit-layer orbit-reveal" ref={revealRef} aria-hidden="true"><img src={girlImage} alt="" /></div></div>
    <div className="orbit-stickers" aria-hidden="true"><span className="orbit-sticker orbit-sticker--spark">✦</span><span className="orbit-sticker orbit-sticker--arrow">↗</span><span className="orbit-sticker orbit-sticker--stamp">AI<br />CRAFT<br /><i>01</i></span><span className="orbit-sticker orbit-sticker--label">VISUAL<br />SIGNAL · 2026</span></div>
    <p className="orbit-corner orbit-corner-left">Every image, <br />intelligently composed.</p><p className="orbit-corner orbit-corner-right">Less generic design.<br />More memorable output.</p>
  </section>
}
const motionReels = [
  { src: '/assets/motion-reel-01.mp4', poster: '/assets/reel-cover-01.jpg', kicker: '01. TFIT / PRODUCT FILM', name: 'MAKE IT MOVE', detail: '产品 3D 渲染与动态视觉，将性能、光感与情绪凝成一段产品电影。' },
  { src: '/assets/motion-reel-02.mp4', poster: '/assets/reel-cover-02.jpg', kicker: '02. PRODUCT / CONTENT', name: 'STORIES IN FRAME', detail: '用镜头和场景，把产品卖点变成更具沉浸感的内容叙事。' },
  { src: '/assets/motion-reel-03.mp4', poster: '/assets/reel-cover-03.png', kicker: '03. BRAND / DIGITAL', name: 'BRAND IN MOTION', detail: '让品牌语言在动态、网页与每一次数字触点中保持一致。' },
  { poster: '/assets/reel-cover-04.png', kicker: '04. E-COMMERCE / A+', name: 'DETAILS THAT SELL', detail: '为跨境电商建立更清晰、更有感知力的商品详情体验。' },
  { src: '/assets/amazon-ai-prompts.mp4', poster: '/assets/amazon-ai-prompts-cover.png', kicker: '05. AI / E-COMMERCE', name: 'AI生成小风扇场景视频', detail: 'AI 辅助电商视觉创作，演示亚马逊主图与 A+ 内容的提示词生成流程。' },
]

const videoStoryboards = [
  '/assets/video-storyboard-04.jpg',
  '/assets/video-storyboard-05.jpg',
  '/assets/video-storyboard-06.jpg',
  '/assets/video-storyboard-07.jpg',
]

function MotionReels() { return <div id="reels"><ScrollStack items={motionReels} /></div> }

function VideoCardShowcase() {
  const videos = motionReels.filter((item) => item.src)
  const stackedVideos = videos.filter((_, index) => index !== 1)
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    if (!activeVideo) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setActiveVideo(null) }
    document.body.classList.add('has-video-modal')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('has-video-modal')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeVideo])

  return <>
    <section className="video-card-section">
      <div className="shell video-card-layout">
        <div className="video-card-intro"><span>SELECT A CARD</span><h2>点击卡片<br/><i>播放视频</i></h2><p>卡片会自动轮换，也可以将鼠标停在卡片上仔细选择。</p></div>
        <div className="video-card-stage">
          <CardSwap width={774} height={487} cardDistance={66} verticalDistance={120} delay={5000} pauseOnHover skewAmount={3} easing="linear" onCardClick={(index) => setActiveVideo(stackedVideos[index])}>
            {stackedVideos.map((video, index) => <Card className="video-swap-card" key={video.src} role="button" tabIndex="0" aria-label={`播放 ${video.name}`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveVideo(video) }}>
              <img src={video.poster} alt="" />
              <span className="video-swap-shade" />
              <span className="video-swap-number">0{index + 1}</span>
              <span className="video-swap-copy"><small>{video.kicker}</small><strong>{video.name}</strong></span>
              <span className="video-swap-play">▶</span>
            </Card>)}
          </CardSwap>
        </div>
      </div>
    </section>
    <section className="video-library" aria-labelledby="video-library-title">
      <div className="shell">
        <div className="video-library-heading">
          <span>ALL VIDEOS / 全部视频</span>
          <h2 id="video-library-title">VIDEO <i>COLLECTION</i></h2>
        </div>
        <div className="video-library-grid">
          {videos.map((video, index) => <article className="video-library-item" key={video.src}>
            <video src={video.src} poster={video.poster} controls playsInline preload="none" aria-label={video.name} />
            <div><small>{String(index + 1).padStart(2, '0')} · {video.kicker}</small><h3>{video.name}</h3><p>{video.detail}</p></div>
          </article>)}
        </div>
      </div>
    </section>
    <section className="video-storyboards" aria-label="TFIT 产品动画项目展示">
      <div className="shell video-storyboard-list">
        {videoStoryboards.map((image, index) => <figure key={image}>
          <img src={image} alt={`TFIT 产品动画项目展示 ${index + 1}`} loading="lazy" />
        </figure>)}
      </div>
    </section>
    {activeVideo && <div className="video-modal" role="dialog" aria-modal="true" aria-label={activeVideo.name} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveVideo(null) }}>
      <button type="button" className="video-modal-close" onClick={() => setActiveVideo(null)} aria-label="关闭视频">×</button>
      <div className="video-modal-panel"><video src={activeVideo.src} poster={activeVideo.poster} controls autoPlay playsInline /><div><small>{activeVideo.kicker}</small><h2>{activeVideo.name}</h2><p>{activeVideo.detail}</p></div></div>
    </div>}
  </>
}

const viProjects = [
  { slug: 'sillroot', number: '01', title: 'SILLROOT', english: 'NATURAL WOODY FRAGRANCE', description: '天然木质香氛品牌视觉识别与包装应用。', image: '/assets/vi-design/sillroot/sillroot-01.jpg', works: Array.from({ length: 14 }, (_, index) => `/assets/vi-design/sillroot/sillroot-${String(index + 1).padStart(2, '0')}.jpg`) },
  { slug: 'tfit', number: '02', title: 'TFIT', english: 'E-CIGARETTE BRAND IDENTITY', description: '电子烟品牌视觉识别与触点设计。', image: '/assets/vi-design/vi-design-01.jpg', works: Array.from({ length: 23 }, (_, index) => `/assets/vi-design/vi-design-${String(index + 1).padStart(2, '0')}.jpg`) },
]
const designCategories = [
  { slug: 'vi-design', number: '01', title: 'VI 设计', english: 'VISUAL IDENTITY', image: '/assets/vi-design/vi-design-01.jpg', description: '从品牌理念到视觉规范，构建统一而鲜明的品牌识别系统。', works: [] },
  { slug: 'amazon-store-design', number: '02', title: '亚马逊旗舰店设计', english: 'AMAZON FLAGSHIP STORE', image: '/assets/design-cover-amazon-store.jpg', description: '围绕品牌与产品建立完整的店铺视觉。', works: ['/assets/amazon-store-01.jpg', '/assets/amazon-store-02.jpg', '/assets/amazon-store-03.jpg', '/assets/amazon-store-04.jpg', '/assets/amazon-store-05.jpg', '/assets/amazon-store-06.jpg', '/assets/amazon-store-07.jpg', '/assets/amazon-store-08.jpg', '/assets/amazon-store-09.jpg', '/assets/amazon-store-10.jpg'] },
  { slug: 'detail-page-design', number: '03', title: '详情页设计', english: 'PRODUCT DETAIL PAGE', image: '/assets/design-cover-detail-page.jpg', description: '从产品卖点到场景化内容的清晰表达。', works: ['/assets/detail-preview-01.jpg', '/assets/detail-preview-02.png', '/assets/detail-preview-03.jpg', '/assets/detail-preview-04.png', '/assets/detail-preview-05-foldable-headphones.jpg', '/assets/detail-preview-06-aebar-blueberry.png', '/assets/detail-preview-07-cat-fountain.png', '/assets/detail-preview-08-handheld-fan.jpg'] },
  { slug: 'commercial-design', number: '04', title: '商业设计', english: 'COMMERCIAL DESIGN', image: '/assets/design-cover-commercial.jpg', description: '品牌活动、视觉传播与商业内容设计。', works: ['/assets/work-showcase-04.jpg', '/assets/work-showcase-05.jpg', '/assets/work-showcase-02.jpg'] },
  { slug: 'video-work', href: '/video', number: '05', title: '视频作品', english: 'VIDEO / MOTION', image: '/assets/motion-reel-01-poster.jpg', description: '产品动画、品牌动态与视频内容精选。', works: [] },
  { slug: 'website-design', number: '06', title: '网站设计', english: 'WEBSITE DESIGN', image: '/assets/design-cover-website.jpg', description: '品牌官网与数字界面的视觉体验。', works: ['/assets/website-design-08.jpg', '/assets/website-design-09.jpg', '/assets/website-design-10.jpg', '/assets/website-design-11.jpg'] },
]

const detailWorkSections = {
  0: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-01-main-01.jpg', '/assets/detail-work-01-main-02.jpg', '/assets/detail-work-01-main-03.jpg', '/assets/detail-work-01-main-04.jpg', '/assets/detail-work-01-main-05.jpg', '/assets/detail-work-01-main-06.jpg', '/assets/detail-work-01-main-07.jpg', '/assets/detail-work-01-main-08.jpg', '/assets/detail-work-01-main-09.jpg', '/assets/detail-work-01-main-10.jpg'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-01-aplus-01.png', '/assets/detail-work-01-aplus-02.png', '/assets/detail-work-01-aplus-03.png', '/assets/detail-work-01-aplus-05a.png', '/assets/detail-work-01-aplus-05b.png', '/assets/detail-work-01-aplus-05c.png', '/assets/detail-work-01-aplus-05d.png', '/assets/detail-work-01-aplus-05e.png', '/assets/detail-work-01-aplus-06a.png', '/assets/detail-work-01-aplus-06b.png', '/assets/detail-work-01-aplus-07a.png', '/assets/detail-work-01-aplus-07b.png', '/assets/detail-work-01-aplus-07c.png', '/assets/detail-work-01-aplus-07d.png'],
  }],
  1: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-02-main-01.png', '/assets/detail-work-02-main-02.png', '/assets/detail-work-02-main-03.png', '/assets/detail-work-02-main-04.png', '/assets/detail-work-02-main-05.png', '/assets/detail-work-02-main-06.png', '/assets/detail-work-02-main-07.png', '/assets/detail-work-02-main-08.png'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-02-aplus-01.png', '/assets/detail-work-02-aplus-02.png', '/assets/detail-work-02-aplus-03a-v2.png', '/assets/detail-work-02-aplus-03b.png', '/assets/detail-work-02-aplus-03c.png', '/assets/detail-work-02-aplus-03d.png', '/assets/detail-work-02-aplus-04.png', '/assets/detail-work-02-aplus-05a.png', '/assets/detail-work-02-aplus-05b.png', '/assets/detail-work-02-aplus-05c.png', '/assets/detail-work-02-aplus-06a-v2.png', '/assets/detail-work-02-aplus-06b.png'],
    carouselGroups: [[2, 3, 4, 5], [7, 8, 9], [10, 11]],
  }],
  2: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-03-main-card-01.jpg', '/assets/detail-work-03-main-card-02.png', '/assets/detail-work-03-main-card-03.png', '/assets/detail-work-03-main-card-04.png'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-03-main-01.png', '/assets/detail-work-03-main-02.png', '/assets/detail-work-03-main-03.png', '/assets/detail-work-03-main-04.png', '/assets/detail-work-03-main-05.png', '/assets/detail-work-03-main-06.png', '/assets/detail-work-03-main-07.png'],
  }],
  3: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-04-main-01.png', '/assets/detail-work-04-main-02.png', '/assets/detail-work-04-main-04.png', '/assets/detail-work-04-main-05.png', '/assets/detail-work-04-main-03.png'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-04-aplus-01.png', '/assets/detail-work-04-aplus-02.png', '/assets/detail-work-04-aplus-03.png', '/assets/detail-work-04-aplus-04.png', '/assets/detail-work-04-aplus-05.png', '/assets/detail-work-04-aplus-06.png', '/assets/detail-work-04-aplus-07.png'],
  }],
  4: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-05-main-01.png', '/assets/detail-work-05-main-02.png', '/assets/detail-work-05-main-03.png', '/assets/detail-work-05-main-04.png', '/assets/detail-work-05-main-05.png', '/assets/detail-work-05-main-06.png', '/assets/detail-work-05-main-07.png', '/assets/detail-work-05-main-08.png'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-05-aplus-01.jpg', '/assets/detail-work-05-aplus-02.jpg', '/assets/detail-work-05-aplus-03a.jpg', '/assets/detail-work-05-aplus-03b.jpg', '/assets/detail-work-05-aplus-03c.jpg', '/assets/detail-work-05-aplus-03d.jpg', '/assets/detail-work-05-aplus-03e.jpg', '/assets/detail-work-05-aplus-04a.jpg', '/assets/detail-work-05-aplus-04b.jpg', '/assets/detail-work-05-aplus-04c.jpg', '/assets/detail-work-05-aplus-04d.jpg', '/assets/detail-work-05-aplus-04e.jpg', '/assets/detail-work-05-aplus-05.jpg'],
    carouselGroups: [[2, 3, 4, 5, 6], [7, 8, 9, 10, 11]],
  }],
  5: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/commercial-social/4f604f8b9b330dccebceb88bb739b997.PNG', '/assets/commercial-social/5c84aced1c66ab9d185be1185287ba45.PNG', '/assets/commercial-social/6b4e87f2dfb3a312247bcc55f7eda280.PNG', '/assets/commercial-social/60c344a7502f09942e3a9bd17780fd1f.PNG', '/assets/commercial-social/751106d6af88fa8ccba5da48cd73bb3b.PNG', '/assets/commercial-social/b074faf3b1b4fd1e3897b3d450049adf.PNG', '/assets/commercial-social/b596bdb895af94f8cc144c6b06ff9779.PNG', '/assets/commercial-social/f2da4ff6cbd48a16878e6c4684386c4d.PNG'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-06-aplus-01.jpg', '/assets/detail-work-06-aplus-02.jpg', '/assets/detail-work-06-aplus-03.jpg', '/assets/detail-work-06-aplus-04.jpg', '/assets/detail-work-06-aplus-05.jpg', '/assets/detail-work-06-aplus-06.jpg'],
  }],
  6: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-07-main-01.png', '/assets/detail-work-07-main-02.png', '/assets/detail-work-07-main-03.png', '/assets/detail-work-07-main-04.png', '/assets/detail-work-07-main-05.png', '/assets/detail-work-07-main-06.png'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: [],
  }],
  7: [{
    label: 'MAIN IMAGES / 主图',
    layout: 'stack',
    images: ['/assets/detail-work-08-main-01.png', '/assets/detail-work-08-main-03.jpg', '/assets/detail-work-08-main-04.jpg', '/assets/detail-work-08-main-05.jpg', '/assets/detail-work-08-main-02.jpg', '/assets/detail-work-08-main-06.jpg', '/assets/detail-work-08-main-07.jpg', '/assets/detail-work-08-main-08.jpg', '/assets/detail-work-08-main-09.jpg'],
  }, {
    label: 'A+ CONTENT / A+ 设计',
    layout: 'aplus',
    images: ['/assets/detail-work-08-aplus-01.jpg', '/assets/detail-work-08-aplus-02.jpg', '/assets/detail-work-08-aplus-03.jpg', '/assets/detail-work-08-aplus-04.jpg', '/assets/detail-work-08-aplus-05.jpg', '/assets/detail-work-08-aplus-06.jpg', '/assets/detail-work-08-aplus-07.jpg'],
  }],
}

const commercialDesignSections = [
  { number: '02', title: '海报图片', english: 'POSTER DESIGN' },
  { number: '01', title: '社媒图片', english: 'SOCIAL MEDIA' },
  { number: '03', title: '包装设计', english: 'PACKAGING DESIGN' },
  { number: '04', title: '展会设计', english: 'EXHIBITION DESIGN' },
]

const commercialSocialGroups = [
  { number: '01', title: 'TFIT NOVA MAX', subtitle: 'TECH IN NIGHT', accent: '#37f78b', images: ['8d0b045cf0923ed6f89e45351df1d6aa.PNG', '8e2be307387a6d83b5f02d02bf231ec3.PNG', '560f532ce47d8382df2312b936bc7ba8.PNG', 'b9c2e77a27adb1777f46bd5c51483ef4.PNG', 'f880945c797c49a18ae3409710e360eb.PNG'] },
  { number: '02', title: 'AE BAR 15K', subtitle: 'CHARACTER FLAVOR SERIES', accent: '#fd86db', images: ['4f604f8b9b330dccebceb88bb739b997.PNG', '5c84aced1c66ab9d185be1185287ba45.PNG', '6b4e87f2dfb3a312247bcc55f7eda280.PNG', '60c344a7502f09942e3a9bd17780fd1f.PNG', '4069df8d91216823bb094b7258b88b3b.PNG', '751106d6af88fa8ccba5da48cd73bb3b.PNG', 'b074faf3b1b4fd1e3897b3d450049adf.PNG', 'b596bdb895af94f8cc144c6b06ff9779.PNG', 'f2da4ff6cbd48a16878e6c4684386c4d.PNG'] },
  { number: '03', title: 'INFY 15,000', subtitle: 'NEW FLAVORS SERIES', accent: '#72f13f', images: ['148a9f1d1f973f022ddf691f2c4d67ed.PNG', 'c7ad68d474c2898abec1bbe0dcafd15f.PNG', '74f5868e451e4688370d276827fff8a5.PNG', '54a393e40f6ef39fb8afb6c4b3cd5fc7.PNG', 'e34133adc58b9186fb72482558bf4313.PNG'] },
  { number: '04', title: 'DOLPHIN BAR', subtitle: 'ANIMAL ILLUSTRATION SERIES', accent: '#f7a52d', images: ['857a486f0a6444e00c966d66b5f3bf53.JPG', '1f581427ced7c5c89b0fccafecaa7325.JPG', '8f391a9400dd6ec381759968196620a8.JPG', '4560180ae99a5d8e4ab0b41e0dae3869.JPG', 'c0fddc2afa86ab0a9a83918e3146bf6c.JPG', 'f99dea1a7f0e8cb02e1e5f3e6c58b90e.JPG', 'f4604a7d75227af40f5f8060c8e63283.JPG'] },
  { number: '05', title: 'AE BAR 30W', subtitle: 'PRODUCT & FLAVOR CAMPAIGN', accent: '#6ebcff', images: ['660aecd52370d11d2f99d4595258e0ef.PNG', '5cf4ed8fe8d9f5d34c1a1fc83bac8968.JPG', '6db031c8dcc0d9ebd5576899ac6bbc6e.PNG', 'ce01b244c8db2a07f3f97fe085bfa368.JPG', '04bb2138f935aff84f082c5f4bb45900.PNG', 'be39ba98521d26449f3c8e4fc461503d.PNG', 'd2b6ea0d79f98e24b8bd153904313104.PNG', 'e3adcae48f7748039dd86ccbcb7fc080.PNG', 'f6777a4fb4851e9e5244e6ac1a9294ba.PNG'] },
  { number: '06', title: 'TEX BAR', subtitle: 'COLORFUL LIFESTYLE SERIES', accent: '#ff70ad', images: ['3c39c326f64332a824be3aeffcf06072.PNG', '9e6f2b6f09df9b91c078172c7ba8cce2.JPG', 'af658b7c35f7ed1c47e0d0dba3413075.PNG'] },
  { number: '07', title: 'ICE + NIC', subtitle: 'ADJUSTABLE DISPOSABLE', accent: '#20c8ff', images: ['1866810036ed38bc134bfccdf779ef38.JPG', 'd82dec0ded229457f8d5b9100b84ff04.JPG', '41a2b9da885735cfe87bd406b334c55c.PNG'] },


].map((group) => ({ ...group, images: group.images.map((image) => `/assets/commercial-social/${image}`) }))
const commercialPosterGroups = [
  { number: '01', title: 'PRODUCT SERIES', subtitle: 'AE BAR COLLECTION', accent: '#b9ef26', images: ['4a8f58509c79785a6b19abc6d26f4863.PNG', '93aa23d19a127a957a5e965322169318.PNG', '9bb1bb64ed2d80a58e020690757f789f.PNG', '9cf9898a5c9475dcd03b9e8c55b78006.PNG', '6217c320fd8049ab21c80df94814847a.PNG', 'c8f01aeabb996e5aa1dd40afee9f62c8.PNG', 'b7a12619882a072efed7bf09da8852e9.PNG'] },
  { number: '02', title: 'FESTIVE CAMPAIGN', subtitle: 'NEW YEAR & CHRISTMAS', accent: '#ff4141', images: ['5ff908ea50e278d568dc128d691c05ce.JPG', '6fba6e3245f8c26b91249d71431dba8b.PNG', '24b689b631b0a33c507440c51b4cca01.PNG', '91bf9b1d84cc51ab05b607bb16b69ea5.JPG'] },

  { number: '03', title: 'CREATIVE LIFESTYLE', subtitle: 'BRAND VISUAL', accent: '#fd86db', images: ['ChatGPT Image 2026年9月14日 11_03_02.png', '小风扇海报.jpg', '饮水机海报.jpg'] },
].map((group) => ({ ...group, images: group.images.map((image) => `/assets/commercial-posters/${image}`) }))
const commercialPackagingGroups = [
  { number: '01', title: 'AE BAR POD 6000', subtitle: 'PACKAGING COLLECTION', accent: '#ff8fc4', images: ['1c9b4ebeac14610d6a8294f675bfe3a6.PNG', '8a71971884469ae89d455e358b389126.PNG', '57e01606e68043879fb8812180498e6e.PNG', 'b98eee06f24c914de14751cf5a54aecd.PNG', 'c633a685e0541127173a8e65f27a5e1c.PNG', 'f0b26584149d0a3e847134db1f482afe.PNG', '6b9032d4985926dbfdca923dca63d993.PNG', '9964cf7e3a9a422cd3f7bc94150b9a29.PNG', 'f880945c797c49a18ae3409710e360eb.PNG'] },
  { number: '02', title: 'AE BAR CAPSULE', subtitle: 'FLAVOR PACKAGING SYSTEM', accent: '#ffca55', images: ['7c3bbb697439d8715c87043df07b3af8.PNG', '9e575c9fe5685f57fcfe3ffc7c9de345.PNG', '7377f5104d8f0a964f296a74a9394fc8.PNG', '495102f5f40a6ff2e6c0edc5b2da568a.PNG'] },
].map((group) => ({ ...group, images: group.images.map((image) => `/assets/commercial-packaging/${image}`) }))
const commercialExhibitionGroups = [
  { number: '01', title: 'TFIT EXHIBITION', subtitle: 'BOOTH & ON-SITE VISUALS', accent: '#69ff38', images: ['微信图片_20250908144603_8_256.jpg', 'C3799E45-106C-4184-8E1C-39B89E314918-26868-0000092990B0FF4C.PNG', '展会折页2.jpg', '展会折页1.jpg', 'afac9ae64b2ef3d97ddeca6a492782e4.JPG'] },
  { number: '02', title: 'BRAND MATERIALS', subtitle: 'APPAREL & GIVEAWAYS', accent: '#b7ff42', images: ['65e0388c73e8cf4a0c0bfdf01270506b.PNG', '78278f6faa3c94e23c038e5056e05843.PNG', 'a71abf3d16327f47ab7751fe6e71986a.PNG', '94f9006fe8fcd70efbf8ce992b16859a.jpg', 'ac14fc99b3d78542ffd45047192c84d5.PNG', 'IMG_8483.PNG'] },
].map((group) => ({ ...group, images: group.images.map((image) => `/assets/commercial-exhibition/${image}`) }))
const emptyDetailWorkSections = [
  { label: 'MAIN IMAGES / 主图', layout: 'stack', images: [] },
  { label: 'A+ CONTENT / A+ 设计', layout: 'aplus', images: [] },
]

function DesignCategoryLinks() {
  return <div className="design-category-grid">
    {designCategories.map((category) => <a className="design-category-card" href={category.href ?? `/${category.slug}`} key={category.slug}>
      <img src={category.image} alt="" />
      <span className="design-category-shade" />
      <span className="design-category-number">{category.number}</span>
      <span className="design-category-copy"><small>{category.english}</small><strong>{category.title}</strong></span>
      <b aria-hidden="true">↗</b>
    </a>)}
  </div>
}

function CommercialDesignShowcase() {
  const [selectedImage, setSelectedImage] = useState(null)
  useEffect(() => {
    if (!selectedImage) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSelectedImage(null) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedImage])
  return <section className="commercial-design-showcase"><div className="shell">
    {commercialDesignSections.map((section) => <section className="commercial-design-section" id={`commercial-${section.number}`} key={section.number}>
      <header className="commercial-design-section-title"><span>{section.number}</span><div><small>{section.english}</small><h2>{section.title}</h2></div></header>
      {section.number === '01' || section.number === '02' || section.number === '03' || section.number === '04' ? <div className={`commercial-social-groups${section.number === '02' ? ' commercial-social-groups--poster' : ''}${section.number === '03' ? ' commercial-social-groups--packaging' : ''}${section.number === '04' ? ' commercial-social-groups--exhibition' : ''}`}>
        {(section.number === '01' ? commercialSocialGroups : section.number === '02' ? commercialPosterGroups : section.number === '03' ? commercialPackagingGroups : commercialExhibitionGroups).map((group) => <article className="commercial-social-group" style={{ '--group-accent': group.accent }} key={group.title}>
          <header className="commercial-social-group-title"><span>{group.number}</span><div><small>{group.subtitle}</small><h3>{group.title}</h3></div><b>{String(group.images.length).padStart(2, '0')} IMAGES</b></header>
          <div className={`commercial-social-grid commercial-social-grid--${group.images.length === 1 ? 'single' : group.images.length <= 3 ? 'compact' : 'bento'}`}>
            {group.images.map((image, imageIndex) => <button className={`commercial-social-card${imageIndex === 0 ? ' commercial-social-card--feature' : ''}`} type="button" onClick={() => setSelectedImage({ image, alt: `${group.title} ${section.number === '02' ? '海报' : section.number === '03' ? '包装设计' : section.number === '04' ? '展会物料' : '社媒设计'} ${imageIndex + 1}` })} aria-label={`放大查看 ${group.title} ${section.number === '02' ? '海报' : section.number === '03' ? '包装设计' : section.number === '04' ? '展会物料' : '社媒设计'} ${imageIndex + 1}`} key={image}>
              <img src={image} alt={`${group.title} ${section.number === '02' ? '海报' : section.number === '03' ? '包装设计' : section.number === '04' ? '展会物料' : '社媒设计'} ${imageIndex + 1}`} loading="lazy" decoding="async" />
              <span><i>{String(imageIndex + 1).padStart(2, '0')}</i><b>VIEW ↗</b></span>
            </button>)}
          </div>
        </article>)}
      </div> : <div className="commercial-design-placeholder"><span>图片待上传</span><small>IMAGES COMING SOON</small></div>}
    </section>)}
    {selectedImage && <div className="work-detail-lightbox" role="dialog" aria-modal="true" aria-label="社媒图片放大预览" onClick={() => setSelectedImage(null)}>
      <button className="work-detail-lightbox-close" type="button" onClick={() => setSelectedImage(null)} aria-label="关闭放大预览">×</button>
      <img src={selectedImage.image} alt={selectedImage.alt} onClick={(event) => event.stopPropagation()} />
    </div>}
  </div></section>
}
function ViDesignShowcase({ project }) {
  if (project) return <section className="category-showcase vi-project-showcase"><div className="shell">
    {project.works.map((image, index) => <figure key={image}><img src={image} alt={`${project.title} VI 设计第 ${index + 1} 页`} loading={index > 1 ? 'lazy' : undefined} decoding="async" /><figcaption><span>{String(index + 1).padStart(2, '0')}</span><span>{project.title} / VISUAL IDENTITY</span></figcaption></figure>)}
  </div></section>

  return <section className="vi-project-index"><div className="shell"><div className="vi-project-grid">
    {viProjects.map((item) => <a className={`vi-project-card vi-project-card--${item.slug}`} href={`/vi-design?brand=${item.slug}`} key={item.slug}>
      <img src={item.image} alt={`${item.title} VI 设计封面`} />
      <span className="vi-project-card-shade" />
      <span className="vi-project-card-number">{item.number}</span>
      <span className="vi-project-card-copy"><small>{item.english}</small><strong>{item.title}</strong><em>{String(item.works.length).padStart(2, '0')} PAGES</em></span>
      <b aria-hidden="true">↗</b>
    </a>)}
  </div></div></section>
}

function DesignCategoryPage({ category }) {
  const requestedBrand = category.slug === 'vi-design' ? new URLSearchParams(window.location.search).get('brand') : null
  const viProject = requestedBrand ? viProjects.find((project) => project.slug === requestedBrand) : null
  return <main className={`secondary-page category-page category-page--${category.slug}`}>
    <PortfolioNav activeTab="work" backHref={viProject ? '/vi-design' : '/design'} />
    <section className="secondary-hero category-hero"><div className="shell">
      <p className="secondary-kicker">DESIGN WORK / {viProject?.english ?? category.english}</p>
      <h1>{viProject?.title ?? category.title}</h1>
      <p>{viProject?.description ?? category.description}</p>
    </div></section>
    {category.slug === 'vi-design' ? <ViDesignShowcase project={viProject} /> : category.slug === 'commercial-design' ? <CommercialDesignShowcase /> : <section className="category-showcase"><div className="shell">
      {category.works.map((image, index) => category.slug === 'detail-page-design'
        ? <a className="category-preview-link" href={`/${category.slug}?work=${index + 1}`} aria-label={`查看${category.title}作品 ${index + 1}`} key={image}><figure><img src={image} alt={`${category.title}作品 ${index + 1}`} /><figcaption><span>{String(index + 1).padStart(2, '0')}</span><span>{category.english}</span></figcaption></figure></a>
        : <figure key={image}><img src={image} alt={`${category.title}作品 ${index + 1}`} /><figcaption><span>{String(index + 1).padStart(2, '0')}</span><span>{category.english}</span></figcaption></figure>)}
    </div></section>}
    <footer className="secondary-footer"><div className="shell"><a href="/design">← 返回平面作品</a><a className="site-filing" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">粤ICP备2026141529号-1</a><a href="/#contact">联系我 ↗</a></div></footer>
  </main>
}

function MainImageCarousel({ images, alt }) {
  const visibleCount = Math.min(4, images.length)
  const [activeImage, setActiveImage] = useState(0)
  const [slideDirection, setSlideDirection] = useState('next')
  const [enlargedImage, setEnlargedImage] = useState(null)
  useEffect(() => {
    if (!enlargedImage) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') setEnlargedImage(null) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [enlargedImage])
  const previous = () => { setSlideDirection('previous'); setActiveImage((current) => (current - 1 + images.length) % images.length) }
  const next = () => { setSlideDirection('next'); setActiveImage((current) => (current + 1) % images.length) }
  const visibleImages = Array.from({ length: visibleCount }, (_, offset) => images[(activeImage + offset) % images.length])
  return <div className="work-detail-carousel">
    <button className="work-detail-carousel-arrow work-detail-carousel-arrow--previous" type="button" onClick={previous} aria-label="上一张主图">←</button>
    <div className={`work-detail-carousel-grid work-detail-carousel-grid--${slideDirection}`} key={activeImage}>{visibleImages.map((image, imageIndex) => <button className="work-detail-carousel-item" type="button" onClick={() => setEnlargedImage(image)} aria-label={`放大查看${alt} ${(activeImage + imageIndex) % images.length + 1}`} key={`${image}-${imageIndex}`}><img src={image} alt={`${alt} ${(activeImage + imageIndex) % images.length + 1}`} decoding="async" /></button>)}</div>
    <button className="work-detail-carousel-arrow work-detail-carousel-arrow--next" type="button" onClick={next} aria-label="下一张主图">→</button>
    <span className="work-detail-carousel-count">{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
    {enlargedImage && <div className="work-detail-lightbox" role="dialog" aria-modal="true" aria-label="主图放大预览" onClick={() => setEnlargedImage(null)}>
      <button className="work-detail-lightbox-close" type="button" onClick={() => setEnlargedImage(null)} aria-label="关闭放大预览">×</button>
      <img src={enlargedImage} alt={`${alt} 放大预览`} onClick={(event) => event.stopPropagation()} />
    </div>}
  </div>
}

function APlusCarousel({ images, alt }) {
  const [activeImage, setActiveImage] = useState(0)
  const [slideDirection, setSlideDirection] = useState('next')
  const previous = () => { setSlideDirection('previous'); setActiveImage((current) => (current - 1 + images.length) % images.length) }
  const next = () => { setSlideDirection('next'); setActiveImage((current) => (current + 1) % images.length) }
  return <div className="aplus-carousel">
    <img className={`aplus-carousel-image aplus-carousel-image--${slideDirection}`} src={images[activeImage]} alt={`${alt} ${activeImage + 1}`} decoding="async" key={images[activeImage]} />
    <button className="aplus-carousel-arrow aplus-carousel-arrow--previous" type="button" onClick={previous} aria-label="上一张 A+ 图片">←</button>
    <button className="aplus-carousel-arrow aplus-carousel-arrow--next" type="button" onClick={next} aria-label="下一张 A+ 图片">→</button>
    <span className="aplus-carousel-count">{String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
  </div>
}

function APlusGallery({ images, carouselGroups = [], alt }) {
  const groupedIndexes = new Set(carouselGroups.flat())
  const groupStarts = new Map(carouselGroups.map((group) => [group[0], group]))
  return <div className="work-detail-gallery work-detail-gallery--aplus">{images.map((image, imageIndex) => {
    const group = groupStarts.get(imageIndex)
    if (group) return <APlusCarousel images={group.map((index) => images[index])} alt={`${alt} 轮播`} key={`carousel-${imageIndex}`} />
    if (groupedIndexes.has(imageIndex)) return null
    return <img src={image} alt={`${alt} ${imageIndex + 1}`} loading={imageIndex > 1 ? 'lazy' : undefined} decoding="async" key={image} />
  })}</div>
}

function DesignWorkDetailPage({ category, sections, index }) {
  const number = String(index + 1).padStart(2, '0')
  return <main className={`secondary-page category-page category-page--${category.slug} work-detail-page`}>
    <PortfolioNav activeTab="work" backHref={`/${category.slug}`} />
    <section className="secondary-hero category-hero work-detail-hero"><div className="shell">
      <p className="secondary-kicker">{category.english} / WORK {number}</p>
      <h1>作品 {number}</h1>
      <p>完整设计画面</p>
    </div></section>
    <section className="work-detail-showcase"><div className="shell">
      {sections.map((section) => <div className="work-detail-section" key={section.label}>
        <div className="work-detail-section-title"><span>{section.label}</span><span>{section.images.length} IMAGES</span></div>
        {section.images.length === 0
          ? <div className={`work-detail-empty work-detail-empty--${section.layout}`}><span>图片待上传</span><small>IMAGES COMING SOON</small></div>
          : section.layout === 'stack'
            ? <MainImageCarousel images={section.images} alt={`${category.title}作品 ${index + 1} 主图`} />
            : section.layout === 'aplus'
              ? <APlusGallery images={section.images} carouselGroups={section.carouselGroups} alt={`${category.title}作品 ${index + 1} A+`} />
              : <div className={`work-detail-gallery work-detail-gallery--${section.layout ?? 'single'}`}>{section.images.map((image, imageIndex) => <img src={image} alt={`${category.title}作品 ${index + 1} ${section.label} ${imageIndex + 1}`} loading={imageIndex > 1 ? 'lazy' : undefined} decoding="async" key={image} />)}</div>}
      </div>)}
    </div></section>
    <footer className="secondary-footer"><div className="shell"><a href={`/${category.slug}`}>← 返回{category.title}</a><a className="site-filing" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">粤ICP备2026141529号-1</a><a href="/#contact">联系我 ↗</a></div></footer>
  </main>
}

function SecondaryPage({ type }) {
  const isDesign = type === 'design'
  return <main className="secondary-page">
    <PortfolioNav activeTab={isDesign ? 'work' : ''} backHref="/" />
    <section className="secondary-hero">
      <div className="shell">
        <p className="secondary-kicker">{isDesign ? 'DESIGN WORK / 平面作品' : 'VIDEO / 视频作品'}</p>
        <h1>{isDesign ? <>DESIGN <i>WORK.</i></> : <>VIDEO <i>WORK.</i></>}</h1>
        <p>{isDesign ? '品牌、电商、动态与数字视觉作品精选。' : '产品动画、品牌动态与视频内容精选。'}</p>
      </div>
    </section>
    {isDesign ? <section className="secondary-content"><div className="shell">
      <DesignCategoryLinks />
    </div></section> : <VideoCardShowcase />}
    <footer className="secondary-footer"><div className="shell"><a href="/">← 返回首页</a><a className="site-filing" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">粤ICP备2026141529号-1</a><a href="/#contact">联系我 ↗</a></div></footer>
  </main>
}

function PortfolioJourney() {
  const sectionRef = useRef(null)
  const portraitTiltRef = useRef(null)
  const experiencePanelRef = useRef(null)
  const [activeTab, setActiveTab] = useState('home')

  const handlePortraitMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return
    const portrait = event.currentTarget
    const tiltLayer = portraitTiltRef.current
    if (!tiltLayer) return
    const bounds = portrait.getBoundingClientRect()
    const horizontal = ((event.clientX - bounds.left) / bounds.width - .5) * 2
    const vertical = ((event.clientY - bounds.top) / bounds.height - .5) * 2
    tiltLayer.style.setProperty('--portrait-rotate-x', `${vertical * -8}deg`)
    tiltLayer.style.setProperty('--portrait-rotate-y', `${horizontal * 10}deg`)
  }

  const resetPortraitTilt = () => {
    const tiltLayer = portraitTiltRef.current
    if (!tiltLayer) return
    tiltLayer.style.setProperty('--portrait-rotate-x', '0deg')
    tiltLayer.style.setProperty('--portrait-rotate-y', '0deg')
  }

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    gsap.registerPlugin(ScrollTrigger)
    const stage = section.querySelector('.journey-stage')
    let replayAboutIntro = () => {}
    let prepareAboutIntro = () => {}
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=1900',
          pin: stage,
          scrub: 1.1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const isExperience = self.progress > .52
            section.classList.toggle('is-experience', isExperience)
            setActiveTab(isExperience ? 'experience' : 'about')
          },
          onLeaveBack: () => setActiveTab('home'),
          onLeave: () => setActiveTab('work'),
        },
      })

      const introTargets = '.journey-about-copy > *'
      const resetAboutIntro = () => {
        gsap.set('.journey-about-panel', { autoAlpha: 1 })
        gsap.set('.journey-about-copy', { autoAlpha: 1, x: 0, y: 0 })
        gsap.set(introTargets, { autoAlpha: 0, x: -72, y: 18 })
        gsap.set('.journey-portrait', { autoAlpha: 0, x: 90, scale: .74, rotate: 5 })
        gsap.set('.journey-deck', { autoAlpha: 1, x: 0, y: 0, scale: 1 })
        gsap.set('.journey-deck>p', { autoAlpha: 0, y: 42 })
        gsap.set('.journey-card-slot', { autoAlpha: 0, y: 120, scale: .8 })
      }

      resetAboutIntro()
      const introTimeline = gsap.timeline({
        paused: true,
        onComplete: () => section.classList.remove('is-about-intro-playing'),
      })
        .to(introTargets, { autoAlpha: 1, x: 0, y: 0, duration: .82, stagger: .16, ease: 'power3.out' }, 0)
        .to('.journey-portrait', { autoAlpha: 1, x: 0, scale: 1, rotate: 0, duration: 1.05, ease: 'back.out(1.12)' }, 0)
        .to('.journey-deck>p', { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out' }, 1.25)
        .to('.journey-card-slot', { autoAlpha: 1, y: 0, scale: 1, duration: .9, stagger: .085, ease: 'back.out(1.06)' }, 1.48)

      const playAboutIntro = () => {
        if (introTimeline.isActive()) return
        section.classList.remove('is-returning-about')
        resetAboutIntro()
        section.classList.add('is-about-intro-playing')
        introTimeline.restart(true)
      }
      prepareAboutIntro = () => {
        introTimeline.pause(0)
        section.classList.remove('is-about-intro-playing')
        section.classList.add('is-returning-about')
        resetAboutIntro()
      }
      replayAboutIntro = playAboutIntro

      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        onEnter: playAboutIntro,
      })
      gsap.delayedCall(.05, () => {
        const bounds = section.getBoundingClientRect()
        if (bounds.top <= window.innerHeight * .7 && bounds.bottom > 0) playAboutIntro()
      })

      timeline
        .to({}, { duration: .72 })
        .to('.journey-about-copy', { x: -90, autoAlpha: 0, duration: .7, ease: 'power2.inOut' }, .72)
        .to('.journey-deck', { y: -120, scale: .9, autoAlpha: 0, duration: .62, ease: 'power2.inOut' }, .78)
        .to('.journey-about-panel', { autoAlpha: 0, duration: .2 }, 1.18)
        .fromTo('.journey-exp-panel', { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: .82, ease: 'power3.out' }, 1.08)
        .fromTo('.journey-exp-card', { autoAlpha: 0, x: (index) => index % 2 ? 90 : -90 }, { autoAlpha: 1, x: 0, duration: .62, stagger: .11, ease: 'power3.out' }, 1.26)
        .fromTo('.journey-progress-fill', { scaleY: 0 }, { scaleY: 1, duration: .9, ease: 'none' }, 1.18)
    }, section)

    const updateActiveTab = () => {
      const journeyBounds = section.getBoundingClientRect()
      if (section.classList.contains('is-experience') && journeyBounds.top <= 2 && journeyBounds.bottom > window.innerHeight * .5) {
        setActiveTab('experience')
        return
      }

      const sections = [
        ['contact', document.querySelector('#contact')],
        ['strength', document.querySelector('#strength')],
        ['work', document.querySelector('#work')],
      ]
      const current = sections.find(([, node]) => node?.getBoundingClientRect().top <= window.innerHeight * .42)
      if (current) setActiveTab(current[0])
      else if (section.getBoundingClientRect().top <= window.innerHeight * .42) setActiveTab('about')
      else setActiveTab('home')
    }

    const handleAboutReplay = () => replayAboutIntro()
    const handleAboutPrepare = () => prepareAboutIntro()
    section.addEventListener('portfolio:prepare-about', handleAboutPrepare)
    section.addEventListener('portfolio:replay-about', handleAboutReplay)
    window.addEventListener('scroll', updateActiveTab, { passive: true })
    updateActiveTab()

    return () => {
      section.classList.remove('is-returning-about', 'is-about-intro-playing')
      section.removeEventListener('portfolio:prepare-about', handleAboutPrepare)
      section.removeEventListener('portfolio:replay-about', handleAboutReplay)
      window.removeEventListener('scroll', updateActiveTab)
      context.revert()
    }
  }, [])

  const cardAngles = [-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5, 6]
  const cardLifts = [0, -8, -16, -23, -28, -23, -16, -8, 0]

  return <section className="journey-scroll" id="about" ref={sectionRef}>
    <PortfolioNav activeTab={activeTab} />

    <div className="journey-stage">
      <div className="journey-frame">

        <div className="journey-panel journey-about-panel">
          <div className="journey-about-copy">
            <p className="journey-eyebrow">HELLO / 你好</p>
            <h2>我是 <b>Echo</b><small>PORTFOLIO</small></h2>
            <h3>视觉设计师 · AIGC 创意</h3>
            <p className="journey-summary">8 年海外电商视觉经验，覆盖三维动画、平面视觉与视频全案。把 AI 创意、建模渲染和后期制作连接成高效工作流。</p>
            <div className="journey-actions"><a href="#work">查看我的作品 <b>↗</b></a><a href="#contact">联系我</a></div>
            <div className="journey-tags"><span tabIndex={0}>视觉系统 × AI 工作流<i aria-hidden="true">×</i></span><span tabIndex={0}>品牌视觉 / 3D 动态 / AIGC<i aria-hidden="true">×</i></span></div>
          </div>

          <figure className="journey-portrait" onPointerMove={handlePortraitMove} onPointerLeave={resetPortraitTilt}>
            <div className="journey-portrait-tilt" ref={portraitTiltRef}>
              <img src="/assets/echo-portrait.jpg" alt="设计师 Echo 肖像" />
            </div>
            <figcaption><b>NOW</b><span>开放合作 / 作品交流</span></figcaption>
          </figure>

          <div className="journey-deck" aria-label="精选案例">
            <p>PORTFOLIO</p>
            <div className="journey-cards">
              {journeyProjects.map((project, index) => <div
                className="journey-card-slot"
                key={project.label}
                style={{ '--card-rotation': `${cardAngles[index]}deg`, '--card-lift': `${cardLifts[index]}px`, '--card-index': index }}
              >
                <a className="journey-card" href={project.href}>
                  <img src={project.image} alt={project.label} />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{project.label}</strong>
                </a>
              </div>)}
            </div>
          </div>
        </div>

        <div className="journey-panel journey-exp-panel" id="journey-experience">
          <header className="journey-exp-heading">
            <p>02 / THE JOURNEY</p>
            <h2>Work Experience</h2>
            <span>个人经历 / 每一段经历都在形成现在的我</span>
          </header>
          <div className="journey-timeline-viewport" ref={experiencePanelRef}>
            <div className="journey-timeline">
              <div className="journey-progress"><span className="journey-progress-fill" /></div>
              {experience.map((item, index) => <article className={`journey-exp-card ${index % 2 ? 'is-right' : 'is-left'}`} key={item.period} tabIndex={0}>
                <span className="journey-exp-number">{index + 1}</span>
                <time>{item.period}</time>
                <div className="journey-exp-content">
                  <h3>{item.company}</h3>
                  <strong>{item.role}</strong>
                  <p>{item.detail}</p>
                </div>
              </article>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
}
function usePortfolioMotion() {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {
      const hero = document.querySelector('.orbit-stage')
      const flower = hero?.querySelector('.orbit-flower')
      const header = document.querySelector('.floating-header')

      if (hero) {
        const opening = gsap.timeline({ defaults: { ease: 'power4.out' } })
        if (header) opening.fromTo(header, { autoAlpha: 0, y: -34 }, { autoAlpha: 1, y: 0, duration: .85 }, 0)
        opening
          .fromTo('.orbit-word-inner', { yPercent: 132, scaleX: .66, skewX: -9, transformOrigin: 'left bottom' }, { yPercent: 0, scaleX: 1, skewX: 0, duration: 1.8 }, .18)
          .fromTo(flower, { clipPath: 'inset(100% 0 0 0)', xPercent: -50, y: 105, scale: .82 }, { clipPath: 'inset(0% 0 0 0)', xPercent: -50, y: 0, scale: 1, duration: 1.65 }, .34)
          .fromTo('.orbit-sticker', { autoAlpha: 0, scale: .25, rotate: -24 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: .9, stagger: .12, ease: 'expo.out' }, .92)
          .fromTo('.orbit-corner', { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .1 }, 1.12)
      }

      const sectionConfigs = [
        { selector: '.about', cards: ['.portrait', '.about-intro', '.about-labels', '.about-profile', '.tool-card'], images: ['.portrait-photo'] },
        { selector: '.work', cards: ['.ag-panel'], images: ['.ag-media img'] },
        { selector: '.strength', cards: ['.strength-grid article'], images: [] },

        { selector: '.contact', cards: ['.contact-cta', '.footer-bottom'], images: [] },
      ]

      sectionConfigs.forEach(({ selector, cards, images }) => {
        const section = document.querySelector(selector)
        if (!section) return
        const title = section.querySelector('h2')
        const cardNodes = cards.flatMap(item => gsap.utils.toArray(item, section))
        const imageNodes = images.flatMap(item => gsap.utils.toArray(item, section))

        if (title) {
          gsap.fromTo(title, { autoAlpha: 0, yPercent: 118, scaleX: .72, skewX: -7, clipPath: 'inset(0 0 100% 0)', transformOrigin: 'left bottom' }, { autoAlpha: 1, yPercent: 0, scaleX: 1, skewX: 0, clipPath: 'inset(0 0 0% 0)', duration: 1.65, ease: 'power4.out', scrollTrigger: { trigger: section, start: 'top 71%', once: true } })
        }

        if (cardNodes.length) {
          gsap.fromTo(cardNodes, { autoAlpha: 0, y: 94, rotateX: 10, transformOrigin: 'center top' }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.25, stagger: .14, ease: 'power4.out', scrollTrigger: { trigger: section, start: 'top 63%', once: true } })
        }

        imageNodes.forEach(image => {
          gsap.fromTo(image, { scale: 1.18, yPercent: 9 }, { scale: 1, yPercent: -4, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.35 } })
        })
      })

      const contactTags = gsap.utils.toArray('.contact-tags span')
      if (contactTags.length) {
        const dropX = [-90, 45, -35, 110, -70, 60, -120, 85]
        const restRotation = [-12, -2, -12, 14, 15, 1, -1, 1]
        const rotationDrift = [18, -12, 24, -20, 16, -18, 22, -14]
        gsap.fromTo(contactTags, {
          autoAlpha: 0,
          x: (index) => dropX[index],
          y: (index) => -Math.min(window.innerHeight, 900) * (.72 + ((index * 2) % 5) * .08),
          rotation: (index) => restRotation[index] + rotationDrift[index],
          scale: (index) => .88 + (index % 3) * .04,
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: (index) => restRotation[index],
          scale: 1,
          duration: (index) => 2.15 + (index % 4) * .18,
          stagger: { each: .16, from: 'random' },
          ease: 'back.out(1.04)',
          scrollTrigger: { trigger: '.contact-tags', start: 'top 88%', once: true },
          onComplete: () => gsap.set(contactTags, { clearProps: 'transform' }),
        })
      }
    })

    return () => context.revert()
  }, [])
}
function usePortfolioSectionPaging() {
  useEffect(() => {
    if (window.matchMedia('(max-width: 900px)').matches) return undefined

    const hero = document.querySelector('.orbit-stage')
    const journey = document.querySelector('.journey-scroll')
    const work = document.querySelector('#work')
    const strength = document.querySelector('#strength')
    const contact = document.querySelector('#contact')
    if (!hero || !journey || !work || !strength || !contact) return undefined

    let locked = false
    let unlockTimer = 0
    let accumulatedDelta = 0
    let resetDeltaTimer = 0
    let experienceExitReady = false
    let experienceExitTimer = 0
    let aboutReplayTimer = 0

    const pageTop = (node) => window.scrollY + node.getBoundingClientRect().top
    const getStops = () => {
      const journeyTrigger = ScrollTrigger.getAll().find(trigger => trigger.trigger === journey)
      const journeyTop = journeyTrigger?.start ?? pageTop(journey)
      const journeyEnd = journeyTrigger?.end ?? journeyTop + 1900
      const journeyDistance = journeyEnd - journeyTop
      const workTop = pageTop(work)
      return [
        { id: 'top', top: pageTop(hero) },
        { id: 'about', top: journeyTop },
        { id: 'journey-experience', top: journeyTop + journeyDistance * .96 },
        { id: 'work', top: workTop },
        { id: 'strength', top: pageTop(strength) },
        { id: 'contact', top: pageTop(contact) },
      ]
    }

    const jumpTo = ({ id, top }, { prepareAbout = false, experienceFromBottom = false } = {}) => {
      locked = true
      const historyId = id.startsWith('about-') ? 'about' : id
      window.history.replaceState(null, '', historyId === 'top' ? `${window.location.pathname}${window.location.search}` : `#${historyId}`)
      if (prepareAbout) journey.dispatchEvent(new Event('portfolio:prepare-about'))
      if (experienceFromBottom) {
        const timelineViewport = document.querySelector('.journey-timeline-viewport')
        if (timelineViewport) timelineViewport.scrollTop = timelineViewport.scrollHeight
      }
      window.scrollTo({ top, behavior: 'smooth' })
      window.clearTimeout(aboutReplayTimer)
      if (prepareAbout) aboutReplayTimer = window.setTimeout(() => journey.dispatchEvent(new Event('portfolio:replay-about')), 900)
      window.clearTimeout(unlockTimer)
      unlockTimer = window.setTimeout(() => { locked = false }, 850)
    }

    const handleWheel = (event) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) < 2 || event.target.closest('.portfolio-lightbox')) return
      if (locked) {
        event.preventDefault()
        return
      }

      const stops = getStops()
      const currentY = window.scrollY
      const nearestIndex = stops.reduce((best, stop, index) => Math.abs(stop.top - currentY) < Math.abs(stops[best].top - currentY) ? index : best, 0)
      const currentStop = stops[nearestIndex]
      const experiencePanel = document.querySelector('.journey-timeline-viewport')

      if (currentStop.id === 'about' && journey.classList.contains('is-about-intro-playing')) {
        event.preventDefault()
        return
      }

      if (currentStop.id === 'journey-experience' && experiencePanel) {
        const atTop = experiencePanel.scrollTop <= 1
        const atBottom = experiencePanel.scrollTop + experiencePanel.clientHeight >= experiencePanel.scrollHeight - 1

        if ((event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom)) {
          event.preventDefault()
          experienceExitReady = false
          window.clearTimeout(experienceExitTimer)
          experiencePanel.scrollBy({ top: event.deltaY, behavior: 'auto' })
          return
        }

        if (event.deltaY > 0 && atBottom) {
          if (!experienceExitReady) {
            event.preventDefault()
            window.clearTimeout(experienceExitTimer)
            experienceExitTimer = window.setTimeout(() => { experienceExitReady = true }, 420)
            return
          }
        } else {
          experienceExitReady = false
          window.clearTimeout(experienceExitTimer)
        }
      } else {
        experienceExitReady = false
        window.clearTimeout(experienceExitTimer)
      }

      const contactTop = pageTop(contact)
      const insideContact = window.scrollY >= contactTop - 2
      const belowContactTop = window.scrollY > contactTop + 2
      if (insideContact && (event.deltaY > 0 || belowContactTop)) return

      event.preventDefault()
      accumulatedDelta += event.deltaY
      window.clearTimeout(resetDeltaTimer)
      resetDeltaTimer = window.setTimeout(() => { accumulatedDelta = 0 }, 180)
      if (Math.abs(accumulatedDelta) < 18) return

      const direction = accumulatedDelta > 0 ? 1 : -1
      const targetIndex = Math.max(0, Math.min(stops.length - 1, nearestIndex + direction))
      const targetStop = stops[targetIndex]
      accumulatedDelta = 0
      if (targetIndex !== nearestIndex) jumpTo(targetStop, {
        prepareAbout: currentStop.id === 'journey-experience' && targetStop.id === 'about',
        experienceFromBottom: currentStop.id === 'work' && targetStop.id === 'journey-experience',
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.clearTimeout(unlockTimer)
      window.clearTimeout(resetDeltaTimer)
      window.clearTimeout(experienceExitTimer)
      window.clearTimeout(aboutReplayTimer)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])
}
function App() {
  usePortfolioMotion()
  usePortfolioSectionPaging()
  return <main id="top">
    <OrbitHero />
    <MarqueeStrip />

    <PortfolioJourney />

    <section className="work section" id="work"><div className="shell"><div className="work-intro"><div className="section-kicker"><span>03 / THE PRACTITIONER</span></div><div className="work-heading"><h2>Portfolio/<span>作品集</span></h2><a className="work-more-link" href="/design">查看更多作品 <b>↗</b></a></div></div><PortfolioMosaic items={galleryProjects} /><div className="portfolio-mosaic-footer"><span>3 / {galleryProjects.length}</span></div></div></section>

    <section className="strength section" id="strength"><div className="shell strength-shell"><header className="strength-intro"><p>04 / WHAT I DO BEST</p><h2>Advantages/<span>个人优势</span></h2></header><div className="strength-grid">{strengths.map(({ number, keywords, points }, index) => <article className={`strength-card--${number}`} key={number} onPointerMove={handleStrengthCardMove} onPointerLeave={handleStrengthCardLeave}><div className="strength-card-meta"><span>{number} / CORE</span><b>×</b></div><div className="strength-card-copy"><h3>{keywords.map(keyword => <strong key={keyword}>{keyword}</strong>)}</h3><ol>{points.map(point => <li key={point}>{point}</li>)}</ol></div><i aria-hidden="true">{['⌒', '☆', '◡', '✦'][index]}</i></article>)}</div></div></section>


    <footer className="contact" id="contact">
      <div className="shell contact-inner">
        <div className="contact-heading">
          <p className="contact-kicker">PORTFOLIO ARCHIVE / 2026</p>
          <h2><strong>SELECTED <span>VISUAL</span></strong><br/><i>design works</i></h2>
        </div>
        <div className="contact-cta">
          <p>记录品牌、三维与动态视觉，<br/>呈现从概念到成品的设计过程。</p>
          <a href="mailto:echolin927@gmail.com">EMAIL <b>↗</b></a>
        </div>
        <div className="contact-tags" aria-label="设计方向">
          <span>Product Design</span><span>Social Media</span><span>3D Motion</span><span>Brand Visual</span>
          <span>Art Direction</span><span>Websites</span><span>AI Creative</span><span>Video Editing</span>
        </div>
        <div className="footer-bottom contact-info-panel">
          <span className="contact-info-word" aria-hidden="true" onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect()
            const scaleY = bounds.height / event.currentTarget.offsetHeight
            event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`)
            event.currentTarget.style.setProperty('--spot-y', `${(event.clientY - bounds.top) / scaleY}px`)
          }}>PORTFOLIO</span>
          <section className="contact-info-lead">
            <h3>Selected works<br/>and visual notes.</h3>
            <p>个人作品与视觉实验持续更新。</p>
            <a className="contact-email-box" href="mailto:echolin927@gmail.com"><span>echolin927@gmail.com</span><b>↗</b></a>
          </section>
          <div className="contact-info-columns">
            <section>
              <h4>个人信息</h4>
              <dl><div><dt>身份</dt><dd>视觉设计师</dd></div><div><dt>方向</dt><dd>品牌 / 3D / 动态视觉</dd></div><div><dt>状态</dt><dd>作品持续更新</dd></div></dl>
            </section>
            <section>
              <h4>作品导航</h4>
              <dl><div><dt>Design</dt><dd><a href="/design">平面设计 ↗</a></dd></div><div><dt>Video</dt><dd><a href="/video">视频作品 ↗</a></dd></div><div><dt>About</dt><dd><a href="/#about">个人简介 ↗</a></dd></div></dl>
            </section>
            <section>
              <h4>联系我</h4>
              <dl><div><dt>邮箱</dt><dd><a href="mailto:echolin927@gmail.com">echolin927@gmail.com</a></dd></div><div><dt>电话</dt><dd><a href="tel:15975246069">+86 159 7524 6069</a></dd></div><div><dt>网站内容</dt><dd>个人作品展示</dd></div></dl>
            </section>
          </div>
          <p className="contact-copyright"><span>© 2026 ECHO LIN / VISUAL PORTFOLIO</span><a className="site-filing" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">粤ICP备2026141529号-1</a></p>
        </div>
      </div>
    </footer>
  </main>
}

const page = (window.location.pathname.split('/').filter(Boolean).pop() ?? '').replace(/\.html$/, '')
const currentCategory = designCategories.find((category) => category.slug === page)
const requestedWork = Number.parseInt(new URLSearchParams(window.location.search).get('work'), 10)
const currentWorkIndex = Number.isInteger(requestedWork) ? requestedWork - 1 : -1
const currentWork = currentCategory?.slug === 'detail-page-design' ? currentCategory.works[currentWorkIndex] : undefined
const currentWorkSections = currentWork ? detailWorkSections[currentWorkIndex] ?? emptyDetailWorkSections : undefined
const content = currentCategory
  ? currentWorkSections
    ? <DesignWorkDetailPage category={currentCategory} sections={currentWorkSections} index={currentWorkIndex} />
    : <DesignCategoryPage category={currentCategory} />
  : page === 'design'
  ? <SecondaryPage type="design" />
  : page === 'video'
    ? <SecondaryPage type="video" />
    : <App />

createRoot(document.getElementById('root')).render(<StrictMode><GlowCursor />{content}</StrictMode>)
