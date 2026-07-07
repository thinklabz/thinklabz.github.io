import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import { triggerHaptic } from '../utils/haptic'

interface Section {
  id: string
  title: string
  content: string
  links?: { label: string; url: string }[]
}

const sections: Section[] = [
  {
    id: 'company',
    title: 'Company',
    content: 'ZeroDot is a digital poetry sanctuary.',
  },
  {
    id: 'about',
    title: 'About',
    content: 'ZeroDot is a premium poetry platform dedicated to sharing beautiful verses and creative expressions.',
  },
  {
    id: 'contact',
    title: 'Contact',
    content: 'Get in touch with us.',
    links: [
      { label: 'Email us', url: 'mailto:contact@zerodot.in' },
    ],
  },
  {
    id: 'social',
    title: 'Social',
    content: 'Follow us on social media.',
    links: [
      { label: 'Instagram', url: 'https://instagram.com/_ft.avx' },
      { label: 'GitHub', url: 'https://github.com' },
    ],
  },
  {
    id: 'more',
    title: 'More',
    content: 'Additional options.',
    links: [
      { label: 'Suggest a Poem', url: 'https://instagram.com/_ft.avx' },
      { label: 'Feedback', url: 'mailto:avxdraft@gmail.com?subject=ZeroDot%20Feedback' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    content: 'Terms and conditions.',
    links: [
      { label: 'Privacy Policy', url: '#' },
      { label: 'Terms of Service', url: '#' },
    ],
  },
  {
    id: 'credits',
    title: 'Credits',
    content: '© 2026 ZeroDot\nBuilt for thoughts that deserve to stay.',
  },
]

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const NavigationDrawer = memo(function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = useCallback((sectionId: string) => {
    triggerHaptic(10)
    setOpenSection((prev) => (prev === sectionId ? null : sectionId))
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              triggerHaptic(10)
              onClose()
            }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-secondary/95 backdrop-blur-xl border-r border-border/20 z-[201] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Menu</h2>
                <motion.button
                  onClick={() => {
                    triggerHaptic(10)
                    onClose()
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>

              {/* Accordion Sections */}
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="border border-border/10 rounded-lg overflow-hidden">
                    <motion.button
                      onClick={() => {
                        triggerHaptic(10)
                        toggleSection(section.id)
                      }}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-foreground/5 transition-colors"
                    >
                      <span className="font-medium text-foreground">{section.title}</span>
                      <motion.div
                        animate={{ rotate: openSection === section.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {openSection === section.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2">
                            <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">
                              {section.content}
                            </p>
                            {section.links && section.links.length > 0 && (
                              <div className="space-y-2">
                                {section.links.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target={link.url.startsWith('http') ? '_blank' : undefined}
                                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      triggerHaptic(10)
                                      window.location.href = link.url
                                    }}
                                    className="block text-sm text-foreground hover:text-muted-foreground transition-colors"
                                  >
                                    {link.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

export default NavigationDrawer
