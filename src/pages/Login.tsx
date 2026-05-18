import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { checkEmail, login } from '../lib/auth'

type Step = 'email' | 'password'

const inputClass =
  'w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/35 backdrop-blur-md focus:border-white/40 focus:outline-none transition-colors'

const btnClass =
  'w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/[0.18]'

export default function Login() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)

  // Auto-focus password field when step changes
  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus()
  }, [step])

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault()
    setEmailError('')
    const result = checkEmail(email)
    if (result === 'invalid') {
      setEmailError('Enter a valid email address.')
      return
    }
    if (result === 'not_found') {
      setEmailError('No account found with this email address.')
      return
    }
    setStep('password')
  }

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    const user = login(email, password)
    if (user) {
      navigate('/')
    } else {
      setPasswordError('Incorrect password. Please try again.')
      setPassword('')
      passwordRef.current?.focus()
    }
  }

  const handleBack = () => {
    setStep('email')
    setPassword('')
    setPasswordError('')
    setShowPassword(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {/* Background video */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vh',
            height: '100vw',
            transform: 'translate(-50%, -50%) rotate(90deg)',
            objectFit: 'cover',
          }}
        >
          <source src="/landing.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 w-full max-w-[360px]">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-white">
            Welcome to
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            The New Thing
          </h1>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                placeholder="you@thenewthing.in"
                className={`${inputClass} ${emailError ? 'border-red-400/50' : ''}`}
                autoFocus
                autoComplete="email"
                required
              />
              {emailError && (
                <p className="mt-2 px-1 text-xs text-red-400">{emailError}</p>
              )}
            </div>
            <button type="submit" className={btnClass}>
              Continue
            </button>
          </form>
        )}

        {/* Step 2: Password */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3" noValidate>
            {/* Email chip with back option */}
            <div className="flex items-center justify-between rounded-full border border-white/15 bg-white/8 px-5 py-2.5">
              <span className="text-sm text-white/70 truncate">{email}</span>
              <button
                type="button"
                onClick={handleBack}
                className="ml-3 flex-shrink-0 text-white/40 hover:text-white/70 transition-colors"
                aria-label="Change email"
              >
                <ArrowLeft size={15} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Password
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12 ${passwordError ? 'border-red-400/50' : ''}`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 px-1 text-xs text-red-400">{passwordError}</p>
              )}
            </div>

            <button type="submit" className={btnClass}>
              Sign in
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
