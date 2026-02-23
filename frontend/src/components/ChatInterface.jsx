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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <h2 className="text-2xl font-bold text-white mb-4">Chat with {document.filename}</h2>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>Ask me anything about this document!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-white" />
                </div>
              )}
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => <p style={{ marginBottom: '0.5rem' }} {...props} />,
                          ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', marginBottom: '0.5rem', marginLeft: '0.5rem' }} {...props} />,
                          ol: ({ node, ...props }) => <ol style={{ listStyleType: 'decimal', listStylePosition: 'inside', marginBottom: '0.5rem', marginLeft: '0.5rem' }} {...props} />,
                          li: ({ node, ...props }) => <li style={{ marginLeft: '0.5rem', marginBottom: '0.25rem' }} {...props} />,
                          strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold', color: '#c084fc' }} {...props} />,
                          em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
                          code: ({ node, ...props }) => <code style={{ backgroundColor: '#1f2937', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.875rem' }} {...props} />,
                          table: ({ node, ...props }) => (
                            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead style={{ backgroundColor: '#374151' }} {...props} />,
                          tbody: ({ node, ...props }) => <tbody {...props} />,
                          tr: ({ node, ...props }) => <tr style={{ borderBottom: '1px solid #4b5563' }} {...props} />,
                          th: ({ node, ...props }) => <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', color: '#c084fc' }} {...props} />,
                          td: ({ node, ...props }) => <td style={{ padding: '0.5rem' }} {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    📚 {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} used
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/50 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}

export default ChatInterface