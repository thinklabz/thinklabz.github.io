import html2canvas from 'html2canvas'

export async function downloadCard(element: HTMLElement, filename: string = 'card.png'): Promise<void> {
  try {
    // Create a canvas with the desired resolution (1080x1080)
    const canvas = await html2canvas(element, {
      width: 1080,
      height: 1080,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    })

    // Convert canvas to blob
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  } catch (error) {
    console.error('Error downloading card:', error)
    throw error
  }
}
