import { useState } from 'react'
import { Sparkles, FileText, Tag, Loader } from 'lucide-react'
import api from '../services/api'
function DocumentAnalysis({ document }) {
  const [summary, setSummary] = useState(null)
  const [entities, setEntities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const generateSummary = async () => {
    setLoading(true)
    try {
      const response = await api.post(`/api/documents/${document.id}/summarize`)
      setSummary(response.data)
    } catch (error) {
      console.error('Summary error:', error)
    } finally {
      setLoading(false)
    }
  }
  const extractEntities = async () => {
    setLoading(true)
    try {
      const response = await api.post(`/api/documents/${document.id}/extract`)
      setEntities(response.data)
    } catch (error) {
      console.error('Extraction error:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col h-[600px]">
      <h2 className="text-2xl font-bold text-white mb-4">
        Document Analysis
      </h2>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <FileText size={18} />
          Summary
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'entities'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Tag size={18} />
          Entities
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'summary' ? (
          <div>
            {!summary ? (
              <div className="text-center py-12">
                <Sparkles size={48} className="mx-auto mb-4 text-purple-400 opacity-50" />
                <p className="text-gray-400 mb-4">Generate an AI summary of this document</p>
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg text-white transition-colors flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Summary</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
                </div>
                {summary.key_points && summary.key_points.length > 0 && (
                  <div className="glass p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {summary.key_points.map((point, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-300">
                          <span className="text-purple-400">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {!entities ? (
              <div className="text-center py-12">
                <Tag size={48} className="mx-auto mb-4 text-purple-400 opacity-50" />
                <p className="text-gray-400 mb-4">Extract key information from this document</p>
                <button
                  onClick={extractEntities}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg text-white transition-colors flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Tag size={20} />
                      Extract Entities
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {entities.entities.dates && entities.entities.dates.length > 0 && (
                  <div className="glass p-4">
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">📅 Dates</h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.dates.map((date, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entities.entities.amounts && entities.entities.amounts.length > 0 && (
                  <div className="glass p-4">
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">💰 Amounts</h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.amounts.map((amount, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
                          {amount}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entities.entities.names && entities.entities.names.length > 0 && (
                  <div className="glass p-4">
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">👤 Names</h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.names.map((name, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entities.entities.other && entities.entities.other.length > 0 && (
                  <div className="glass p-4">
                    <h3 className="text-sm font-semibold text-purple-400 mb-2">🏷️ Other</h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.other.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-600/20 text-gray-300 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={extractEntities}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm"
                >
                  Re-extract
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default DocumentAnalysis