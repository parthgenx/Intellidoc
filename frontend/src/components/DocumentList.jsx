import { useState, useEffect } from 'react'
import { File, Eye, Trash2, Search } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

function DocumentList({ onSelectDocument }) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchDocuments()
    }
  }, [user?.id])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/documents?user_id=${user.id}`)
      setDocuments(response.data.documents)
    } catch (error) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/api/documents/${id}`)
      setDocuments(documents.filter(doc => doc.id !== id))
      toast.success('Document deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (size = 0) => `${(size / 1024 / 1024).toFixed(2)} MB`

  return (
    <section className="glass p-6 fade-in sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Library</p>
          <h2 className="text-2xl text-[color:var(--color-text-primary)] sm:text-3xl">Your documents</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
            Open any file to read the source, chat with it, or generate a concise analysis.
          </p>
        </div>
        <div className="metric-chip self-start sm:self-auto">
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </div>
      </div>

      {documents.length > 0 && !loading && (
        <div className="relative mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
            aria-label="Search documents"
          />
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex min-h-[16rem] items-center justify-center rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.5)]">
          <LoadingSpinner size="lg" message="Loading your document library..." />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="empty-state mt-8 px-6 py-12 text-center">
          <div className="mx-auto mb-5 inline-flex rounded-[26px] bg-[color:var(--color-accent-soft)] p-4 text-[color:var(--color-accent-strong)]">
            <File size={34} />
          </div>
          <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
            {searchQuery ? 'No documents match your search' : 'No documents yet'}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--color-text-muted)]">
            {searchQuery
              ? 'Try a different filename or clear the search field.'
              : 'Upload your first PDF to start reading, chatting, and summarizing inside the viewer.'}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filteredDocuments.map((doc) => (
            <article key={doc.id} className="glass-hover p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="rounded-[22px] bg-[color:var(--color-accent-soft)] p-3 text-[color:var(--color-accent-strong)]">
                    <File size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[color:var(--color-text-primary)] sm:text-lg">
                      {doc.filename}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[color:var(--color-text-muted)]">
                      <span className="status-pill">{doc.status}</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="icon-button"
                    title="Open document"
                    aria-label={`Open ${doc.filename}`}
                    type="button"
                  >
                    <Eye size={19} />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="icon-button icon-button-danger"
                    title="Delete document"
                    aria-label={`Delete ${doc.filename}`}
                    type="button"
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default DocumentList
