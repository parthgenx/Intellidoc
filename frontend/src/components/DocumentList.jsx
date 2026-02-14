import { useState, useEffect } from 'react'
import { File, Eye, Trash2, Search } from 'lucide-react'
import api from '../services/api'
function DocumentList({ onSelectDocument }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  useEffect(() => {
    fetchDocuments()
  }, [])
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/documents')
      setDocuments(response.data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }
  const deleteDocument = async (id) => {
    if (!confirm('Delete this document?')) return
    
    try {
      await api.delete(`/api/documents/${id}`)
      setDocuments(documents.filter(doc => doc.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }
  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )
  if (loading) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-gray-400">Loading documents...</p>
      </div>
    )
  }
  return (
    <div className="glass p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        Your Documents
      </h2>
      {/* Search Bar */}
      {documents.length > 0 && (
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
      {/* Document List */}
      {filteredDocuments.length === 0 ? (
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
              className="glass-hover p-4 flex items-center justify-between"
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
                  className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
                  title="View document"
                >
                  <Eye className="text-purple-400" size={20} />
                </button>
                
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="text-red-400" size={20} />
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