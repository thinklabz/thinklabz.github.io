/**
 * Cloudinary service for image uploads
 * Uses unsigned upload API with preset from environment variables
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Upload an image to Cloudinary using unsigned upload API
 * @param file - Image file to upload
 * @returns Object containing secure URL and public ID
 * @throws Error with readable message if upload fails
 */
export async function uploadImage(file: File): Promise<{ secureUrl: string; publicId: string }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit.')
  }

  // Validate environment variables
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration is missing. Please check environment variables.')
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload image to Cloudinary.')
    }

    if (!data.secure_url || !data.public_id) {
      throw new Error('Upload succeeded but no secure URL or public ID was returned.')
    }

    return { secureUrl: data.secure_url, publicId: data.public_id }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during image upload.')
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Cloudinary public ID of the image to delete
 * @throws Error with readable message if deletion fails
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary configuration is missing.')
  }

  try {
    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to delete image from Cloudinary.')
    }

    if (data.result !== 'ok') {
      throw new Error('Deletion failed on Cloudinary side.')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unexpected error occurred during image deletion.')
  }
}
