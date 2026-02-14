import { useState } from 'react'
import FileUpload from './components/FileUpload'
import DocumentList from './components/DocumentList'
import DocumentViewer from './components/DocumentViewer'
function App() {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [chatHistory, setChatHistory] = useState({}) // Store chat per document
  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }
  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc)
    // Initialize chat history for this document if it doesn't exist
    if (!chatHistory[doc.id]) {
      setChatHistory(prev => ({
        ...prev,
        [doc.id]: []
      }))
    }
  }
  const handleCloseViewer = () => {
    setSelectedDocument(null)
  }
  const updateChatHistory = (documentId, messages) => {
    setChatHistory(prev => ({
      ...prev,
      [documentId]: messages
    }))
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="glass m-4 p-6">
        <h1 className="text-4xl font-bold text-white">
          IntelliDoc
        </h1>
        <p className="text-gray-300 mt-2">
          AI-Powered Document Intelligence Platform
        </p>
      </header>
      {/* Main Content */}
      <main className="p-4 grid md:grid-cols-2 gap-4">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <DocumentList
          key={refreshKey}
          onSelectDocument={handleSelectDocument}
        />
      </main>
      {/* Document Viewer Modal */}
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
export default App