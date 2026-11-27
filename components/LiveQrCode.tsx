import React, { useEffect, useMemo, useState } from 'react'
import { Check, Copy, QrCode, Wifi } from 'lucide-react'
import { RELEASES_URL } from '@/components/landing/tokens'
import { cn } from '@/lib/utils'

interface LiveQrCodeProps {
  path?: string
  size?: number
  className?: string
  showCopy?: boolean
}

function isLoopbackHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  return (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower === '[::1]'
  )
}

/**
 * Generates an interactive QR code for Android installation.
 * On real LAN/production hosts it encodes the active origin; on localhost/loopback
 * it never encodes an unreachable localhost URL — instead it defaults to the
 * public GitHub Releases page and lets the user enter their local Wi-Fi LAN IP.
 */
export function LiveQrCode({
  path = '/install',
  size = 132,
  className,
  showCopy = true,
}: LiveQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [originInfo, setOriginInfo] = useState<{ protocol: string; port: string; origin: string }>({
    protocol: 'http:',
    port: '3000',
    origin: '',
  })
  const [lanIp, setLanIp] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const { hostname, protocol, port, origin } = window.location
    setIsLocalhost(isLoopbackHost(hostname))
    setOriginInfo({ protocol, port, origin })
  }, [])

  const targetUrl = useMemo(() => {
    const cleanLan = lanIp.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    if (isLocalhost) {
      if (cleanLan) {
        const hasPort = /:\d+$/.test(cleanLan)
        const portSuffix = !hasPort && originInfo.port ? `:${originInfo.port}` : ''
        return `${originInfo.protocol}//${cleanLan}${portSuffix}${path}`
      }
      return RELEASES_URL
    }
    return originInfo.origin ? `${originInfo.origin}${path}` : RELEASES_URL
  }, [isLocalhost, lanIp, originInfo, path])

  useEffect(() => {
    let active = true
    import('qrcode')
      .then((QRCode) =>
        QRCode.toDataURL(targetUrl, {
          width: size * 2,
          margin: 1,
          color: {
            dark: '#181C19',
            light: '#FFFFFF',
          },
        })
      )
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {
        // Fallback to static /qr.svg if dynamic generation fails
      })

    return () => {
      active = false
    }
  }, [targetUrl, size])

  const copyLink = async () => {
    if (!targetUrl || typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(targetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked in non-HTTPS contexts
    }
  }

  return (
    <div className={cn('inline-flex flex-col items-start gap-2.5', className)}>
      <div
        className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E0E4DD] shadow-sm inline-flex items-center justify-center"
        style={{ width: size + 20, height: size + 20 }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Scan QR to install VectorGallery on Android"
            width={size}
            height={size}
            className="rounded-lg block"
          />
        ) : (
          <img
            src="/qr.svg"
            alt="Scan QR to install VectorGallery on Android"
            width={size}
            height={size}
            className="rounded-lg block"
          />
        )}
      </div>

      {isLocalhost && (
        <div className="w-full max-w-[230px] space-y-1.5 text-left">
          <label
            htmlFor="vg-lan-ip-input"
            className="flex items-center gap-1.5 text-[11px] font-medium text-[#626B64] dark:text-[#A3ADA5]"
          >
            <Wifi className="w-3 h-3 text-[#087F5B] dark:text-[#58D6A8] shrink-0" />
            <span>LAN IP for local Wi-Fi QR (optional)</span>
          </label>
          <input
            id="vg-lan-ip-input"
            type="text"
            inputMode="decimal"
            value={lanIp}
            onChange={(e) => setLanIp(e.target.value)}
            placeholder="e.g. 192.168.1.42"
            className="w-full h-8 px-2.5 rounded-lg bg-[var(--vg-surface)] border border-[var(--vg-border)] text-[11.5px] font-mono text-[var(--vg-ink)] placeholder:text-[var(--vg-ink-muted)] focus:outline-none focus:border-[#087F5B] dark:focus:border-[#58D6A8]"
          />
          {!lanIp.trim() && (
            <p className="text-[10.5px] leading-snug text-[#737D75] dark:text-[#7F8A82]">
              Opened on localhost — QR defaults to GitHub Releases until you enter your LAN IP.
            </p>
          )}
        </div>
      )}

      {showCopy && targetUrl && (
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#626B64] dark:text-[#A3ADA5] hover:text-[#181C19] dark:hover:text-[#F2F3EF] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#58D6A8]" />
              <span className="text-[#087F5B] dark:text-[#58D6A8]">Copied install link</span>
            </>
          ) : (
            <>
              <QrCode className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#58D6A8]" />
              <span className="truncate max-w-[190px]">{targetUrl.replace(/^https?:\/\//, '')}</span>
              <Copy className="w-3 h-3 opacity-60" />
            </>
          )}
        </button>
      )}
    </div>
  )
}
