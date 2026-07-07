import { useState, useEffect } from 'react'
import { X, Upload } from 'lucide-react'
import { PoemWithId } from '../../services/poems'
import { uploadImage } from '../../services/cloudinary'

interface PoemFormProps {
  editingPoem?: PoemWithId | null
  onSubmit: (poemData: any) => Promise<void>
  onCancel?: () => void
}

const CATEGORIES = ['Love', 'Sad', 'Friendship', 'Motivation', 'Life', 'Heartbreak', 'Other']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function PoemForm({ editingPoem, onSubmit, onCancel }: PoemFormProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Love')
  const [month, setMonth] = useState('January')
  const [instagram, setInstagram] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editingPoem) {
      setTitle(editingPoem.title)
      setText(editingPoem.text)
      setCategory(editingPoem.category)
      setMonth(editingPoem.month)
      setInstagram(editingPoem.instagram)
      setImageUrl(editingPoem.image)
      setImagePreview(editingPoem.image)
    }
  }, [editingPoem])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let finalImageUrl = imageUrl

      // Upload new image if selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        finalImageUrl = uploadResult.secureUrl
      }

      const poemData = {
        title,
        text,
        image: finalImageUrl,
        category,
        month,
        instagram
      }

      await onSubmit(poemData)
      
      // Reset form after successful submission
      if (!editingPoem) {
        resetForm()
      }
    } catch (error) {
      console.error('Error submitting poem:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setText('')
    setCategory('Love')
    setMonth('January')
    setInstagram('')
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
  }

  const handleClear = () => {
    resetForm()
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors"
          placeholder="Enter poem title"
          required
        />
      </div>

      {/* Poem Text */}
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-foreground mb-2">
          Poem Text
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors resize-none"
          placeholder="Enter poem text..."
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {text.length} characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors"
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Month */}
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-foreground mb-2">
          Month
        </label>
        <select
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors"
          required
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Background Image
        </label>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/50 transition-colors">
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <label
              htmlFor="image"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to select an image
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, JPEG, PNG, WEBP (max 10MB)
              </span>
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt={`Preview of uploaded image for poem: ${title || 'Untitled'}`}
              loading="lazy"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Instagram Post URL */}
      <div>
        <label htmlFor="instagram" className="block text-sm font-medium text-foreground mb-2">
          Instagram Post URL
        </label>
        <input
          id="instagram"
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors"
          placeholder="https://instagram.com/p/..."
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Publishing...' : editingPoem ? 'Update' : 'Publish'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-secondary border border-border text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Form
        </button>
      </div>
    </form>
  )
}
