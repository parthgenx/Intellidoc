import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import FileUpload from '../components/FileUpload'
import DocumentList from '../components/DocumentList'
import DocumentViewer from '../components/DocumentViewer'

function Dashboard() {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [chatHistory, setChatHistory] = useState({})
  const { user, signOut } = useAuth()

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc)
    if (!chatHistory[doc.id]) {
      setChatHistory(prev => ({ ...prev, [doc.id]: [] }))
    }
  }

  const handleCloseViewer = () => {
    setSelectedDocument(null)
  }

  const updateChatHistory = (documentId, messages) => {
    setChatHistory(prev => ({ ...prev, [documentId]: messages }))
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="glass m-4 p-8 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-2">IntelliDoc</h1>
            <p className="text-gray-400 text-lg">AI-Powered Document Intelligence Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="text-purple-400 font-semibold">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-3 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
              title="Sign out"
            >
              <LogOut className="text-red-400" size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 grid md:grid-cols-2 gap-4">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <DocumentList key={refreshKey} onSelectDocument={handleSelectDocument} />
      </main>

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={handleCloseViewer}
          chatMessages={chatHistory[selectedDocument.id] || []}
          onUpdateChat={(messages) => updateChatHistory(selectedDocument.id, messages)}
        />
      )}
    </div>
  )
}

export default Dashboard
