import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '../ui/Card'

const MotionSlide = motion.div

export const InsightsCarousel = ({ slides = [] }) => {
  const normalizedSlides = useMemo(
    () => slides.filter((slide) => slide?.title && slide?.text),
    [slides],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (normalizedSlides.length <= 1 || isPaused) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % normalizedSlides.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [isPaused, normalizedSlides.length])

  if (!normalizedSlides.length) return null

  const safeIndex = activeIndex % normalizedSlides.length
  const activeSlide = normalizedSlides[safeIndex]

  return (
    <Card
      className="p-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Insight Carousel</p>

      <div className="mt-3 min-h-[82px]">
        <AnimatePresence mode="wait">
          <MotionSlide
            key={`${safeIndex}-${activeSlide.title}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
          >
            <p className="text-sm font-medium text-white">{activeSlide.title}</p>
            <p className="mt-2 text-sm text-gray-300 transition-colors duration-300 hover:text-gray-200">
              {activeSlide.text}
            </p>
          </MotionSlide>
        </AnimatePresence>
      </div>

      {normalizedSlides.length > 1 ? (
        <div className="mt-2 flex gap-1.5">
          {normalizedSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                safeIndex === index ? 'w-5 bg-blue-400' : 'w-2 bg-white/20'
              }`}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </Card>
  )
}
