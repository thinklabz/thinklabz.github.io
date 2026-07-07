import { motion } from 'framer-motion'
import { Search, ExternalLink, Copy, Instagram, Share2 } from 'lucide-react'

export default function HowToUse() {
  const steps = [
    { icon: Search, label: 'Search' },
    { icon: ExternalLink, label: 'Open' },
    { icon: Copy, label: 'Copy' },
    { icon: Instagram, label: 'Instagram' },
    { icon: Share2, label: 'Share' },
  ]

  // Prevent context menu and copy/cut
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  return (
    <div className="w-full py-20 px-4 no-select" onContextMenu={handleContextMenu} onCopy={handleCopyCut} onCut={handleCopyCut}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="text-2xl font-semibold text-foreground mb-8 select-none">
            How to Use ZeroDot
          </h3>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className="flex items-center gap-4"
                >
                  <Icon className="w-5 h-5 text-foreground" />
                  <span className="text-base text-foreground select-none">{step.label}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
