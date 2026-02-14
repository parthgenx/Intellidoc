import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, X, MessageSquare, FileText, Sparkles } from 'lucide-react'
import ChatInterface from './ChatInterface'
import DocumentAnalysis from './DocumentAnalysis'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
function DocumentViewer({ document, onClose, chatMessages, onUpdateChat }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [activeTab, setActiveTab] = useState('pdf')
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">{document.filename}</h3>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'pdf'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={18} />
              PDF
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={18} />
              Chat
              {chatMessages && chatMessages.length > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chatMessages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'analysis'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={18} />
              Analysis
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'pdf' ? (
            <div className="flex justify-center">
              <Document
                file={document.file_url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="text-gray-400">Loading PDF...</div>}
                error={<div className="text-red-400">Failed to load PDF</div>}
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-lg"
                />
              </Document>
            </div>
          ) : activeTab === 'chat' ? (
            <ChatInterface
              document={document}
              messages={chatMessages || []}
              onUpdateMessages={onUpdateChat}
            />
          ) : (
            <DocumentAnalysis document={document} />
          )}
        </div>
        {/* PDF Navigation */}
        {activeTab === 'pdf' && numPages && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <p className="text-gray-300">
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg text-white transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default DocumentViewer