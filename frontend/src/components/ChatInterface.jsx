import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import api from '../services/api'
import toast from 'react-hot-toast'

function ChatInterface({ document, messages = [], onUpdateMessages = () => { } }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    onUpdateMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/api/chat', {
        question: input,
        document_id: document.id
      })
      const answerText = typeof response.data.answer === 'string'
        ? response.data.answer
        : JSON.stringify(response.data.answer)
      const aiMessage = {
        role: 'assistant',
        content: answerText,
        sources: response.data.sources || []
      }
      onUpdateMessages([...newMessages, aiMessage])
    } catch (error) {
      toast.error('Failed to get AI response. Please try again.')
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      onUpdateMessages([...newMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4">
        <p className="eyebrow mb-3">Grounded chat</p>
        <h2 className="text-2xl text-[color:var(--color-text-primary)] sm:text-3xl">
          Chat with {document.filename}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)] sm:text-base">
          Answers stay anchored to the retrieved passages from this document.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.42)] p-4 sm:p-5">
        <div className="h-full overflow-y-auto pr-1" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state mt-6 px-6 py-10 text-center">
              <div className="mx-auto mb-5 inline-flex rounded-[24px] bg-[color:var(--color-teal-soft)] p-4 text-[color:var(--color-teal-strong)]">
                <Bot size={28} />
              </div>
              <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                Ask anything about this document
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--color-text-muted)]">
                Try a question about the summary, key dates, obligations, or the main findings in
                the PDF.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-teal)] text-white shadow-[0_10px_20px_rgba(42,157,143,0.2)]">
                      <Bot size={18} />
                    </div>
                  )}
                  <div className={`max-w-[86%] sm:max-w-[72%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-[24px] border px-4 py-3.5 shadow-sm ${
                        msg.role === 'user'
                          ? 'border-[rgba(231,111,81,0.16)] bg-[linear-gradient(135deg,#e76f51,#f19c67)] text-white'
                          : 'border-[color:var(--color-border)] bg-[rgba(255,255,255,0.92)] text-[color:var(--color-text-primary)]'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto">
                                  <table {...props} />
                                </div>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-7">{msg.content}</p>
                      )}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">
                        {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} referenced
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(31,41,51,0.9)] text-white shadow-[0_10px_20px_rgba(31,41,51,0.18)]">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-teal)] text-white shadow-[0_10px_20px_rgba(42,157,143,0.2)]">
                    <Bot size={18} />
                  </div>
                  <div className="rounded-[22px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.92)] p-4">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--color-text-muted)]" />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--color-text-muted)]"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--color-text-muted)]"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="input-field flex-1"
          disabled={loading}
          aria-label="Ask a question about this document"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="primary-button sm:px-6"
          aria-label="Send question"
        >
          <Send size={20} />
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}

export default ChatInterface
