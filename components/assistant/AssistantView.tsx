import React, { useState, useRef, useEffect } from 'react'
import {
  Zap,
  Send,
  User,
  Bot,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  MessageSquare,
  Clock,
  Share2,
  Image as ImageIcon,
  Sidebar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{
    id: number
    file_id: string
    file_name: string
    page?: number
    excerpt: string
    category?: string
    thumbnail_url?: string
  }>
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface AssistantViewProps {
  onOpenFile: (fileId: string) => void
}

/**
 * Lightweight, safe markdown formatter for assistant responses.
 * Renders bold text, bullet points, numbered lists, headings, and inline code without external dependencies.
 */
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-1.5 pl-1">
          {listItems}
        </ul>
      )
      listItems = []
    }
  }

  const renderInline = (text: string) => {
    // Regex matches **bold**, `code`, or plain text
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-emerald-300 dark:text-emerald-400">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-black/25 dark:bg-white/10 text-emerald-400 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      elements.push(<div key={`br-${idx}`} className="h-1.5" />)
      return
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={`h4-${idx}`} className="font-bold text-sm text-emerald-400 mt-2 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      )
      return
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={`h3-${idx}`} className="font-bold text-base text-zinc-100 mt-2.5 mb-1">
          {renderInline(trimmed.slice(3))}
        </h3>
      )
      return
    }

    // Bullet items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(
        <li key={`li-${idx}`} className="text-xs sm:text-sm leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </li>
      )
      return
    }

    // Numbered list items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
    if (numMatch) {
      flushList()
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2 text-xs sm:text-sm my-0.5 leading-relaxed">
          <span className="font-mono text-emerald-400 font-bold shrink-0">{numMatch[1]}.</span>
          <div>{renderInline(numMatch[2])}</div>
        </div>
      )
      return
    }

    flushList()
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    )
  })

  flushList()
  return <div className="space-y-1.5 text-zinc-200">{elements}</div>
}

