import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Download, Smartphone, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react'

export default function InstallPage() {
  const [downloadStarted, setDownloadStarted] = useState(false)
  const apkUrl = '/vectorgallery.apk'

  const triggerDownload = () => {
    setDownloadStarted(true)
    const link = document.createElement('a')
    link.href = apkUrl
    link.download = 'VectorGallery-v2.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Head>
        <title>Install VectorGallery Mobile App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#090D16" />
      </Head>

      <div className="min-h-screen bg-[#090D16] text-[#E2E8F0] flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
        <div className="w-full max-w-md bg-[#131926]/90 border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/vectorgallery-icon.svg"
              alt="VectorGallery"
              className="w-16 h-16 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4"
            />
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              VectorGallery <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">Mobile</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Personal AI Cloud & Digital Memory Mobile Client for Android
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-3 mb-6">
            <button
              onClick={triggerDownload}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              <Download className="w-5 h-5 text-slate-950" />
              <span>{downloadStarted ? 'Downloading VectorGallery APK...' : 'Tap to Download APK'}</span>
            </button>

            <Link
              href="/app"
              className="w-full py-3 px-4 rounded-xl bg-[#1E293B]/60 hover:bg-[#1E293B] text-slate-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-slate-700/50"
            >
              <span>Or Open Web App on Mobile</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* 3 Step Installation Guide */}
          <div className="border-t border-[#1E293B] pt-6 mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>3 Easy Steps to Install</span>
            </h2>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white">Tap &quot;Download anyway&quot;</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Android shows a standard prompt for direct APK downloads outside Play Store.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white">Open file &amp; tap &quot;Install&quot;</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">If prompted, enable &quot;Allow installation from this source&quot; in Chrome/Browser settings.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white">Launch VectorGallery</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Your files, memories, and AI chat will sync with your local machine over Wi-Fi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Features Badge */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-300">Direct Local Wi-Fi Sync</p>
              <p className="text-emerald-400/80 text-[11px]">Clean build, zero ads, zero tracking, strict user data privacy.</p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-6 text-center">
          VectorGallery • Running on your local machine network
        </p>
      </div>
    </>
  )
}

