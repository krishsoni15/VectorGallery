import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, MotionConfig } from 'framer-motion'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  User as UserIcon,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS } from '@/components/landing/design-system'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp, signIn } = useAuth()
  const router = useRouter()

  const safeNavigate = (target: string) => {
    if (router.pathname !== target) {
      router.push(target)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const cleanEmail = email.trim()
      const cleanName = name.trim() || cleanEmail.split('@')[0]

      const { data, error: signUpError } = await signUp(
        cleanEmail,
        password,
        cleanName
      )

      if (signUpError) {
        const errStr = (signUpError.message || '').toLowerCase()

        if (
          errStr.includes('already registered') ||
          errStr.includes('already exists') ||
          errStr.includes('user_already_exists')
        ) {
          const { error: signInErr } = await signIn(cleanEmail, password)
          if (!signInErr) {
            localStorage.setItem('vm_user_name', cleanName)
            localStorage.setItem('vm_user_email', cleanEmail)
            window.dispatchEvent(new Event('vectormind_auth_change'))
            safeNavigate('/app')
            return
          }
          setError(
            'An account with this email already exists. Please sign in with your password.'
          )
          return
        }

        if (
          errStr.includes('rate limit') ||
          errStr.includes('smtp') ||
          errStr.includes('email rate limit')
        ) {
          const { error: signInErr } = await signIn(cleanEmail, password)
          if (!signInErr) {
            localStorage.setItem('vm_user_name', cleanName)
            localStorage.setItem('vm_user_email', cleanEmail)
            window.dispatchEvent(new Event('vectormind_auth_change'))
            safeNavigate('/app')
            return
          }
          localStorage.setItem('vm_user_name', cleanName)
          localStorage.setItem('vm_user_email', cleanEmail)
          document.cookie =
            'sb-access-token=local-user-session; path=/; max-age=604800; SameSite=Lax'
          window.dispatchEvent(new Event('vectormind_auth_change'))
          safeNavigate('/app')
          return
        }

        setError(signUpError.message)
      } else {
        localStorage.setItem('vm_user_name', cleanName)
        localStorage.setItem('vm_user_email', cleanEmail)
        if (data?.session?.access_token) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`
        }
        window.dispatchEvent(new Event('vectormind_auth_change'))
        safeNavigate('/app')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestAccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vm_user_email')
      localStorage.removeItem('vm_user_name')
      document.cookie =
        'sb-access-token=guest-session-token; path=/; max-age=604800; SameSite=Lax'
      window.dispatchEvent(new Event('vectormind_auth_change'))
    }
    safeNavigate('/app')
  }

  return (
    <MotionConfig reducedMotion="user">
      <Head>
        <title>Create account — VectorGallery</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="vg-shell min-h-screen grid lg:grid-cols-12 bg-[var(--vg-bg)] text-[var(--vg-ink)] selection:bg-[#087F5B]/20 dark:selection:bg-[#58D6A8]/25">
        {/* Left Studio Photo Panel */}
        <div className="photo-overlay hidden lg:flex lg:col-span-6 relative overflow-hidden bg-[#0B0D0C] flex-col justify-between p-12">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/landing/photos/aura-botanical-light.webp"
              alt="Filtered morning sunlight falling across green botanical leaves"
              className="w-full h-full object-cover opacity-55"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0C] via-[#0B0D0C]/45 to-[#0B0D0C]/75 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <VectorGalleryLogo size="sm" variant="on-dark" />
            </Link>
            <span className="text-[12px] font-medium text-[#C4EDE1]">
              New Sanctuary
            </span>
          </div>

          <div className="relative z-10 max-w-md space-y-4">
            <p
              className="font-display text-4xl xl:text-5xl font-bold tracking-[-0.03em] leading-[1.06] text-[#F2F3EF]"
              style={{ textWrap: 'balance' }}
            >
              Keep your moments searchable for{'\u00A0'}years.
            </p>
            <p className="text-[15.5px] text-[#F2F3EF]/80 leading-relaxed">
              Every photograph, receipt, screenshot, and handwritten note organized privately inside your own space.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-[12px] text-[#A3ADA5]">
            <span>Free local mode</span>
            <span>·</span>
            <span>Open source under Apache-2.0</span>
          </div>
        </div>

        {/* Right Form Canvas */}
        <div className="lg:col-span-6 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="lg:hidden inline-flex items-center">
              <VectorGalleryLogo size="sm" variant="horizontal" />
            </Link>
            <Link
              href="/"
              className="hidden lg:inline-flex text-[13px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] transition-colors"
            >
              ← Back to VectorGallery
            </Link>

            <div className="flex items-center gap-2.5">
              <Link
                href="/install"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-ink)] hover:border-[#087F5B]/45 dark:hover:border-[#58D6A8]/45 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#58D6A8]" />
                <span>Android App</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0.92, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[380px] mx-auto py-10"
          >
            <div className="space-y-2 mb-8">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[var(--vg-ink)]">
                Create your space
              </h1>
              <p className="text-[14.5px] text-[var(--vg-ink-2)]">
                Start keeping photos, documents, and mobile backups together in seconds.
              </p>
            </div>

            {error && (
              <div className="mb-6 py-3 px-4 rounded-xl bg-rose-500/10 border-l-2 border-rose-500 text-rose-700 dark:text-rose-300 text-[13px]">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-[12px] font-medium text-[var(--vg-ink-2)] mb-1.5"
                >
                  Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[var(--vg-ink-3)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:border-[var(--vg-brand)] focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#58D6A8]/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-[12px] font-medium text-[var(--vg-ink-2)] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--vg-ink-3)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:border-[var(--vg-brand)] focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#58D6A8]/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-[12px] font-medium text-[var(--vg-ink-2)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--vg-ink-3)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-12 pl-10 pr-11 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:border-[var(--vg-brand)] focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#58D6A8]/25 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--vg-ink-3)] hover:text-[var(--vg-ink)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(VG_COMPONENTS.buttons.primary, 'w-full disabled:opacity-50 mt-2')}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-4">
              <div className="flex-1 border-t border-[var(--vg-border)]" />
              <span className="text-[11px] uppercase tracking-wider text-[var(--vg-ink-3)]">or</span>
              <div className="flex-1 border-t border-[var(--vg-border)]" />
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full h-11 px-5 rounded-full border border-[var(--vg-border)] bg-[var(--vg-surface-2)] hover:bg-[#E9EBE5] dark:hover:bg-[#252A26] hover:border-[var(--vg-border-strong)] text-[13.5px] font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
            >
              <Zap className="w-4 h-4 text-[#087F5B] dark:text-[#58D6A8]" />
              <span>Continue in Local Sandbox</span>
            </button>
            <p className="mt-2 text-[11.5px] text-center text-[var(--vg-ink-muted)]">
              Explore locally on this device without creating an account.
            </p>

            <p className="mt-6 text-[13.5px] text-[var(--vg-ink-2)] text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#087F5B] dark:text-[#58D6A8] hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

          <div className="flex items-center justify-between text-[12px] text-[var(--vg-ink-3)]">
            <span>Per-user isolated workspace</span>
            <Link href="/install" className="hover:text-[#087F5B] dark:hover:text-[#58D6A8] transition-colors">
              Android companion →
            </Link>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
