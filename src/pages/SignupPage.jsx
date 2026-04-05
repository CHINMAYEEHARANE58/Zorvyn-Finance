import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../components/auth/AuthCard'
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton'
import { Button } from '../components/ui/Button'
import { PageTransition } from '../components/ui/PageTransition'
import { useAuth } from '../context/useAuth'

const Spinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
)

export const SignupPage = () => {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key, value) => {
    setFormValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = signup(formValues)

    if (!result.ok) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setSuccess('Account created successfully. Redirecting to dashboard...')
    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 650)
  }

  const handleGoogleSignup = () => {
    const result = loginWithGoogle({
      name: 'Demo Google User',
      email: 'google.demo@zorvyn.app',
      avatarUrl: '',
    })

    if (!result.ok) {
      setError(result.error || 'Google signup failed. Please try again.')
      return
    }

    setSuccess('Google demo account connected. Redirecting to dashboard...')
    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 500)
  }

  return (
    <PageTransition>
      <main className="zorvyn-hero flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-10">
        <AuthCard
          title="Create your account"
          subtitle="Start tracking and improving your financial health"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">Name</span>
              <input
                type="text"
                value={formValues.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-blue-400/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                placeholder="Your name"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">Email</span>
              <input
                type="email"
                value={formValues.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-blue-400/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
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
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-gray-200 outline-none transition-all duration-200 ease-in-out placeholder:text-gray-500 focus:border-blue-400/70 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </label>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="flex items-center gap-3 pt-1">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.14em] text-gray-500">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <GoogleAuthButton
              onSuccess={handleGoogleSignup}
              onError={() => setError('Google signup failed. Please try again.')}
              label="Sign up with Google (Demo)"
            />
          </form>

          <p className="mt-5 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-300 hover:text-blue-200">
              Login
            </Link>
          </p>
        </AuthCard>
      </main>
    </PageTransition>
  )
}
