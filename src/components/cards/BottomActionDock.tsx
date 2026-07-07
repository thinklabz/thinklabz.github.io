import { Layout, Palette, Download, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface BottomActionDockProps {
  onTemplates: () => void
  onCustomize: () => void
  onDownload: () => void
  onShare: () => void
}

export default function BottomActionDock({
  onTemplates,
  onCustomize,
  onDownload,
  onShare
}: BottomActionDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="flex items-center gap-2 bg-background/90 backdrop-blur-xl border border-border/10 rounded-2xl shadow-2xl shadow-black/20 p-2"
      >
        <button
          onClick={onTemplates}
          className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl hover:bg-secondary/30 transition-all group active:scale-95"
          title="Templates"
        >
          <Layout className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Templates
          </span>
        </button>

        <button
          onClick={onCustomize}
          className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl hover:bg-secondary/30 transition-all group active:scale-95"
          title="Customize"
        >
          <Palette className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Customize
          </span>
        </button>

        <button
          onClick={onDownload}
          className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl hover:bg-secondary/30 transition-all group active:scale-95"
          title="Download"
        >
          <Download className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Download
          </span>
        </button>

        <button
          onClick={onShare}
          className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl hover:bg-secondary/30 transition-all group active:scale-95"
          title="Share"
        >
          <Share2 className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Share
          </span>
        </button>
      </motion.div>
    </div>
  )
}
