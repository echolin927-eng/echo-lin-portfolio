import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AccordionGallery from './AccordionGallery'
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
  ['01', '品牌视觉', '从策略、VI 到包装与电商物料，让品牌语言在每个触点保持一致。'],
  ['02', '3D 与动态', '熟悉 C4D、KeyShot 与后期流程，以镜头感建立产品的情绪与记忆点。'],
  ['03', 'AI 创意', '将生成式工具融入创意开发和视觉制作，提高探索密度与落地效率。'],
  ['04', '跨团队协作', '具备团队管理与项目统筹经验，能在业务、产品与设计之间高效协同。'],
]

const galleryProjects = [
  { image: '/assets/work-showcase-03.jpg', label: 'TFIT NOVA MAX', type: '3D MOTION / PRODUCT', subtitle: '产品 3D 渲染与动态视觉' },
  { image: '/assets/work-showcase-02.jpg', label: 'PRODUCT STORIES', type: 'E-COMMERCE / A+ CONTENT', subtitle: '从卖点到场景的视觉叙事' },
  { image: '/assets/work-showcase-01.jpg', label: 'AMAZON A+ PAGE', type: 'E-COMMERCE / DETAIL', subtitle: '跨境电商详情页视觉系统' },
  { image: '/assets/work-showcase-04.jpg', label: 'BRAND IDENTITY', type: 'BRAND / VISUAL', subtitle: '从品牌语言到触点表达' },
  { image: '/assets/work-showcase-05.jpg', label: 'DIGITAL EXPERIENCE', type: 'WEB / INTERFACE', subtitle: '数字界面的视觉体验' },
]

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

function FloatingHeader({ active = 'home' }) {
  return <header className="floating-header">
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
        </div>
      </div>
      <a className={active === 'video' ? 'is-active' : ''} href="/video">video丨视频</a>
      <a href="/#contact">Contact丨联系</a>
    </nav>
    <a href="/#contact" className="orbit-pill">CONTACT <b>↗</b></a>
  </header>
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
    const addPoint = (event) => {
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
    const enter = () => { hovering = true }; const leave = () => { hovering = false; last = null }; const move = (e) => { if (hovering && headRadius > 5) addPoint(e) }
    resize(); const observer = new ResizeObserver(resize); observer.observe(flower); stage.addEventListener('mouseenter', enter); stage.addEventListener('mouseleave', leave); stage.addEventListener('mousemove', move); frame = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); stage.removeEventListener('mouseenter', enter); stage.removeEventListener('mouseleave', leave); stage.removeEventListener('mousemove', move) }
  }, [])

  return <section className="orbit-stage" id="top" ref={stageRef}>
    <h1 className="orbit-word" aria-label="Echo"><span className="orbit-word-mask"><span className="orbit-word-inner"><span className="orbit-white"><span className="orbit-o">E</span>C</span><span className="orbit-pink">HO</span></span></span></h1>
    <div className="orbit-flower" ref={flowerRef}><img className="orbit-sizer" src={girlRevealImage} alt="" aria-hidden="true" /><div className="orbit-layer orbit-front" ref={frontRef}><img src={girlRevealImage} alt="网点风格女孩插画" /></div><div className="orbit-layer orbit-reveal" ref={revealRef} aria-hidden="true"><img src={girlImage} alt="" /></div></div>
    <p className="orbit-corner orbit-corner-left">Every image, <br />intelligently composed.</p><p className="orbit-corner orbit-corner-right">Less generic design.<br />More memorable output.</p>
    <p className="orbit-caption">VISUAL DESIGNER · AI CREATIVE · BRAND DESIGN</p>
  </section>
}

const motionReels = [
  { src: '/assets/motion-reel-01.mp4', poster: '/assets/reel-cover-01.jpg', kicker: '01. TFIT / PRODUCT FILM', name: 'MAKE IT MOVE', detail: '产品 3D 渲染与动态视觉，将性能、光感与情绪凝成一段产品电影。' },
  { src: '/assets/motion-reel-02.mp4', poster: '/assets/reel-cover-02.jpg', kicker: '02. PRODUCT / CONTENT', name: 'STORIES IN FRAME', detail: '用镜头和场景，把产品卖点变成更具沉浸感的内容叙事。' },
  { src: '/assets/motion-reel-03.mp4', poster: '/assets/reel-cover-03.png', kicker: '03. BRAND / DIGITAL', name: 'BRAND IN MOTION', detail: '让品牌语言在动态、网页与每一次数字触点中保持一致。' },
  { poster: '/assets/reel-cover-04.png', kicker: '04. E-COMMERCE / A+', name: 'DETAILS THAT SELL', detail: '为跨境电商建立更清晰、更有感知力的商品详情体验。' },
  { poster: '/assets/reel-cover-05.jpg', kicker: '05. WEB / EXPERIENCE', name: 'DIGITAL RHYTHM', detail: '以有节奏的动态交互，增强品牌网站的内容层次与记忆点。' },
]

function MotionReels() { return <div id="reels"><ScrollStack items={motionReels} /></div> }

