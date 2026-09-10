import './GlareHover.css'

export default function GlareHover({
  as: Component = 'div',
  width = '500px', height = '500px', background = '#000',
  borderRadius = '10px', borderColor = '#333', children,
  glareColor = '#ffffff', glareOpacity = 0.5, glareAngle = -45,
  glareSize = 250, transitionDuration = 650, playOnce = false,
  className = '', style = {}, ...props
}) {
  const hex = glareColor.replace('#', '')
  const expanded = /^[0-9a-f]{3}$/i.test(hex)
    ? [...hex].map(character => character.repeat(2)).join('') : hex
  const rgba = /^[0-9a-f]{6}$/i.test(expanded)
    ? `rgba(${parseInt(expanded.slice(0, 2), 16)}, ${parseInt(expanded.slice(2, 4), 16)}, ${parseInt(expanded.slice(4, 6), 16)}, ${glareOpacity})`
    : glareColor

  return <Component
    {...props}
    className={`glare-hover ${playOnce ? 'glare-hover--play-once' : ''} ${className}`}
    style={{
      '--gh-width': width, '--gh-height': height, '--gh-bg': background,
      '--gh-br': borderRadius, '--gh-border': borderColor,
      '--gh-angle': `${glareAngle}deg`, '--gh-duration': `${transitionDuration}ms`,
      '--gh-size': `${glareSize}%`, '--gh-rgba': rgba, ...style
    }}
  >{children}</Component>
}
