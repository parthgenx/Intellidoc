import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { uploadDocument } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

function FileUpload({ onUploadSuccess }) {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const uploadHighlights = ['PDF only', 'OCR ready', 'Private to your workspace']

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setUploadSuccess(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    const toastId = toast.loading('Uploading document...')

    try {
      setUploadProgress(20)
      await uploadDocument(selectedFile, user.id)
      setUploadProgress(100)
      setUploadSuccess(true)
      toast.dismiss(toastId)
      toast.success('Document uploaded. Processing has started.')

      if (onUploadSuccess) onUploadSuccess()

      setTimeout(() => {
        setSelectedFile(null)
        setUploadSuccess(false)
        setUploadProgress(0)
      }, 2000)

    } catch (error) {
      toast.dismiss(toastId)
      toast.error('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="glass p-6 fade-in sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Ingest PDFs</p>
          <h2 className="text-2xl text-[color:var(--color-text-primary)] sm:text-3xl">Upload a document</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
            Drop a PDF and IntelliDoc will extract the text, prepare chunks for retrieval, and make
            the document ready for grounded chat and analysis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {uploadHighlights.map((item) => (
            <span key={item} className="metric-chip">
              {item}
            </span>
          ))}
        </div>
      </div>

      {uploading ? (
        <div className="mt-8 rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.62)] p-8 text-center shadow-[var(--shadow-soft)] sm:p-10">
          <LoadingSpinner size="lg" message="Uploading and processing document..." />
          <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-[rgba(70,58,44,0.08)]">
            <div
              className="h-3 rounded-full bg-[linear-gradient(135deg,var(--color-accent),#ef8a62)] transition-all duration-500 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-[color:var(--color-text-secondary)]">
            {uploadProgress}% complete
          </p>
        </div>
      ) : (
        <div
          {...getRootProps({ 'aria-label': 'Upload PDF document' })}
          className={`mt-8 cursor-pointer rounded-[28px] border-2 border-dashed p-8 transition-all duration-200 sm:p-10 ${
            isDragActive
              ? 'border-[color:var(--color-teal)] bg-[color:var(--color-teal-soft)]'
              : 'border-[rgba(70,58,44,0.18)] bg-[rgba(255,255,255,0.46)] hover:border-[color:var(--color-accent)] hover:bg-[rgba(255,255,255,0.68)]'
          }`}
        >
          <input {...getInputProps({ 'aria-label': 'Choose PDF file' })} />
          <div className="flex flex-col gap-5 text-left sm:flex-row sm:items-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-strong)] shadow-[var(--shadow-soft)]">
              <Upload size={30} />
            </div>

            <div className="flex-1">
              <p className="text-lg font-semibold text-[color:var(--color-text-primary)] sm:text-xl">
                {isDragActive ? 'Drop the PDF here' : 'Drag and drop a PDF here'}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
                Or click to browse from your device. Larger scanned files are supported through the
                OCR fallback in the backend.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedFile && !uploadSuccess && (
        <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.74)] p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[color:var(--color-teal-soft)] p-3 text-[color:var(--color-teal-strong)]">
              <File size={22} />
            </div>
            <div>
              <p className="font-semibold text-[color:var(--color-text-primary)]">{selectedFile.name}</p>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="icon-button self-end sm:self-auto"
            aria-label="Remove selected file"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-6 flex items-center gap-3 rounded-[22px] border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-700 shadow-[var(--shadow-soft)]">
          <CheckCircle size={22} />
          <p className="font-semibold">File uploaded successfully. Processing is running in the background.</p>
        </div>
      )}

      {selectedFile && !uploadSuccess && (
        <button
          onClick={handleUpload}
          type="button"
          disabled={uploading}
          className="primary-button mt-6 w-full justify-center"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading & Processing...
            </span>
          ) : 'Upload document'}
        </button>
      )}
    </section>
  )
}

export default FileUpload
