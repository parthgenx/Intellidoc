import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FolderOpen, ScanSearch, Sparkles, UserPlus } from 'lucide-react'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const highlights = [
    {
      icon: FolderOpen,
      title: 'Organized library',
      description: 'Keep every upload grouped in a single, personal workspace.',
    },
    {
      icon: ScanSearch,
      title: 'Source-aware retrieval',
      description: 'Search and chat against the content of each document, not vague guesses.',
    },
    {
      icon: Sparkles,
      title: 'Quick analysis',
      description: 'Generate summaries and extract entities without leaving the viewer.',
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="glass flex items-center p-6 fade-in sm:p-8 lg:p-10">
          <div className="w-full">
            <p className="eyebrow mb-3">Create your account</p>
            <h1 className="text-3xl sm:text-4xl">Create your IntelliDoc account</h1>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-muted)] sm:text-base">
              Start with a fresh account, upload your PDFs, and turn the library into something
              easier to read and query.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-text-secondary)]" htmlFor="signup-email">
                  Email
                </label>
                <input
                  id="signup-email"
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
                <label className="block text-sm font-medium text-[color:var(--color-text-secondary)]" htmlFor="signup-password">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field mt-2"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--color-text-secondary)]" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field mt-2"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" disabled={loading} className="primary-button w-full">
                <UserPlus size={18} />
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-sm text-[color:var(--color-text-muted)]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[color:var(--color-accent-strong)] transition hover:text-[color:var(--color-teal-strong)]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="glass relative overflow-hidden p-6 fade-in sm:p-8 lg:p-12">
          <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-[color:var(--color-teal-soft)] blur-3xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-[color:var(--color-accent-soft)] blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <p className="eyebrow mb-4">A better reading flow</p>
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                  IntelliDoc
                </p>
                <h2 className="mt-2 text-5xl leading-none sm:text-6xl lg:text-7xl">
                  <span className="gradient-text">IntelliDoc</span>
                </h2>
              </div>
              <h3 className="max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                From upload to answer, the interface stays focused on the document.
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)] sm:text-lg">
                The refreshed workspace is built for long sessions: cleaner hierarchy, faster scanning,
                and a mobile-friendly viewer that keeps the source close at hand.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="metric-chip">Responsive layouts</span>
                <span className="metric-chip">Calmer visual hierarchy</span>
                <span className="metric-chip">Readable document surfaces</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <article key={title} className="glass-hover p-4">
                  <div className="mb-4 inline-flex rounded-2xl bg-[color:var(--color-teal-soft)] p-3 text-[color:var(--color-teal-strong)]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg text-[color:var(--color-text-primary)]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Signup
