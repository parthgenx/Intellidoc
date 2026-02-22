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
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/api/documents?user_id=${user.id}`)
      setDocuments(response.data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
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
      console.error('Error deleting:', error)
      toast.error('Failed to delete document')
    }
  }


  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="glass p-6 fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">
        Your Documents
      </h2>

      {/* Search Bar */}
      {documents.length > 0 && !loading && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-600 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-8">
          <File className="mx-auto mb-4 text-gray-500" size={48} />
          <p className="text-gray-400">
            {searchQuery ? 'No documents match your search' : 'No documents yet. Upload one to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="glass-hover p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 flex-1">
                <File className="text-purple-400" size={24} />
                <div className="flex-1">
                  <p className="text-white font-medium">{doc.filename}</p>
                  <p className="text-gray-400 text-sm">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB • {doc.status}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectDocument(doc)}
                  className="p-2 hover:bg-purple-500/20 rounded-lg transition-all hover:scale-110"
                  title="View document"
                >
                  <Eye className="text-purple-400 group-hover:text-purple-300 transition-colors" size={20} />
                </button>


                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                  title="Delete document"
                >
                  <Trash2 className="text-red-400 hover:text-red-300 transition-colors" size={20} />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentList