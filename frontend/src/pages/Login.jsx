import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, LogIn, MessageSquareText, ShieldCheck } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const highlights = [
    {
      icon: FileText,
      title: 'Readable uploads',
      description: 'Turn dense PDFs into a clean, searchable workspace.',
    },
    {
      icon: MessageSquareText,
      title: 'Grounded chat',
      description: 'Ask focused questions with answers based on retrieved context.',
    },
    {
      icon: ShieldCheck,
      title: 'Private by default',
      description: 'Each signed-in account only sees its own document library.',
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="glass relative overflow-hidden p-6 fade-in sm:p-8 lg:p-12">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[color:var(--color-accent-soft)] blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-[color:var(--color-teal-soft)] blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <p className="eyebrow mb-4">Document intelligence</p>
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                  IntelliDoc
                </p>
                <h1 className="mt-2 text-5xl leading-none sm:text-6xl lg:text-7xl">
                  <span className="gradient-text">IntelliDoc</span>
                </h1>
              </div>
              <h2 className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                Read, question, and extract meaning from every PDF.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)] sm:text-lg">
                IntelliDoc turns long-form documents into a calmer workspace for review, grounded chat,
                and quick analysis without losing sight of the source.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="metric-chip">Fast uploads</span>
                <span className="metric-chip">Grounded answers</span>
                <span className="metric-chip">Mobile friendly viewer</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <article key={title} className="glass-hover p-4">
                  <div className="mb-4 inline-flex rounded-2xl bg-[color:var(--color-accent-soft)] p-3 text-[color:var(--color-accent-strong)]">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg text-[color:var(--color-text-primary)]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="glass flex items-center p-6 fade-in sm:p-8 lg:p-10">
          <div className="w-full">
            <p className="eyebrow mb-3">Welcome back</p>
            <h2 className="text-3xl sm:text-4xl">Sign in to IntelliDoc</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-muted)] sm:text-base">
              Continue where you left off and keep your document library in one place.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-text-secondary)]" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field mt-2"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--color-text-secondary)]" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field mt-2"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" disabled={loading} className="primary-button w-full">
                <LogIn size={18} />
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">
              Do not have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[color:var(--color-accent-strong)] transition hover:text-[color:var(--color-teal-strong)]"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
