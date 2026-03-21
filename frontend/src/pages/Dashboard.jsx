import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FileText, LogOut, MessageSquareText, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="glass relative overflow-hidden p-6 fade-in sm:p-8 lg:p-10">
          <div className="absolute -right-8 top-6 h-48 w-48 rounded-full bg-[color:var(--color-accent-soft)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[color:var(--color-teal-soft)] blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow mb-4">Document workspace</p>
              <h1 className="max-w-3xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
                A calmer way to upload, read, and question your PDFs.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)] sm:text-lg">
                Keep the document, the chat, and the AI analysis in a single workflow designed for
                focused reading instead of tool hopping.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="metric-chip">
                  <FileText size={14} />
                  Source-visible reading
                </span>
                <span className="metric-chip">
                  <MessageSquareText size={14} />
                  Grounded chat
                </span>
                <span className="metric-chip">
                  <Sparkles size={14} />
                  Fast summaries
                </span>
              </div>
            </div>

            <div className="glass max-w-md p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                Signed in as
              </p>
              <p className="mt-2 break-all text-lg font-semibold text-[color:var(--color-text-primary)]">
                {user?.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
                Upload PDFs, open any document, then switch between the source, chat, and analysis
                views without leaving the workspace.
              </p>
              <button
                onClick={handleSignOut}
                className="secondary-button mt-5 w-full justify-center"
                title="Sign out"
                type="button"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)]">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <DocumentList key={refreshKey} onSelectDocument={handleSelectDocument} />
        </main>
      </div>

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
