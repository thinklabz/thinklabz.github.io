import { motion } from 'framer-motion'
import { Dice1 } from 'lucide-react'

interface RandomPoemButtonProps {
  onClick: () => void
}

export default function RandomPoemButton({ onClick }: RandomPoemButtonProps) {
  return (
    <div className="w-full flex flex-col items-center px-4 py-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-sm text-muted-foreground mb-3"
      >
        Feeling lucky?
      </motion.p>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex items-center gap-3 px-6 py-3 bg-secondary/50 backdrop-blur-xl rounded-2xl border border-border/20 hover:border-border/40 transition-all duration-300"
      >
        <Dice1 className="w-5 h-5 text-foreground" />
        <span className="text-foreground font-medium">🎲 Random Poem</span>
      </motion.button>
    </div>
  )
}
