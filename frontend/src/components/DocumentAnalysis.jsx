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

  const entityStyles = {
    dates: 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-strong)]',
    amounts: 'bg-[color:var(--color-teal-soft)] text-[color:var(--color-teal-strong)]',
    names: 'bg-[rgba(59,130,246,0.12)] text-[color:#2855b2]',
    other: 'bg-[rgba(70,58,44,0.08)] text-[color:var(--color-text-secondary)]',
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4">
        <p className="eyebrow mb-3">AI analysis</p>
        <h2 className="text-2xl text-[color:var(--color-text-primary)] sm:text-3xl">
          Document analysis
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
          Generate a concise summary or extract the key entities from {document.filename}.
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('summary')}
          className={`tab-button ${activeTab === 'summary' ? 'tab-button-active' : ''}`}
          type="button"
          aria-pressed={activeTab === 'summary'}
        >
          <FileText size={18} />
          Summary
        </button>
        <button
          onClick={() => setActiveTab('entities')}
          className={`tab-button ${activeTab === 'entities' ? 'tab-button-active' : ''}`}
          type="button"
          aria-pressed={activeTab === 'entities'}
        >
          <Tag size={18} />
          Entities
        </button>
      </div>

      <div className="flex-1 overflow-hidden rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.42)] p-4 sm:p-5">
        <div className="h-full overflow-y-auto pr-1">
        {activeTab === 'summary' ? (
          <div>
            {!summary ? (
              <div className="empty-state px-6 py-12 text-center">
                <div className="mx-auto mb-5 inline-flex rounded-[24px] bg-[color:var(--color-accent-soft)] p-4 text-[color:var(--color-accent-strong)]">
                  <Sparkles size={30} />
                </div>
                <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                  Generate an AI summary of this document
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--color-text-muted)]">
                  Get a quick overview plus a short set of key points you can scan before diving
                  into the source text.
                </p>
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="primary-button mx-auto mt-6"
                  type="button"
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
                <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.85)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
                  <h3 className="text-lg text-[color:var(--color-text-primary)]">Summary</h3>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-[color:var(--color-text-secondary)]">
                    {summary.summary}
                  </p>
                </div>
                {summary.key_points && summary.key_points.length > 0 && (
                  <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.85)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
                    <h3 className="text-lg text-[color:var(--color-text-primary)]">Key points</h3>
                    <ul className="mt-4 space-y-3">
                      {summary.key_points.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-[color:var(--color-text-secondary)]">
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--color-teal)]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="secondary-button"
                  type="button"
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {!entities ? (
              <div className="empty-state px-6 py-12 text-center">
                <div className="mx-auto mb-5 inline-flex rounded-[24px] bg-[color:var(--color-teal-soft)] p-4 text-[color:var(--color-teal-strong)]">
                  <Tag size={30} />
                </div>
                <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                  Extract key information from this document
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--color-text-muted)]">
                  Pull out dates, amounts, names, and other high-signal entities into quick scan
                  chips.
                </p>
                <button
                  onClick={extractEntities}
                  disabled={loading}
                  className="primary-button mx-auto mt-6"
                  type="button"
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
                  <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.85)] p-4 shadow-[var(--shadow-soft)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Dates
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.dates.map((date, idx) => (
                        <span key={idx} className={`rounded-full px-3 py-1 text-sm font-medium ${entityStyles.dates}`}>
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entities.entities.amounts && entities.entities.amounts.length > 0 && (
                  <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.85)] p-4 shadow-[var(--shadow-soft)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Amounts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.amounts.map((amount, idx) => (
                        <span key={idx} className={`rounded-full px-3 py-1 text-sm font-medium ${entityStyles.amounts}`}>
                          {amount}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entities.entities.names && entities.entities.names.length > 0 && (
                  <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.85)] p-4 shadow-[var(--shadow-soft)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Names
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.names.map((name, idx) => (
                        <span key={idx} className={`rounded-full px-3 py-1 text-sm font-medium ${entityStyles.names}`}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entities.entities.other && entities.entities.other.length > 0 && (
                  <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.85)] p-4 shadow-[var(--shadow-soft)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                      Other
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {entities.entities.other.map((item, idx) => (
                        <span key={idx} className={`rounded-full px-3 py-1 text-sm font-medium ${entityStyles.other}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={extractEntities}
                  disabled={loading}
                  className="secondary-button"
                  type="button"
                >
                  Re-extract
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default DocumentAnalysis
