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
  initialPrompt?: string | null
  onConsumedPrompt?: () => void
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
          <strong key={i} className="font-semibold text-[#087F5B] dark:text-[#CFFF49]">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#F2F3F0] dark:bg-white/10 text-[#087F5B] dark:text-[#CFFF49] font-mono text-[11px]"
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
        <h4 key={`h4-${idx}`} className="font-bold text-sm text-[#087F5B] dark:text-[#CFFF49] mt-2 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      )
      return
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={`h3-${idx}`} className="font-bold text-base text-[#101211] dark:text-[#F3F5F1] mt-2.5 mb-1">
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
          <span className="font-mono text-[#087F5B] dark:text-[#CFFF49] font-bold shrink-0">{numMatch[1]}.</span>
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
  return <div className="space-y-1.5 text-[#101211] dark:text-[#F3F5F1]">{elements}</div>
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  onOpenFile,
  initialPrompt,
  onConsumedPrompt,
}) => {
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

  // Prefill prompt when launched directly from a file preview
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt)
      setTimeout(() => textareaRef.current?.focus(), 60)
      onConsumedPrompt?.()
    }
  }, [initialPrompt, onConsumedPrompt])

  // Auto-scroll only when a conversation has messages or is loading
  useEffect(() => {
    if (messages.length > 0 || loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
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
      tag: 'Photos',
      title: 'Explore Photo Moments',
      desc: 'Find photography and albums organized automatically by capture date',
      query: 'Find my recent high-resolution photos and visual highlights',
    },
    {
      tag: 'Docs',
      title: 'Summarize Documents',
      desc: 'Extract key insights, totals, and summaries from uploaded PDFs',
      query: 'Summarize my uploaded documents, reports, and receipts',
    },
    {
      tag: 'OCR',
      title: 'Recent Screenshots',
      desc: 'Search text, receipts, and phone captures indexed with OCR',
      query: 'Find my recent screenshots and photos containing extracted text',
    },
    {
      tag: 'Index',
      title: 'Library Overview',
      desc: 'Check storage usage, indexed files, and memory stats',
      query: 'What files are stored in my personal cloud memory?',
    },
    {
      tag: 'Notes',
      title: 'Multilingual OCR Notes',
      desc: 'Search scanned handwritten notes and multilingual text documents',
      query: 'Find files containing scanned handwritten notes or multilingual text',
    },
    {
      tag: 'Sync',
      title: 'Vault Security Status',
      desc: 'Review encrypted vault health and connected backup devices',
      query: 'Check my vault backup status, device sync, and storage quota',
    },
  ]

  const quickChips = [
    { label: 'Recent Photos', query: 'Find my recent high-resolution photos and visual highlights' },
    { label: 'Summarize Docs', query: 'Summarize my uploaded documents, reports, and receipts' },
    { label: 'Search OCR', query: 'Find my recent screenshots and photos containing extracted text' },
    { label: 'Storage Stats', query: 'What files are stored in my personal cloud memory?' },
  ]

  const activeConversationTitle = conversations.find((c) => c.id === activeConversationId)?.title

  return (
    <div className="flex h-full w-full max-w-7xl 2xl:max-w-[1700px] mx-auto p-3 sm:p-5 md:p-6 gap-4 md:gap-6 overflow-hidden">
      {/* ─── Collapsible Left Sidebar: Saved Inquiries ─── */}
      <div
        className={`${
          sidebarOpen ? 'hidden md:flex w-64 lg:w-72' : 'hidden'
        } flex-col rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] p-3 space-y-3 shrink-0 shadow-sm`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[#DDE2DC] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#087F5B] dark:text-[#CFFF49]" />
            <span className="text-xs font-bold text-[#101211] dark:text-[#F3F5F1] tracking-tight">Inquiries</span>
            {conversations.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#F2F3F0] dark:bg-white/[0.08] text-[#101211] dark:text-[#CFFF49] text-[10px] font-mono">
                {conversations.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewConversation}
              className="p-1.5 rounded-lg bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#D4FF54] dark:hover:bg-[#CFFF49] text-[#101211] dark:text-[#F3F5F1] dark:hover:text-[#101211] transition-colors"
              title="New Inquiry / Chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#F2F3F0] dark:hover:bg-white/[0.06] text-[#626B64] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] transition-colors"
              title="Collapse Inquiries Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Primary Pill */}
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.12] border border-[#DDE2DC] dark:border-white/[0.08] text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] transition-colors group"
        >
          <Plus className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
          <span>New Chat</span>
        </button>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          {conversations.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F2F3F0]/70 dark:bg-white/[0.02] border border-[#DDE2DC] dark:border-white/[0.06] text-center space-y-2 my-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFFFFF] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] text-[#087F5B] dark:text-[#CFFF49] flex items-center justify-center mx-auto">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1]">No Saved Inquiries</p>
              <p className="text-[11px] text-[#626B64] dark:text-[#9AA69E] leading-normal">
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
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49]/15 dark:text-[#CFFF49] font-semibold'
                      : 'text-[#555E58] dark:text-[#9AA69E] hover:text-[#101211] dark:hover:text-[#F3F5F1] hover:bg-[#F2F3F0] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D4FF54] dark:text-[#CFFF49]' : 'text-[#626B64] dark:text-[#7B867F]'}`} />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-[#626B64] dark:text-[#9AA69E] rounded transition-all shrink-0"
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
        <div className="pt-2 border-t border-[#DDE2DC] dark:border-white/[0.06] px-1 flex items-center justify-between text-[10px] text-[#626B64] dark:text-[#9AA69E]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-[#CFFF49]" /> Grounded AI Vault
          </span>
          <span className="font-mono">v2.0</span>
        </div>
      </div>

      {/* ─── Right: Main Chat Canvas ─── */}
      <div className="flex-1 flex flex-col h-full min-w-0 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] overflow-hidden shadow-sm">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DDE2DC] dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#131715] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.12] text-xs font-medium text-[#101211] dark:text-[#F3F5F1] transition-colors border border-[#DDE2DC] dark:border-white/[0.08]"
                title="Expand Inquiries History"
              >
                <Sidebar className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
                <span>Inquiries</span>
              </button>
            )}

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#087F5B] dark:bg-[#CFFF49] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-[#101211] dark:text-[#F3F5F1] truncate">
                {activeConversationTitle || 'VectorGallery Assistant'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.12] text-[#101211] dark:text-[#F3F5F1] text-xs font-medium transition-colors border border-[#DDE2DC] dark:border-white/[0.08]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── Messages Canvas or Minimal Welcome State ─── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 bg-[#F2F3F0]/55 dark:bg-[#090B0A]/65 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="min-h-full flex flex-col justify-center items-center py-8 sm:py-12 max-w-3xl mx-auto space-y-6 text-center animate-fadeIn">
              <img
                src="/vectorgallery-icon.svg"
                alt="VectorGallery"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-sm"
              />

              <div className="space-y-2 px-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#101211] dark:text-[#F3F5F1]">
                  Ask VectorGallery
                </h2>
                <p className="text-xs sm:text-sm text-[#555E58] dark:text-[#9AA69E] max-w-xl mx-auto leading-relaxed">
                  Private digital memory grounded strictly in your uploaded photos, handwritten notes, documents, and screenshots.
                </p>
                <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] text-[10px] text-[#555E58] dark:text-[#9AA69E] font-mono">
                    <ShieldCheck className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" /> Grounded in your files
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] text-[10px] text-[#555E58] dark:text-[#9AA69E] font-mono">
                    <FileText className="w-3 h-3 text-[#087F5B] dark:text-[#39D9A0]" /> OCR &amp; Vision
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] text-[10px] text-[#555E58] dark:text-[#9AA69E] font-mono">
                    <CheckCircle className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" /> Verified citations
                  </span>
                </div>
              </div>

              {/* 2x3 Starter Prompts */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-left">
                {starterCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(card.query)}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/40 dark:hover:border-[#CFFF49]/45 transition-all group shadow-sm text-left"
                  >
                    <div className="space-y-1.5">
                      <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#087F5B] dark:text-[#CFFF49]">
                        {card.tag}
                      </span>
                      <h4 className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-[#555E58] dark:text-[#9AA69E] leading-normal line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                    <div className="pt-2.5 flex items-center gap-1 text-[10px] font-mono text-[#555E58] dark:text-[#9AA69E] group-hover:text-[#087F5B] dark:group-hover:text-[#CFFF49] transition-colors">
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49] dark:text-[#101211]'
                        : 'bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.12] text-[#087F5B] dark:text-[#CFFF49]'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 sm:px-5 py-3.5 leading-relaxed space-y-2.5 shadow-sm ${
                      isUser
                        ? 'bg-[#101211] text-[#F3F5F1] dark:bg-[#CFFF49] dark:text-[#101211] rounded-tr-sm'
                        : 'bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.08] text-[#101211] dark:text-[#F3F5F1] rounded-tl-sm'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap text-xs sm:text-sm font-medium">{msg.content}</div>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}

                    {/* Grounding Source Citations */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-3 mt-2 border-t border-[#DDE2DC] dark:border-white/[0.08] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-mono text-[#626B64] dark:text-[#9AA69E] uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" /> Grounded in {msg.citations.length} Verified File{msg.citations.length > 1 ? 's' : ''}
                          </p>
                          {msg.confidence && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.10] text-[#087F5B] dark:text-[#CFFF49] font-mono">
                              {msg.confidence} Confidence
                            </span>
                          )}
                        </div>

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
                                className="group flex items-center gap-2.5 p-2 rounded-xl bg-[#F2F3F0] dark:bg-white/[0.04] border border-[#DDE2DC] dark:border-white/[0.08] hover:border-[#101211]/35 dark:hover:border-[#CFFF49]/40 transition-all cursor-pointer"
                              >
                                <div className="w-11 h-11 rounded-lg bg-[#E7E9E5] dark:bg-[#090B0A] overflow-hidden flex items-center justify-center shrink-0">
                                  {cite.thumbnail_url ? (
                                    <img
                                      src={cite.thumbnail_url}
                                      alt={cite.file_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-[#626B64] dark:text-[#9AA69E]" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-[#101211] dark:text-[#F3F5F1] truncate">
                                    {cite.file_name}
                                  </p>
                                  <p className="text-[10px] text-[#626B64] dark:text-[#9AA69E] truncate">
                                    {cite.excerpt ? cite.excerpt.slice(0, 50) : 'Matching personal file'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => handleShareCitation(cite, e)}
                                    title="Share link"
                                    className="p-1.5 rounded-lg hover:bg-[#FFFFFF] dark:hover:bg-white/[0.08] text-[#626B64] dark:text-[#9AA69E] transition-colors"
                                  >
                                    {copiedId === `share-${cite.file_id}` ? (
                                      <Check className="w-3.5 h-3.5 text-[#087F5B] dark:text-[#CFFF49]" />
                                    ) : (
                                      <Share2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onOpenFile(cite.file_id)}
                                    title="Open file preview"
                                    className="p-1.5 rounded-lg hover:bg-[#FFFFFF] dark:hover:bg-white/[0.08] text-[#626B64] dark:text-[#9AA69E] transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((cite) => (
                              <button
                                key={cite.id}
                                onClick={() => onOpenFile(cite.file_id)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] border border-[#DDE2DC] dark:border-white/[0.08] text-xs text-[#101211] dark:text-[#F3F5F1] hover:border-[#087F5B] dark:hover:border-[#CFFF49] transition-colors font-medium"
                              >
                                <FileText className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" />
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
                      <div className="pt-1 flex items-center justify-between text-[10px] text-[#626B64] dark:text-[#9AA69E]">
                        <span className="font-mono">VectorGallery AI</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#F2F3F0] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#087F5B] dark:text-[#CFFF49]" />
                              <span className="text-[#087F5B] dark:text-[#CFFF49]">Copied</span>
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
            <div className="flex items-center gap-3 text-xs text-[#555E58] dark:text-[#9AA69E] animate-fadeIn max-w-4xl mx-auto py-2">
              <div className="w-8 h-8 rounded-full bg-[#FFFFFF] dark:bg-[#131715] border border-[#DDE2DC] dark:border-white/[0.10] text-[#087F5B] dark:text-[#CFFF49] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-medium text-[#101211] dark:text-[#F3F5F1]">
                Searching your vault files and grounding response...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Bottom Area: Quick Action Chips & Input Bar ─── */}
        <div className="p-3 sm:p-4 border-t border-[#DDE2DC] dark:border-white/[0.08] bg-[#FFFFFF] dark:bg-[#131715] shrink-0">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {messages.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {quickChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuery(chip.query)}
                    className="shrink-0 px-3 py-1 rounded-full bg-[#F2F3F0] dark:bg-white/[0.06] hover:bg-[#E7E9E5] dark:hover:bg-white/[0.12] border border-[#DDE2DC] dark:border-white/[0.08] text-[#101211] dark:text-[#F3F5F1] transition-colors font-medium text-[11px]"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Container */}
            <div className="relative rounded-2xl bg-[#F2F3F0] dark:bg-[#181C1A] border border-[#DDE2DC] dark:border-white/[0.10] focus-within:border-[#087F5B] dark:focus-within:border-[#CFFF49] p-2 sm:p-2.5 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask VectorGallery about photos, PDFs, receipts, or notes..."
                className="w-full bg-transparent resize-none text-xs sm:text-sm text-[#101211] dark:text-[#F3F5F1] placeholder-[#626B64] dark:placeholder-[#7B867F] px-2.5 py-1.5 focus:outline-none custom-scrollbar"
              />

              <div className="flex items-center justify-between pt-2 px-2 border-t border-[#DDE2DC] dark:border-white/[0.06]">
                <span className="text-[10px] text-[#626B64] dark:text-[#9AA69E] font-mono hidden sm:inline">
                  Press Enter to send · Shift+Enter for new line
                </span>
                <span className="text-[10px] text-[#626B64] dark:text-[#9AA69E] font-mono sm:hidden">
                  Grounded in your files
                </span>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    input.trim() && !loading
                      ? 'vg-cta-lime bg-[#D4FF54] dark:bg-[#CFFF49] text-[#101211] shadow-sm'
                      : 'bg-[#DDE2DC] dark:bg-white/[0.08] text-[#626B64] dark:text-[#7B867F] cursor-not-allowed'
                  }`}
                >
                  <span>Ask</span>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-[#626B64] dark:text-[#7B867F] tracking-tight">
                Answers are strictly grounded in your personal files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
