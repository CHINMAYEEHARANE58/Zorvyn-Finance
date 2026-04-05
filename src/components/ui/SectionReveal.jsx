import { motion } from 'framer-motion'

const MotionSection = motion.section

export const SectionReveal = ({ children, className = '', delay = 0 }) => {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.24, delay, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </MotionSection>
  )
}

