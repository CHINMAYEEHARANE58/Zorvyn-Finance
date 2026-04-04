import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthCard } from '../components/auth/AuthCard'
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/ui/PageTransition'
import { useAuth } from '../context/useAuth'

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
)

export const LoginPage = () => {
  const { login, loginDemo, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formValues, setFormValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTarget = location.state?.from || '/dashboard'

  const handleChange = (key, value) => {
    setFormValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 450))
    const result = login(formValues)

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    navigate(redirectTarget, { replace: true })
  }

  const handleDemoLogin = async () => {
    setError('')
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 350))
    loginDemo()
    navigate('/dashboard', { replace: true })
  }

  const handleGoogleLogin = () => {
    const result = loginWithGoogle({
      name: 'Demo Google User',
      email: 'google.demo@zorvyn.app',
      avatarUrl: '',
    })

    if (!result.ok) {
      setError(result.error || 'Google login failed. Please try again.')
      return
    }

    navigate(redirectTarget, { replace: true })
  }

  return (
    <PageTransition>
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">
        <AuthCard
          title="Welcome back"
          subtitle="Login to continue to your finance workspace"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">Email</span>
              <input
                type="email"
                value={formValues.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-sky-400/70 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">Password</span>
              <input
                type="password"
                value={formValues.password}
                onChange={(event) => handleChange('password', event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-sky-400/70 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]"
                placeholder="Enter password"
                required
              />
            </label>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : null}
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
              >
                Demo Login
              </Button>
            </div>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <GoogleAuthButton
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google login failed. Please try again.')}
              label="Continue with Google (Demo)"
            />
          </form>

          <p className="mt-5 text-sm text-gray-400">
            New here?{' '}
            <Link to="/signup" className="text-sky-300 hover:text-sky-200">
              Create an account
            </Link>
          </p>
        </AuthCard>
      </main>
    </PageTransition>
  )
}
