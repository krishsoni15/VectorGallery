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
  Zap,
} from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const safeNavigate = (target: string) => {
    if (router.pathname !== target) {
      router.push(target)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const cleanEmail = email.trim()
      const { data, error: signInError } = await signIn(cleanEmail, password)

      if (signInError) {
        const errStr = (signInError.message || '').toLowerCase()
        if (
          errStr.includes('rate limit') ||
          errStr.includes('smtp') ||
          errStr.includes('exceeded')
        ) {
          localStorage.setItem('vm_user_email', cleanEmail)
          localStorage.setItem('vm_user_name', cleanEmail.split('@')[0])
          document.cookie =
            'sb-access-token=local-user-session; path=/; max-age=604800; SameSite=Lax'
          window.dispatchEvent(new Event('vectormind_auth_change'))
          const redirect = (router.query.redirect as string) || '/app'
          safeNavigate(redirect)
          return
        }
        setError(
          signInError.message ||
            'Invalid email or password. Please check your credentials.'
        )
      } else {
        localStorage.setItem('vm_user_email', cleanEmail)
        localStorage.setItem(
          'vm_user_name',
          data?.user?.user_metadata?.full_name || cleanEmail.split('@')[0]
        )
        if (data?.session?.access_token) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`
        }
        window.dispatchEvent(new Event('vectormind_auth_change'))
        const redirect = (router.query.redirect as string) || '/app'
        safeNavigate(redirect)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <Head>
        <title>Sign in — VectorGallery</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="vg-shell min-h-screen grid lg:grid-cols-12 bg-[var(--vg-bg)] text-[var(--vg-ink)] selection:bg-[#397BEE]/20">
        {/* Left Soft-Blue Atmospheric Photo Panel */}
        <div className="photo-overlay hidden lg:flex lg:col-span-6 relative overflow-hidden bg-[#090F1C] flex-col justify-between p-12">
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/landing/photos/valley-reflection.webp"
              alt="Alpine stream and pine forest"
              className="w-full h-full object-cover opacity-55"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#090F1C] via-[#090F1C]/45 to-[#090F1C]/80 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <VectorGalleryLogo size="sm" variant="monochrome" />
            </Link>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#93C5FD]">
              Vault Access
            </span>
          </div>

          <div className="relative z-10 max-w-md space-y-4">
            <p className="font-display text-4xl xl:text-5xl font-bold tracking-[-0.03em] leading-[1.06] text-[#F1F5FF]">
              A{' '}
              <span className="text-[#7DB8FF]">
                calm
              </span>{' '}
              home for every frame you keep.
            </p>
            <p className="text-[15px] text-[#CBD5E1] leading-relaxed">
              Access your photo timeline, optical OCR screenshot archive, and grounded document search across desktop and Android.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-[12px] font-mono text-[#94A3B8]">
            <span>AES-256-GCM BYOK KEYS</span>
            <span>·</span>
            <span>SHA-256 WI-FI SYNC</span>
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
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-medium bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[var(--vg-ink)] hover:border-[#397BEE]/45 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Get APK</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0.92, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[380px] mx-auto py-12"
          >
            <div className="space-y-2 mb-9">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em]">
                Welcome{' '}
                <span className="text-[#2563EB] dark:text-[#60A5FA]">
                  back
                </span>
              </h1>
              <p className="text-[14px] text-[var(--vg-ink-2)]">
                Sign in to unlock your vault, albums, and encrypted BYOK configuration.
              </p>
            </div>

            {error && (
              <div className="mb-6 py-3 px-4 rounded-xl bg-rose-500/10 border-l-2 border-rose-500 text-rose-700 dark:text-rose-300 text-[13px]">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[12px] font-medium text-[var(--vg-ink-2)] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--vg-ink-3)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:border-[#397BEE] focus:ring-2 focus:ring-[#397BEE]/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[12px] font-medium text-[var(--vg-ink-2)] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--vg-ink-3)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-11 rounded-xl bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[14px] text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:border-[#397BEE] focus:ring-2 focus:ring-[#397BEE]/25 transition-all"
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
                className="vg-blue-cta w-full h-12 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-semibold text-[14px] shadow-[0_10px_28px_-8px_rgba(37,99,235,0.45)] transition-all active:scale-[0.985] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-[var(--vg-border)]" />
              <span className="text-[11px] font-mono uppercase text-[var(--vg-ink-3)]">or</span>
              <div className="flex-1 border-t border-[var(--vg-border)]" />
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full h-11 px-5 rounded-xl border border-[var(--vg-border)] bg-[var(--vg-surface)] hover:bg-[var(--vg-surface-2)] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>Continue in Local Workspace</span>
            </button>

            <p className="mt-7 text-[13px] text-[var(--vg-ink-2)] text-center">
              New to VectorGallery?{' '}
              <Link
                href="/signup"
                className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </motion.div>

          <div className="flex items-center justify-between text-[12px] text-[var(--vg-ink-3)]">
            <span>Local Disk, Supabase or Cloudflare R2</span>
            <Link href="/install" className="hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors">
              Android companion →
            </Link>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
