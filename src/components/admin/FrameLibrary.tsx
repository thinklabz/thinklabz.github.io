import { useState, useEffect } from 'react'
import { Edit, Trash2, GripVertical, Upload, Eye, EyeOff } from 'lucide-react'
import { FrameWithId } from '../../types/frames'
import { 
  getAllFrames, 
  createFrame, 
  updateFrame, 
  deleteFrame
} from '../../services/frames'

interface FrameLibraryProps {
  onFrameSelect?: (frame: FrameWithId) => void
  selectedFrameId?: string
}

export default function FrameLibrary({ onFrameSelect, selectedFrameId }: FrameLibraryProps) {
  const [frames, setFrames] = useState<FrameWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [editingFrame, setEditingFrame] = useState<FrameWithId | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadFrames()
  }, [])

  const loadFrames = async () => {
    try {
      setIsLoading(true)
      const data = await getAllFrames()
      setFrames(data)
    } catch (error) {
      console.error('Error loading frames:', error)
      setFrames([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      
      const { uploadImage } = await import('../../services/cloudinary')
      const uploadResult = await uploadImage(file)
      
      const newFrame = await createFrame({
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: uploadResult.secureUrl,
        storagePath: uploadResult.publicId,
        enabled: true,
        sortOrder: frames.length
      })
      
      setFrames([...frames, newFrame])
    } catch (error) {
      console.error('Error uploading frame:', error)
      alert('Failed to upload frame. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleReplace = async (frameId: string, file: File) => {
    try {
      setIsUploading(true)
      
      const { uploadImage } = await import('../../services/cloudinary')
      const uploadResult = await uploadImage(file)
      
      await updateFrame(frameId, {
        imageUrl: uploadResult.secureUrl,
        storagePath: uploadResult.publicId
      })
      
      await loadFrames()
    } catch (error) {
      console.error('Error replacing frame:', error)
      alert('Failed to replace frame. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRename = async (frameId: string, newName: string) => {
    try {
      await updateFrame(frameId, { name: newName })
      await loadFrames()
      setEditingFrame(null)
    } catch (error) {
      console.error('Error renaming frame:', error)
      alert('Failed to rename frame. Please try again.')
    }
  }

  const handleToggleEnabled = async (frameId: string, enabled: boolean) => {
    try {
      await updateFrame(frameId, { enabled })
      await loadFrames()
    } catch (error) {
      console.error('Error toggling frame:', error)
      alert('Failed to update frame. Please try again.')
    }
  }

  const handleDelete = async (frameId: string) => {
    try {
      await deleteFrame(frameId)
      setShowDeleteConfirm(null)
      await loadFrames()
    } catch (error) {
      console.error('Error deleting frame:', error)
      alert('Failed to delete frame. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border border-border/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Upload New Frame</h3>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              accept="image/png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
              className="hidden"
              disabled={isUploading}
            />
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg cursor-pointer transition-colors border border-border/20">
              <Upload className="w-4 h-4" />
              <span className="text-sm">
                {isUploading ? 'Uploading...' : 'Choose PNG Frame'}
              </span>
            </div>
          </label>
          <p className="text-xs text-muted-foreground">
            Transparent PNG recommended
          </p>
        </div>
      </div>

      {/* Frames List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Frame Library ({frames.length})</h3>
        
        {frames.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No frames uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {frames.map((frame) => (
              <div
                key={frame.id}
                className={`flex items-center gap-4 p-4 bg-secondary/30 border border-border/20 rounded-lg transition-colors ${
                  !frame.enabled ? 'opacity-50' : ''
                }`}
              >
                {/* Drag Handle */}
                <button
                  className="cursor-grab hover:text-primary transition-colors"
                  disabled={frames.length < 2}
                  title="Drag to reorder"
                >
                  <GripVertical className="w-5 h-5" />
                </button>

                {/* Preview */}
                <div 
                  className={`w-16 h-16 bg-muted rounded-lg overflow-hidden border border-border/20 cursor-pointer ${
                    selectedFrameId === frame.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onFrameSelect?.(frame)}
                >
                  <img
                    src={frame.imageUrl}
                    alt={frame.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                {editingFrame?.id === frame.id ? (
                  <input
                    type="text"
                    defaultValue={frame.name}
                    onBlur={(e) => handleRename(frame.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(frame.id, e.currentTarget.value)
                      } else if (e.key === 'Escape') {
                        setEditingFrame(null)
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 font-medium">{frame.name}</span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingFrame(frame)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    title="Rename"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleEnabled(frame.id, !frame.enabled)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    title={frame.enabled ? 'Disable' : 'Enable'}
                  >
                    {frame.enabled ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <label className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Replace">
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleReplace(frame.id, file)
                      }}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <Upload className="w-4 h-4" />
                  </label>

                  <button
                    onClick={() => setShowDeleteConfirm(frame.id)}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Frame</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this frame? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
