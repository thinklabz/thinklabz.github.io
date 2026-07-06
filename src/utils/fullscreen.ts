export const enterFullscreen = async (element?: HTMLElement) => {
  try {
    const target = element || document.documentElement
    if (target.requestFullscreen) {
      await target.requestFullscreen()
    } else if ((target as any).webkitRequestFullscreen) {
      await (target as any).webkitRequestFullscreen()
    } else if ((target as any).msRequestFullscreen) {
      await (target as any).msRequestFullscreen()
    }
  } catch (error) {
    console.error('Error entering fullscreen:', error)
  }
}

export const exitFullscreen = async () => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen()
    }
  } catch (error) {
    console.error('Error exiting fullscreen:', error)
  }
}

export const toggleFullscreen = async (element?: HTMLElement) => {
  if (isFullscreen()) {
    await exitFullscreen()
  } else {
    await enterFullscreen(element)
  }
}

export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).msFullscreenElement
  )
}

export const isFullscreenSupported = (): boolean => {
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).msFullscreenEnabled
  )
}
