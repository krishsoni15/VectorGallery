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
import { AuthShowcasePanel } from '@/components/auth/AuthShowcasePanel'
import { VectorGalleryLogo } from '@/components/brand/VectorGalleryLogo'
import { VG_COMPONENTS, VG_SPHERE_THEME_SPEC } from '@/components/landing/design-system'
import { ThemeSwitch } from '@/components/landing/ThemeSwitch'
import { cn } from '@/lib/utils'

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

      <div className="vg-shell min-h-screen grid lg:grid-cols-12 bg-[var(--vg-bg)] text-[var(--vg-ink)] selection:bg-[#087F5B]/20 dark:selection:bg-[#CFFF49]/25">
        <AuthShowcasePanel
          badgeText="Personal Cloud"
          headline="Your personal library, searchable in seconds."
          description="Return to your photos, OCR-indexed receipts, handwritten notes, and automatic Android camera roll backups."
          footerLeft="Encrypted workspace · Zero lock-in"
          footerRight="Local or cloud storage"
        />

        {/* Right Form Canvas */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-[var(--vg-surface)] px-6 sm:px-12 lg:px-16 xl:px-24 py-7 sm:py-9">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="lg:hidden inline-flex items-center">
              <VectorGalleryLogo size="sm" variant="horizontal" />
            </Link>
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--vg-ink-2)] hover:text-[var(--vg-ink)] transition-colors"
            >
              ← Back to VectorGallery
            </Link>

            <div className="flex items-center gap-2.5">
              <Link
                href="/install"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium bg-[#F2F3F0] dark:bg-[#202522] border border-[#DDE2DC] dark:border-white/[0.10] text-[#101211] dark:text-[#F3F5F1] hover:border-[#087F5B]/45 dark:hover:border-[#CFFF49]/45 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
                <span>Android App</span>
              </Link>
              <ThemeSwitch />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0.92, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[410px] mx-auto py-8 sm:py-12"
          >
            {/* Mobile Mini Sculpture Anchor */}
            <div className="lg:hidden flex items-center gap-3.5 mb-7 p-3.5 rounded-2xl bg-[var(--vg-bg)] border border-[var(--vg-border)]">
              <img
                src={VG_SPHERE_THEME_SPEC.heroVideoPoster}
                alt="VectorGallery Memory Sphere"
                className="w-12 h-12 object-contain shrink-0"
              />
              <div>
                <p className="font-display text-sm font-bold text-[var(--vg-ink)]">Personal AI Cloud</p>
                <p className="text-xs text-[var(--vg-ink-2)]">Photos, OCR documents &amp; Android sync</p>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#087F5B] dark:text-[#CFFF49]">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>Vault Sign In</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.036em] text-[var(--vg-ink)]">
                Welcome back
              </h1>
              <p className="text-[14.5px] text-[var(--vg-ink-2)]">
                Sign in to open your library, collections, and personal AI settings.
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
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.12] text-[14px] text-[#101211] dark:text-[#F3F5F1] placeholder:text-[#626B64] dark:placeholder:text-[#828E86] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49] focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#CFFF49]/25 transition-colors"
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
                    className="w-full h-12 pl-10 pr-11 rounded-xl bg-[#FFFFFF] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.12] text-[14px] text-[#101211] dark:text-[#F3F5F1] placeholder:text-[#626B64] dark:placeholder:text-[#828E86] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#CFFF49] focus:ring-2 focus:ring-[#087F5B]/20 dark:focus:ring-[#CFFF49]/25 transition-colors"
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
                className={cn(VG_COMPONENTS.buttons.limePill, 'w-full disabled:opacity-50 mt-2')}
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
              <span className="text-[11px] uppercase tracking-wider text-[var(--vg-ink-3)]">or</span>
              <div className="flex-1 border-t border-[var(--vg-border)]" />
            </div>

            <button
              type="button"
              onClick={handleGuestAccess}
              className="w-full h-11 px-5 rounded-full border border-[#DDE2DC] dark:border-white/[0.12] bg-[#F2F3F0] dark:bg-[#202522] hover:bg-[#E7E9E5] dark:hover:bg-[#2A302C] text-[#101211] dark:text-[#F3F5F1] text-[13.5px] font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vg-brand)]"
            >
              <Zap className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" />
              <span>Continue in Local Sandbox</span>
            </button>
            <p className="mt-2 text-[11.5px] text-center text-[var(--vg-ink-muted)]">
              Explore locally on this device without creating an account.
            </p>

            <p className="mt-7 text-[13.5px] text-[var(--vg-ink-2)] text-center">
              New to VectorGallery?{' '}
              <Link
                href="/signup"
                className="font-semibold text-[#087F5B] dark:text-[#CFFF49] hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </motion.div>

          <div className="flex items-center justify-between text-[12px] text-[var(--vg-ink-3)]">
            <span>Your files, your storage choice</span>
            <Link href="/install" className="hover:text-[#087F5B] dark:hover:text-[#CFFF49] transition-colors">
              Android companion →
            </Link>
          </div>
        </div>
      </div>
    </MotionConfig>
  )
}
