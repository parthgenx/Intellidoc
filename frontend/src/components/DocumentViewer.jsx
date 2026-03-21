import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, X, MessageSquare, FileText, Sparkles } from 'lucide-react'
import ChatInterface from './ChatInterface'
import DocumentAnalysis from './DocumentAnalysis'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

function DocumentViewer({ document: activeDocument, onClose, chatMessages, onUpdateChat }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [activeTab, setActiveTab] = useState('pdf')
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )

  useEffect(() => {
    setPageNumber(1)
    setActiveTab('pdf')
  }, [activeDocument?.id])

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    const browserDocument = globalThis.document
    const previousOverflow = browserDocument?.body?.style?.overflow

    if (browserDocument?.body) {
      browserDocument.body.style.overflow = 'hidden'
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      if (browserDocument?.body && previousOverflow !== undefined) {
        browserDocument.body.style.overflow = previousOverflow
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (activeTab !== 'pdf' || !numPages) {
        return
      }

      if (event.key === 'ArrowRight') {
        setPageNumber((current) => Math.min(numPages, current + 1))
      }

      if (event.key === 'ArrowLeft') {
        setPageNumber((current) => Math.max(1, current - 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, numPages, onClose])

  const horizontalPadding = viewportWidth < 640 ? 40 : viewportWidth < 1024 ? 120 : 260
  const pageWidth = Math.max(280, Math.min(940, viewportWidth - horizontalPadding))

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(24,29,38,0.52)] backdrop-blur-sm">
      <div className="flex h-full items-stretch justify-center p-0 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-viewer-title"
          className="glass flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-none sm:max-h-[94vh] sm:rounded-[32px]"
        >
          <div className="border-b border-[color:var(--color-border)] p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="eyebrow mb-2">Document workspace</p>
                <h3 id="document-viewer-title" className="truncate text-2xl text-[color:var(--color-text-primary)] sm:text-3xl">
                  {activeDocument.filename}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
                  Review the source, chat against the document, or generate a concise analysis.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className={`tab-button ${activeTab === 'pdf' ? 'tab-button-active' : ''}`}
                    aria-pressed={activeTab === 'pdf'}
                    type="button"
                  >
                    <FileText size={18} />
                    PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`tab-button ${activeTab === 'chat' ? 'tab-button-active' : ''}`}
                    aria-pressed={activeTab === 'chat'}
                    type="button"
                  >
                    <MessageSquare size={18} />
                    Chat
                    {chatMessages && chatMessages.length > 0 && (
                      <span className="rounded-full bg-white/18 px-2 py-0.5 text-xs font-semibold text-current">
                        {chatMessages.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`tab-button ${activeTab === 'analysis' ? 'tab-button-active' : ''}`}
                    aria-pressed={activeTab === 'analysis'}
                    type="button"
                  >
                    <Sparkles size={18} />
                    Analysis
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="icon-button shrink-0"
                  type="button"
                  aria-label="Close document viewer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden bg-[rgba(255,255,255,0.34)] p-3 sm:p-4 lg:p-6">
            {activeTab === 'pdf' ? (
              <div className="flex h-full items-start justify-center overflow-auto rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.62)] p-3 sm:p-6">
                <Document
                  file={activeDocument.file_url}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="text-[color:var(--color-text-muted)]">Loading PDF...</div>}
                  error={<div className="text-[color:var(--color-danger-strong)]">Failed to load PDF.</div>}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="shadow-lg"
                  />
                </Document>
              </div>
            ) : activeTab === 'chat' ? (
              <div className="h-full rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.58)] p-4 sm:p-6">
                <ChatInterface
                  document={activeDocument}
                  messages={chatMessages || []}
                  onUpdateMessages={onUpdateChat}
                />
              </div>
            ) : (
              <div className="h-full rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.58)] p-4 sm:p-6">
                <DocumentAnalysis document={activeDocument} />
              </div>
            )}
          </div>

          {activeTab === 'pdf' && numPages && (
            <div className="border-t border-[color:var(--color-border)] p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                  className="secondary-button"
                  type="button"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <p className="text-center text-sm font-semibold text-[color:var(--color-text-secondary)]">
                  Page {pageNumber} of {numPages}. Use left and right arrow keys to navigate.
                </p>
                <button
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                  className="secondary-button"
                  type="button"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentViewer
