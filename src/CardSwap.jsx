import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import './CardSwap.css'

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
))
Card.displayName = 'Card'

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
})

const placeNow = (element, slot, skew) => gsap.set(element, {
  x: slot.x,
  y: slot.y,
  z: slot.z,
  xPercent: -50,
  yPercent: -50,
  skewY: skew,
  transformOrigin: 'center center',
  zIndex: slot.zIndex,
  force3D: true,
})

export default function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children,
}) {
  const config = easing === 'elastic'
    ? { ease: 'elastic.out(0.6,0.9)', durDrop: 2, durMove: 2, durReturn: 2, promoteOverlap: 0.9, returnDelay: 0.05 }
    : { ease: 'power3.inOut', durDrop: 0.72, durMove: 0.78, durReturn: 0.78, promoteOverlap: 0.55, returnDelay: 0.12 }
  const childArr = useMemo(() => Children.toArray(children), [children])
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length])
  const order = useRef(Array.from({ length: childArr.length }, (_, index) => index))
  const timelineRef = useRef(null)
  const intervalRef = useRef()
  const container = useRef(null)
  const hoveredIndexRef = useRef(null)
  const hoverLockRef = useRef(false)
  const hoverLockTimerRef = useRef()
  const pendingIndexRef = useRef(null)
  const pointerIndexRef = useRef(null)

  useEffect(() => {
    const total = refs.length
    refs.forEach((ref, index) => placeNow(ref.current, makeSlot(index, cardDistance, verticalDistance, total), skewAmount))

    const swap = () => {
      if (order.current.length < 2) return
      const [front, ...rest] = order.current
      const frontElement = refs[front].current
      const timeline = gsap.timeline()
      timelineRef.current = timeline
      timeline.to(frontElement, { y: '+=500', duration: config.durDrop, ease: config.ease })
      timeline.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`)
      rest.forEach((index, position) => {
        const slot = makeSlot(position, cardDistance, verticalDistance, refs.length)
        timeline.set(refs[index].current, { zIndex: slot.zIndex }, 'promote')
        timeline.to(refs[index].current, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${position * 0.15}`)
      })
      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length)
      timeline.addLabel('return', `promote+=${config.durMove * config.returnDelay}`)
      timeline.call(() => gsap.set(frontElement, { zIndex: backSlot.zIndex }), undefined, 'return')
      timeline.to(frontElement, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return')
      timeline.call(() => { order.current = [...rest, front] })
    }

    intervalRef.current = window.setInterval(swap, delay)
    const node = container.current
    const pause = () => { timelineRef.current?.pause(); window.clearInterval(intervalRef.current) }
    const resume = () => {
      window.clearTimeout(hoverLockTimerRef.current)
      hoveredIndexRef.current = null
      hoverLockRef.current = false
      pendingIndexRef.current = null
      pointerIndexRef.current = null
      timelineRef.current?.play()
      intervalRef.current = window.setInterval(swap, delay)
    }
    if (pauseOnHover) {
      node.addEventListener('mouseenter', pause)
      node.addEventListener('mouseleave', resume)
    }
    return () => {
      timelineRef.current?.kill()
      window.clearInterval(intervalRef.current)
      window.clearTimeout(hoverLockTimerRef.current)
      if (pauseOnHover) {
        node.removeEventListener('mouseenter', pause)
        node.removeEventListener('mouseleave', resume)
      }
    }
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing])

  const promoteCard = (index) => {
    const currentOrder = order.current
    if (currentOrder[0] === index) return
    const nextOrder = [index, ...currentOrder.filter((item) => item !== index)]
    timelineRef.current?.kill()
    const timeline = gsap.timeline()
    timelineRef.current = timeline
    nextOrder.forEach((item, position) => {
      const slot = makeSlot(position, cardDistance, verticalDistance, refs.length)
      timeline.set(refs[item].current, { zIndex: slot.zIndex }, 0)
      timeline.to(refs[item].current, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        duration: 0.75,
        ease: 'power3.out',
        overwrite: 'auto',
      }, position * 0.035)
    })
    order.current = nextOrder
  }

  function releaseHoverLock() {
    hoverLockRef.current = false
    const pendingIndex = pendingIndexRef.current
    if (pendingIndex !== null && pointerIndexRef.current === pendingIndex && order.current[0] !== pendingIndex) {
      activateCard(pendingIndex)
    }
  }

  function activateCard(index) {
    hoveredIndexRef.current = index
    pendingIndexRef.current = null
    hoverLockRef.current = true
    window.clearTimeout(hoverLockTimerRef.current)
    hoverLockTimerRef.current = window.setTimeout(releaseHoverLock, 500)
    promoteCard(index)
  }

  function registerCardHover(index) {
    pointerIndexRef.current = index
    if (order.current[0] === index) {
      hoveredIndexRef.current = index
      pendingIndexRef.current = null
      return
    }
    if (hoverLockRef.current && hoveredIndexRef.current !== index) {
      pendingIndexRef.current = index
      return
    }
    activateCard(index)
  }

  return <div ref={container} className="card-swap-container" style={{ width, height }}>
    {childArr.map((child, index) => isValidElement(child) ? cloneElement(child, {
      key: index,
      ref: refs[index],
      style: { width, height, ...(child.props.style ?? {}) },
      onClick: event => {
        child.props.onClick?.(event)
        onCardClick?.(index)
      },
      onMouseEnter: event => {
        child.props.onMouseEnter?.(event)
        registerCardHover(index)
      },
      onMouseMove: event => {
        child.props.onMouseMove?.(event)
        registerCardHover(index)
      },
      onMouseLeave: event => {
        child.props.onMouseLeave?.(event)
        if (pointerIndexRef.current === index) pointerIndexRef.current = null
        if (pendingIndexRef.current === index) pendingIndexRef.current = null
      },
    }) : child)}
  </div>
}
