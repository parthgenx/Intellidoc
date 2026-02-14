import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { uploadDocument } from '../services/api'
function FileUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setUploadSuccess(false)
    }
  }, [])
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
    
    try {
      const data = await uploadDocument(selectedFile)
      console.log('Upload success:', data)
      setUploadSuccess(true)
      
      // Call parent callback to refresh document list
      if (onUploadSuccess) {
        onUploadSuccess()
      }
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedFile(null)
        setUploadSuccess(false)
      }, 2000)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  return (
    <div className="glass p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Upload Document
      </h2>
      {/* Dropzone */}
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
            disabled:from-gray-600 disabled:to-gray-600
            text-white font-semibold py-3 px-6 rounded-lg
            transition-all duration-200
          "
        >
          {uploading ? 'Uploading & Processing...' : 'Upload Document'}
        </button>
      )}
    </div>
  )
}
export default FileUpload