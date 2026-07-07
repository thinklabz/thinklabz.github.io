import { PoemWithId } from '../services/poems'

const websiteUrl = 'https://zerodot.in'

export async function sharePoem(poem: PoemWithId): Promise<void> {
  const shareContent = `✨ ${poem.title || 'Poem'}\n\n${poem.text}\n\nDiscover more poems:\n${websiteUrl}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: poem.title || 'Poem',
        text: shareContent,
      })
    } catch (error) {
      // User cancelled or share failed
      console.log('Share cancelled or failed')
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareContent)
      alert('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
}
