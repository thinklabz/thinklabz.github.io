export const triggerHaptic = (duration: number = 10) => {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(duration)
    } catch (error) {
      // Silently ignore errors for browsers that don't support vibration
    }
  }
}