function VideoCardShowcase() {
  const videos = motionReels.filter((item) => item.src)
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
          <CardSwap width={774} height={487} cardDistance={66} verticalDistance={120} delay={5000} pauseOnHover skewAmount={3} easing="linear" onCardClick={(index) => setActiveVideo(videos[index])}>
            {videos.map((video, index) => <Card className="video-swap-card" key={video.src} role="button" tabIndex="0" aria-label={`播放 ${video.name}`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveVideo(video) }}>
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
    {activeVideo && <div className="video-modal" role="dialog" aria-modal="true" aria-label={activeVideo.name} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveVideo(null) }}>
      <button type="button" className="video-modal-close" onClick={() => setActiveVideo(null)} aria-label="关闭视频">×</button>
      <div className="video-modal-panel"><video src={activeVideo.src} poster={activeVideo.poster} controls autoPlay playsInline /><div><small>{activeVideo.kicker}</small><h2>{activeVideo.name}</h2><p>{activeVideo.detail}</p></div></div>
    </div>}
  </>
}

const designCategories = [
  { slug: 'website-design', number: '01', title: '网站设计', english: 'WEBSITE DESIGN', image: '/assets/web-page.png', description: '品牌官网与数字界面的视觉体验。', works: ['/assets/website-design-08.jpg', '/assets/website-design-09.jpg', '/assets/website-design-10.jpg', '/assets/website-design-11.jpg'] },
  { slug: 'amazon-store-design', number: '02', title: '亚马逊旗舰店设计', english: 'AMAZON FLAGSHIP STORE', image: '/assets/amazon-page.png', description: '围绕品牌与产品建立完整的店铺视觉。', works: ['/assets/amazon-page.png', '/assets/product-grid.png'] },
  { slug: 'detail-page-design', number: '03', title: '详情页设计', english: 'PRODUCT DETAIL PAGE', image: '/assets/product-grid.png', description: '从产品卖点到场景化内容的清晰表达。', works: ['/assets/product-grid.png', '/assets/work-showcase-01.jpg'] },
  { slug: 'commercial-design', number: '04', title: '商业设计', english: 'COMMERCIAL DESIGN', image: '/assets/work-showcase-04.jpg', description: '品牌活动、视觉传播与商业内容设计。', works: ['/assets/work-showcase-04.jpg', '/assets/work-showcase-05.jpg', '/assets/work-showcase-02.jpg'] },
]

function DesignCategoryLinks() {
  return <div className="design-category-grid">
    {designCategories.map((category) => <a className="design-category-card" href={`/${category.slug}`} key={category.slug}>
      <img src={category.image} alt="" />
      <span className="design-category-shade" />
      <span className="design-category-number">{category.number}</span>
      <span className="design-category-copy"><small>{category.english}</small><strong>{category.title}</strong></span>
      <b aria-hidden="true">↗</b>
    </a>)}
  </div>
}

function DesignCategoryPage({ category }) {
  return <main className={`secondary-page category-page ${category.slug === 'website-design' ? 'category-page--website' : ''}`}>
    <FloatingHeader active="design" />
    <section className="secondary-hero category-hero"><div className="shell">
      <p className="secondary-kicker">DESIGN WORK / {category.english}</p>
      <h1>{category.title}</h1>
      <p>{category.description}</p>
    </div></section>
    <section className="category-showcase"><div className="shell">
      {category.works.map((image, index) => <figure key={image}><img src={image} alt={`${category.title}作品 ${index + 1}`} /><figcaption><span>0{index + 1}</span><span>{category.english}</span></figcaption></figure>)}
    </div></section>
    <footer className="secondary-footer"><div className="shell"><a href="/design">← 返回平面作品</a><a href="/#contact">联系我 ↗</a></div></footer>
  </main>
}

function SecondaryPage({ type }) {
  const isDesign = type === 'design'
  return <main className="secondary-page">
    <FloatingHeader active={type} />
    <section className="secondary-hero">
      <div className="shell">
        <p className="secondary-kicker">{isDesign ? 'DESIGN WORK / 平面作品' : 'VIDEO / 视频作品'}</p>
        <h1>{isDesign ? <>DESIGN <i>WORK.</i></> : <>VIDEO <i>WORK.</i></>}</h1>
        <p>{isDesign ? '品牌、电商与数字视觉作品精选。' : '产品动画、品牌动态与视频内容精选。'}</p>
      </div>
    </section>
    {isDesign ? <section className="secondary-content"><div className="shell">
      <DesignCategoryLinks />
    </div></section> : <VideoCardShowcase />}
    <footer className="secondary-footer"><div className="shell"><a href="/">← 返回首页</a><a href="/#contact">联系我 ↗</a></div></footer>
  </main>
}

