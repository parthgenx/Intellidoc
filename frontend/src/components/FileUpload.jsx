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
  // Handle file drop
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setUploadSuccess(false)
    }
  }
  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })
  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    const toastId = toast.loading('Uploading document...')

    try {
      // Simulate progress updates
      setUploadProgress(20)

      const data = await uploadDocument(selectedFile, user.id)
      console.log('Upload success:', data)

      setUploadProgress(100)
      setUploadSuccess(true)
      toast.dismiss(toastId)
      toast.success('Document uploaded and processed successfully!')

      // Call parent callback to refresh document list
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedFile(null)
        setUploadSuccess(false)
        setUploadProgress(0)
      }, 2000)

    }catch (error) {
      console.error('Upload error:', error)
      toast.dismiss(toastId)
      toast.error('Upload failed: ' + error.message)

    } finally {
      setUploading(false)
    }
  }
  return (
    <div className="glass p-8 fade-in">
      <h2 className="text-2xl font-bold text-white mb-6">
        Upload Document
      </h2>
      {/* Dropzone or Loading State */}
      {uploading ? (
        <div className="border-2 border-dashed border-purple-500 rounded-lg p-12 text-center">
          <LoadingSpinner size="lg" message="Uploading and processing document..." />

          {/* Progress bar */}
          <div className="mt-6 w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2 font-medium">{uploadProgress}%</p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-purple-400'
            }
          `}
        >
          <input {...getInputProps()} />

          <Upload className="mx-auto mb-4 text-gray-400" size={48} />

          {isDragActive ? (
            <p className="text-purple-400 text-lg">Drop the PDF here...</p>
          ) : (
            <div>
              <p className="text-gray-300 text-lg mb-2">
                Drag & drop a PDF here
              </p>
              <p className="text-gray-500 text-sm">
                or click to select a file
              </p>
            </div>
          )}
        </div>
      )}
      {/* Selected File */}
      {selectedFile && !uploadSuccess && (
        <div className="mt-6 glass p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="text-purple-400" size={24} />
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      )}
      {/* Success Message */}
      {uploadSuccess && (
        <div className="mt-6 glass p-4 flex items-center gap-3 bg-green-500/10 border-green-500/30">
          <CheckCircle className="text-green-400" size={24} />
          <p className="text-green-400 font-medium">
            File uploaded and processed successfully!
          </p>
        </div>
      )}
      {/* Upload Button */}
      {selectedFile && !uploadSuccess && (
        <button
  onClick={handleUpload}
  disabled={uploading}
  className="
    mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600
    hover:from-purple-700 hover:to-pink-700
    hover:shadow-lg hover:shadow-purple-500/50
    disabled:from-gray-600 disabled:to-gray-600
    disabled:cursor-not-allowed
    text-white font-bold py-4 px-6 rounded-xl
    transition-all duration-300
    transform hover:scale-[1.02] active:scale-[0.98]
  "
>
  {uploading ? (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Uploading & Processing...
    </span>
  ) : (
    'Upload Document'
  )}
</button>

      )}
    </div>
  )
}
export default FileUpload