export const AssistantView: React.FC<AssistantViewProps> = ({ onOpenFile }) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 1. Fetch Conversations on Mount
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/v2/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (e) {
      console.warn('[Assistant] Failed to fetch conversations:', e)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Auto-scroll on new messages or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 2. Load Conversation History
  const loadConversation = async (convId: string) => {
    setActiveConversationId(convId)
    try {
      const res = await fetch(`/api/v2/conversations/${convId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              citations: m.citations || [],
              confidence: m.confidence_level,
            }))
          )
        } else {
          setMessages([])
        }
      }
    } catch (e) {
      console.error('[Assistant] Failed to load conversation:', e)
    }
  }

  // 3. Start Fresh / New Conversation
  const handleNewConversation = () => {
    setActiveConversationId(null)
    setMessages([])
    setInput('')
    textareaRef.current?.focus()
  }

  // 4. Delete Conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/v2/conversations/${convId}`, { method: 'DELETE' })
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      if (activeConversationId === convId) {
        handleNewConversation()
      }
    } catch (e) {
      console.error('[Assistant] Delete conversation error:', e)
    }
  }

  // 5. Send Query & Stream Response
  const sendQuery = async (queryText: string) => {
    const userText = queryText.trim()
    if (!userText || loading) return
    setInput('')

    // Auto-create conversation if none is active
    let currentConvId = activeConversationId
    if (!currentConvId) {
      try {
        const titleSnippet = userText.length > 28 ? `${userText.slice(0, 28)}...` : userText
        const convRes = await fetch('/api/v2/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleSnippet }),
        })
        if (convRes.ok) {
          const convData = await convRes.json()
          currentConvId = convData.conversation?.id || null
          if (convData.conversation) {
            setConversations((prev) => [convData.conversation, ...prev])
            setActiveConversationId(currentConvId)
          }
        }
      } catch (e) {
        console.warn('[Assistant] Failed to auto-create conversation:', e)
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    const assistantMsgId = `assistant-${Date.now()}`
    let streamedContent = ''
    let citations: any[] = []

    try {
      const res = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          conversationId: currentConvId,
          chatHistory: messages.map((m) => ({ role: m.role, text: m.content })),
        }),
      })

      if (!res.ok) {
        throw new Error(`Chat request returned HTTP ${res.status}`)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No readable stream')

      // Append placeholder assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '' },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.substring(6))

              if (eventData.type === 'token') {
                streamedContent += eventData.content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: streamedContent } : m
                  )
                )
              } else if (eventData.type === 'citations') {
                citations = eventData.citations || []
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, citations } : m
                  )
                )
              } else if (eventData.type === 'confidence') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, confidence: eventData.level } : m
                  )
                )
              }
            } catch (e) {
              // Ignore partial stream chunks
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[Assistant] Stream error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to complete response: ${err.message || 'Network error'}. Please verify your API key or backend status.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    sendQuery(input)
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShareCitation = async (cite: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const title = cite.file_name
    const text = `Sharing ${cite.file_name} from VectorGallery Personal Cloud`
    const url = cite.thumbnail_url || (typeof window !== 'undefined' ? window.location.href : '')

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
        await navigator.clipboard.writeText(fullUrl)
        setCopiedId(`share-${cite.file_id}`)
        setTimeout(() => setCopiedId(null), 2500)
      } catch {}
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Curated VectorGallery Starter Prompts
  const starterCards = [
    {
      emoji: '🖼️',
      title: 'Explore Photo Moments',
      desc: 'Find photography and albums organized automatically by capture date',
      query: 'Find my recent high-resolution photos and visual highlights',
    },
    {
      emoji: '📄',
      title: 'Summarize Documents',
      desc: 'Extract key insights, totals, and summaries from uploaded PDFs',
      query: 'Summarize my uploaded documents, reports, and receipts',
    },
    {
      emoji: '📱',
      title: 'Recent Screenshots',
      desc: 'Search text, receipts, and phone captures indexed with OCR',
      query: 'Find my recent screenshots and photos containing extracted text',
    },
    {
      emoji: '📊',
      title: 'Library Overview',
      desc: 'Check storage usage, indexed files, and memory stats',
      query: 'What files are stored in my personal cloud memory?',
    },
    {
      emoji: '🔤',
      title: 'Multilingual OCR Notes',
      desc: 'Search scanned handwritten notes and multilingual text documents',
      query: 'Find files containing scanned handwritten notes or multilingual text',
    },
    {
      emoji: '🔒',
      title: 'Vault Security Status',
      desc: 'Review encrypted vault health and connected backup devices',
      query: 'Check my vault backup status, device sync, and storage quota',
    },
  ]

  const quickChips = [
    { label: '🖼️ Recent Photos', query: 'Find my recent high-resolution photos and visual highlights' },
    { label: '📄 Summarize Documents', query: 'Summarize my uploaded documents, reports, and receipts' },
    { label: '📱 Search Screenshots', query: 'Find my recent screenshots and photos containing extracted text' },
    { label: '📊 Storage Stats', query: 'What files are stored in my personal cloud memory?' },
  ]

  const activeConversationTitle = conversations.find((c) => c.id === activeConversationId)?.title

  return (
    <div className="flex h-full w-full max-w-7xl 2xl:max-w-[1700px] mx-auto p-2 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 overflow-hidden">
      {/* ─── Collapsible Left Sidebar: Saved Inquiries ─── */}
      <div
        className={`${
          sidebarOpen ? 'w-64 sm:w-72 flex' : 'hidden'
        } flex-col rounded-2xl bg-[#0E1015]/85 border border-white/[0.08] p-3 space-y-3 shrink-0 backdrop-blur-xl transition-all shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-200 tracking-tight">Inquiries</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                {conversations.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewConversation}
              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors"
              title="New Inquiry / Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Collapse Inquiries Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Primary Pill */}
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.06] hover:border-emerald-500/30 text-xs font-semibold text-zinc-200 hover:text-emerald-300 transition-all shadow-sm group"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>New Chat</span>
        </button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          {conversations.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2 my-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">No Saved Inquiries</p>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Your AI queries and vault searches will be saved here automatically.
              </p>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConversationId === c.id

              return (
                <div
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-zinc-500 hover:bg-red-500/10 rounded transition-all shrink-0"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Vault Engine Tag */}
        <div className="pt-2 border-t border-white/[0.04] px-1 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Grounded AI Vault
          </span>
          <span>v2.0</span>
        </div>
      </div>

      {/* ─── Right: Main Chat Canvas ─── */}
      <div className="flex-1 flex flex-col h-full min-w-0 rounded-2xl bg-[#090A0D]/50 border border-white/[0.06] overflow-hidden backdrop-blur-md">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] bg-[#0E1015]/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-300 transition-colors border border-white/[0.06]"
                title="Expand Inquiries History"
              >
                <Sidebar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Inquiries</span>
                {conversations.length > 0 && (
                  <span className="text-[10px] px-1 rounded-full bg-emerald-500/20 text-emerald-300">
                    {conversations.length}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                {activeConversationTitle || 'VectorGallery Personal Assistant'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors border border-emerald-500/20 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Messages Canvas or Hero Welcome State ─── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            /* ── Google Photos / Gemini Style Welcome Hero (Single Centerpiece) ── */
            <div className="h-full flex flex-col justify-center items-center py-6 sm:py-10 max-w-3xl mx-auto space-y-6 text-center animate-fadeIn">
              {/* Glowing Ambient Brand Logo */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 opacity-35 blur-xl animate-pulse" />
                <img
                  src="/vectorgallery-icon.svg"
                  alt="VectorGallery"
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl shadow-2xl"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 px-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Ask VectorGallery
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Your private AI digital memory. Search, summarize, and retrieve anything from your personal photos,
                  handwritten notes, college documents, and screenshots.
                </p>
                <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-zinc-300 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded in your files
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-zinc-300 font-mono">
                    <FileText className="w-3 h-3 text-teal-400" /> Multimodal OCR & Vision
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-zinc-300 font-mono">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Verified citations
                  </span>
                </div>
              </div>

              {/* 2x3 Interactive Starter Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-left">
                {starterCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(card.query)}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/30 transition-all group shadow-sm text-left hover:scale-[1.01]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{card.emoji}</span>
                        <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                          {card.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity">
                      <span>Ask question</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Conversation Message Stream ── */
            messages.map((msg) => {
              const isUser = msg.role === 'user'

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 text-sm animate-fadeIn max-w-4xl mx-auto ${
                    isUser ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-tr from-emerald-600/30 to-teal-500/30 border border-emerald-500/40 text-emerald-400'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 sm:px-5 py-3.5 leading-relaxed space-y-2.5 shadow-md ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-[#12141A] border border-white/[0.08] text-zinc-200 rounded-tl-sm backdrop-blur-md'
                    }`}
                  >
                    {/* Rendered content */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap text-xs sm:text-sm">{msg.content}</div>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}

                    {/* Grounding Source Citations (Under Assistant Response) */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-3 mt-2 border-t border-white/[0.08] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> Grounded in {msg.citations.length} Verified Vault File{msg.citations.length > 1 ? 's' : ''}
                          </p>
                          {msg.confidence && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono">
                              {msg.confidence} Confidence
                            </span>
                          )}
                        </div>

                        {/* Visual Image Cards if citations contain photos/screenshots */}
                        {msg.citations.some(
                          (c) =>
                            c.thumbnail_url ||
                            c.category === 'photos' ||
                            c.category === 'screenshots' ||
                            /\.(jpg|jpeg|png|webp|gif)$/i.test(c.file_name)
                        ) ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {msg.citations.map((cite) => (
                              <div
                                key={cite.id}
                                onClick={() => onOpenFile(cite.file_id)}
                                className="group flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm"
                              >
                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                                  {cite.thumbnail_url ? (
                                    <img
                                      src={cite.thumbnail_url}
                                      alt={cite.file_name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-zinc-500" />
                                  )}
                                </div>

                                {/* Details */}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                                    {cite.file_name}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 truncate line-clamp-1">
                                    {cite.excerpt ? cite.excerpt.slice(0, 50) : 'Matching personal file'}
                                  </p>
                                </div>

                                {/* Action Buttons: Share & View */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => handleShareCitation(cite, e)}
                                    title="Share with friend"
                                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 transition-colors"
                                  >
                                    {copiedId === `share-${cite.file_id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Share2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onOpenFile(cite.file_id)}
                                    title="Open file preview"
                                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Compact pills for text docs */
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((cite) => (
                              <button
                                key={cite.id}
                                onClick={() => onOpenFile(cite.file_id)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.06] hover:border-emerald-500/30 text-xs text-zinc-300 hover:text-emerald-300 transition-all font-medium"
                              >
                                <FileText className="w-3 h-3 text-emerald-400" />
                                <span className="truncate max-w-[160px]">{cite.file_name}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Actions: Copy Message */}
                    {!isUser && (
                      <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500">
                        <span className="font-mono">VectorGallery AI</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* Assistant Loading State */}
          {loading && (
            <div className="flex items-center gap-3 text-xs text-zinc-400 animate-fadeIn max-w-4xl mx-auto py-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-medium text-zinc-300">
                Searching your personal vault files and grounding response...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Bottom Area: Quick Action Chips & Modern Input Bar ─── */}
        <div className="p-3 sm:p-4 border-t border-white/[0.07] bg-[#0E1015]/80 backdrop-blur-xl shrink-0">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Quick Action Chips when conversation is active */}
            {messages.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
                {quickChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuery(chip.query)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.06] hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-300 transition-all font-medium text-[11px]"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Container */}
            <div className="relative rounded-2xl bg-[#12141A] border border-white/[0.1] focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 p-2 sm:p-2.5 transition-all shadow-xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask VectorGallery (e.g., 'What was I researching about Docker?', 'Find AWS pricing', 'Happy new year wishes')..."
                className="w-full bg-transparent resize-none text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 px-3 py-1.5 focus:outline-none custom-scrollbar"
              />

              <div className="flex items-center justify-between pt-2 px-2 border-t border-white/[0.05]">
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                  Press Enter to send, Shift+Enter for new line
                </span>
                <span className="text-[10px] text-zinc-500 font-mono sm:hidden">
                  Grounded in your files
                </span>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    input.trim() && !loading
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95'
                      : 'bg-white/[0.05] text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Ask</span>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Grounding and Privacy Subtext */}
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 tracking-tight">
                VectorGallery AI answers are strictly grounded in your private files • End-to-end encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