function App() {
  return <main>
    <FloatingHeader />
    <OrbitHero />
    <MarqueeStrip />

    <section className="about section" id="about">
      <div className="shell">
        <div className="section-kicker"><span>01</span><span>ABOUT ECHO / DESIGNER PROFILE</span></div>
        <div className="about-heading about-heading--collage">
          <div><span className="about-handline">HEY, NICE TO MEET YOU!</span><h2>ABOUT <i>ME</i></h2></div>
          <p>三维动画 · 平面设计 · 视频剪辑</p>
          <img className="sticker sticker-burst" src="/assets/sticker-burst.png" alt="" aria-hidden="true" />
        </div>
        <div className="about-layout">
          <figure className="portrait">
            <img className="portrait-tape" src="/assets/polaroid-tape.png" alt="" aria-hidden="true" />
            <div className="portrait-photo-wrap">
              <img className="portrait-photo" src="/assets/echo-portrait.jpg" alt="设计师林婉秋肖像" />
            </div>
            <img className="sticker sticker-smiley" src="/assets/sticker-smiley.png" alt="" aria-hidden="true" />
            <img className="sticker sticker-stamp" src="/assets/sticker-cat-stamp.png" alt="" aria-hidden="true" />
            <figcaption className="polaroid-caption">
              <div className="echo-name-sticker"><img src="/assets/echo-name-tag.png" alt="" aria-hidden="true" /><small>HELLO, I AM</small><strong>Echo</strong></div>
              <div className="portrait-contact"><b>CONTACT ME</b><a href="tel:15975246069">+86 159 7524 6069</a><a href="mailto:657158659@qq.com">657158659@qq.com</a></div>
            </figcaption>
          </figure>
          <div className="about-copy">
            <div className="about-intro note-card">
              <img className="stacked-paper-note" src="/assets/paperclip-stars-note.png" alt="" aria-hidden="true" />
              <p className="intro">你好，我是 <b>Echo</b>。<br/>一位专注视觉表达与动态内容的设计师。</p>
              <p className="muted">拥有 8 年设计与团队管理经验，熟悉电商视觉、品牌设计、3D 渲染和视频后期流程。擅长从色彩、材质与空间出发，把商业目标转化为清晰、有辨识度的视觉内容。</p>
            </div>
            <div className="about-labels" aria-label="专业方向"><span>3D MOTION</span><span>BRAND VISUAL</span><span>AI CREATIVE</span></div>
            <div className="experience-wrap">
              <div className="experience-list">
              <div className="experience-title"><span>WORK EXPERIENCE</span><span>2020 — 2026</span></div>
              {experience.map((item, index) => <article className="experience-item" key={item.period}>
                <span className="experience-number">0{index + 1}</span>
                <time>{item.period}</time>
                <div><h3>{item.company}</h3><strong>{item.role}</strong><p>{item.detail}</p></div>
              </article>)}
              </div>
            </div>
          </div>
        </div>
        <Toolkit />
      </div>
    </section>

    <section className="work section" id="work"><div className="shell"><div className="section-kicker"><span>02</span><span>SELECTED WORKS</span></div><div className="work-heading"><h2>SELECTED<br/><i>WORKS</i></h2><p>以设计解决问题，<br/>以视觉留下余韵。</p></div><AccordionGallery items={galleryProjects} defaultIndex={1} expandRatio={.48} accentColor="#fd86db" height={620} /></div></section>

    <section className="strength section shell" id="strength"><div className="section-kicker"><span>03</span><span>EXPERTISE</span></div><div className="strength-heading"><h2>BUILDING<br/>VISUAL <i>IMPACT</i></h2><p>在理性的方法中，保留感性的判断。</p></div><div className="strength-grid">{strengths.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><b>↗</b></article>)}</div></section>
    <MotionReels />

    <footer className="contact" id="contact">
      <div className="shell contact-inner">
        <div className="contact-heading">
          <p className="contact-kicker">OPEN FOR COLLABORATION / 2026</p>
          <h2><strong>ALL <span>YOUR</span></strong><br/><i>design needs</i></h2>
        </div>
        <div className="contact-cta">
          <p>从一个想法到完整落地，<br/>一起做有辨识度、也真正有效的设计。</p>
          <a href="mailto:657158659@qq.com">LET'S TALK <b>↗</b></a>
        </div>
        <div className="contact-tags" aria-label="可合作的设计方向">
          <span>Product Design</span><span>Social Media</span><span>3D Motion</span><span>Brand Visual</span>
          <span>Art Direction</span><span>Websites</span><span>AI Creative</span><span>Video Editing</span>
        </div>
        <div className="footer-bottom">
          <div><a href="mailto:657158659@qq.com">657158659@qq.com</a><a href="tel:15975246069">+86 159 7524 6069</a></div>
          <p>© 2026 ECHO LIN<br/>VISUAL PORTFOLIO</p>
        </div>
      </div>
    </footer>
  </main>
}

const page = window.location.pathname.split('/').pop().replace(/\.html$/, '')
const currentCategory = designCategories.find((category) => category.slug === page)
const content = currentCategory
  ? <DesignCategoryPage category={currentCategory} />
  : page === 'design'
  ? <SecondaryPage type="design" />
  : page === 'video'
    ? <SecondaryPage type="video" />
    : <App />

createRoot(document.getElementById('root')).render(<StrictMode>{content}</StrictMode>)
