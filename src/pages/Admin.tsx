import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { logout } from '../services/auth'
import { getAllPoems, createPoem, updatePoem, deletePoem, PoemWithId } from '../services/poems'
import PoemForm from '../components/admin/PoemForm'
import PoemCard from '../components/admin/PoemCard'
import Skeleton from '../components/admin/Skeleton'
import Toast, { ToastType } from '../components/admin/Toast'
import DeleteConfirmDialog from '../components/admin/DeleteConfirmDialog'
import FrameLibrary from '../components/admin/FrameLibrary'
import SEO from '../components/SEO'

export default function Admin() {
  const navigate = useNavigate()
  const [poems, setPoems] = useState<PoemWithId[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPoem, setEditingPoem] = useState<PoemWithId | null>(null)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [poemToDelete, setPoemToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'poems' | 'frames'>('poems')

  useEffect(() => {
    fetchPoems()
  }, [])

  const fetchPoems = async () => {
    try {
      setIsLoading(true)
      const fetchedPoems = await getAllPoems()
      setPoems(fetchedPoems)
    } catch (error) {
      showToast('Failed to fetch poems', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSubmit = async (poemData: any) => {
    try {
      if (editingPoem) {
        await updatePoem(editingPoem.id, poemData)
        showToast('Poem updated successfully', 'success')
        setEditingPoem(null)
      } else {
        await createPoem(poemData)
        showToast('Poem published successfully', 'success')
      }
      
      await fetchPoems()
    } catch (error) {
      showToast(editingPoem ? 'Failed to update poem' : 'Failed to publish poem', 'error')
      throw error
    }
  }

  const handleEdit = (poem: PoemWithId) => {
    setEditingPoem(poem)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteClick = (id: string) => {
    setPoemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!poemToDelete) return

    try {
      await deletePoem(poemToDelete)
      showToast('Poem deleted successfully', 'success')
      await fetchPoems()
    } catch (error) {
      showToast('Failed to delete poem', 'error')
    } finally {
      setDeleteDialogOpen(false)
      setPoemToDelete(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingPoem(null)
  }

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Admin dashboard for managing poetry collection"
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your poetry collection and frames</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground hover:bg-secondary/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('poems')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'poems'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
            }`}
          >
            Poems
          </button>
          <button
            onClick={() => setActiveTab('frames')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'frames'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
            }`}
          >
            Frames
          </button>
        </div>

        {/* Poems Tab */}
        {activeTab === 'poems' && (
          <>
            {/* Form Section */}
            <div className="bg-secondary/30 border border-border/20 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {editingPoem ? 'Edit Poem' : 'Create New Poem'}
              </h2>
              <PoemForm
                editingPoem={editingPoem}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
              />
            </div>

            {/* Existing Poems Section */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Existing Poems ({poems.length})
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} />
                  ))}
                </div>
              ) : poems.length === 0 ? (
                <div className="bg-secondary/30 border border-border/20 rounded-xl p-12 text-center">
                  <p className="text-muted-foreground text-lg">No poems yet</p>
                  <p className="text-muted-foreground text-sm mt-2">Create your first poem using the form above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {poems.map((poem) => (
                    <PoemCard
                      key={poem.id}
                      poem={poem}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Frames Tab */}
        {activeTab === 'frames' && (
          <FrameLibrary />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      </div>
    </>
  )
}
