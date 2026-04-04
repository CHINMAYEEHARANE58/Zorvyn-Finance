import { useEffect, useRef, useState } from 'react'

export const useAnimatedNumber = (targetValue, duration = 320) => {
  const [animatedValue, setAnimatedValue] = useState(targetValue)
  const previousValueRef = useRef(targetValue)

  useEffect(() => {
    let frameId
    let start
    const initialValue = previousValueRef.current
    const delta = targetValue - initialValue

    if (delta === 0) return undefined

    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const nextValue = initialValue + delta * progress
      previousValueRef.current = nextValue
      setAnimatedValue(nextValue)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      }
    }

    frameId = window.requestAnimationFrame(step)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [targetValue, duration])

  return animatedValue
}
