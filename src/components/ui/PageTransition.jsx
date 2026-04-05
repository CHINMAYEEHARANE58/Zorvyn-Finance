import { motion } from 'framer-motion'

const MotionContainer = motion.div

export const PageTransition = ({ children, className = '' }) => {
  return (
    <MotionContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </MotionContainer>
  )
}
