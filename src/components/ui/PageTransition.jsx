import { motion } from 'framer-motion'

const MotionContainer = motion.div

export const PageTransition = ({ children, className = '' }) => {
  return (
    <MotionContainer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </MotionContainer>
  )
}
