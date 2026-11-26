import React, { useEffect, useState } from 'react'
import { Check, Copy, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveQrCodeProps {
  path?: string
  size?: number
  className?: string
  showCopy?: boolean
}

/**
 * Generates an interactive QR code matching the user's current active origin
 * (LAN IP on Wi-Fi or deployed domain), falling back cleanly to /qr.svg during SSR.
 */
export function LiveQrCode({
  path = '/install',
  size = 132,
  className,
  showCopy = true,
}: LiveQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [targetUrl, setTargetUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    const fullUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${path}` : path
    setTargetUrl(fullUrl)

    import('qrcode')
      .then((QRCode) =>
        QRCode.toDataURL(fullUrl, {
          width: size * 2,
          margin: 1,
          color: {
            dark: '#0B0F17',
            light: '#FFFFFF',
          },
        })
      )
      .then((url) => {
        if (active) setDataUrl(url)
      })
      .catch(() => {
        // Fallback to static /qr.svg generated at build time
      })

    return () => {
      active = false
    }
  }, [path, size])

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
        className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-sm inline-flex items-center justify-center"
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

      {showCopy && targetUrl && (
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#525660] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#F4F5F7] transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
              <span className="text-[#2563EB] dark:text-[#93C5FD]">Copied install link</span>
            </>
          ) : (
            <>
              <QrCode className="w-3.5 h-3.5 text-[#397BEE] dark:text-[#60A5FA]" />
              <span className="truncate max-w-[180px]">{targetUrl.replace(/^https?:\/\//, '')}</span>
              <Copy className="w-3 h-3 opacity-60" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

