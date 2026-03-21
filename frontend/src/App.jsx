import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
          <div className="glass w-full max-w-md p-8 text-center fade-in sm:p-10">
            <p className="eyebrow mb-4 justify-center">Preparing workspace</p>
            <h1 className="text-4xl gradient-text">IntelliDoc</h1>
            <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-muted)] sm:text-base">
              Loading your account and recent documents.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fffdf9',
              color: '#1f2933',
              border: '1px solid rgba(70, 58, 44, 0.1)',
              boxShadow: '0 18px 40px rgba(88, 68, 45, 0.12)',
            },
            success: {
              iconTheme: {
                primary: '#2a9d8f',
                secondary: '#fffdf9',
              },
            },
            error: {
              iconTheme: {
                primary: '#c9573d',
                secondary: '#fffdf9',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
