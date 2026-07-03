'use client'

import { useChat } from '@ai-sdk/react'
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Mic, MicOff, Loader2, Sparkles, Volume2, VolumeX, Camera } from 'lucide-react'
import ChatCarCard from '@/components/chat/ChatCarCard'
import SenaButton from '@/components/chat/SenaButton'
import type { Vehicle } from '@/data/vehicles'

const SUGGESTIONS = [
  'Busco una pickup 4x4',
  'Quiero un SUV económico',
  'Tengo un auto para entregar',
  'Mostrá todo el stock',
  'Cuánto sale la Hilux',
]

interface AIChatProps {
  onAgentFilter: (bodyTypes: string[], maxPrice?: number) => void
  onReservar: (vehicle: Vehicle) => void
}

// Detección de Web Speech API
const hasSpeechRecognition = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

export default function AIChat({ onAgentFilter, onReservar }: AIChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const [isListening, setIsListening]   = useState(false)
  const [noApiKey, setNoApiKey]         = useState(false)
  const [isMuted, setIsMuted]           = useState(true)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Memoria y Sesión
  const [sessionId, setSessionId] = useState<string>('')

  // 1. Inicializar sesión y cargar historial persistente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('autoya_chat_session_id')
      if (!id) {
        id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('autoya_chat_session_id', id)
      }
      setSessionId(id)

      // Cargar historial de base de datos
      fetch(`/api/chat/history?sessionId=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages)
          }
        })
        .catch(err => console.error('[History UI] Error al precargar historial:', err))
    }
  }, [])

  // Función para subir y procesar imagen con Gemini Vision
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingImage(true)

    try {
      // Leer archivo como base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const result = reader.result as string
        const base64Data = result.split(',')[1]

        // Llamar a nuestra API de visión
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            mimeType: file.type,
          }),
        })

        const data = await res.json()
        setIsProcessingImage(false)

        if (!res.ok || !data.success) {
          throw new Error(data.error ?? 'Error al procesar la imagen')
        }

        // Inyectar el mensaje del usuario y la tasación de El Gitano
        append({
          role: 'user',
          content: `Te mando una foto de mi auto para que lo tases. El análisis visual del vehículo arrojó los siguientes detalles: "${data.text}". Dame tu tasación gitana formal en base a eso y apurame a señar uno de los tuyos.`,
        })
      }
    } catch (err) {
      console.error(err)
      setIsProcessingImage(false)
    }
  }

  // Función para leer en voz alta
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    // Cancelar cualquier lectura previa
    window.speechSynthesis.cancel()
    
    // Remover emojis y limpiar un poco para mejor lectura
    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    utterance.lang = 'es-AR'
    
    // Intentar buscar una voz en español
    const voices = window.speechSynthesis.getVoices()
    const esVoice = voices.find(v => v.lang.includes('es-AR') || v.lang.includes('es-'))
    if (esVoice) utterance.voice = esVoice

    window.speechSynthesis.speak(utterance)
  }

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, error, append, setMessages } = useChat({
    api: '/api/chat',
    body: {
      sessionId,
    },
    onError: (err: any) => {
      if (err.message?.includes('API key') || err.message?.includes('503')) {
        setNoApiKey(true)
      }
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Estimado/a, le doy la bienvenida a AutoYa. Soy su Asesor Premium personal. ¿En qué tipo de vehículo se encuentra interesado hoy? Con gusto le asistiré para encontrar la mejor opción técnica y financiera.',
      },
    ],
  } as any) as any

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Leer último mensaje de IA
  useEffect(() => {
    if (messages.length > 1 && !isMuted) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant' && lastMsg.content) {
        speakText(lastMsg.content)
      }
    }
  }, [messages, isMuted])

  // Voz — Web Speech API
  const toggleVoice = () => {
    if (!hasSpeechRecognition) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognitionAPI()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      handleInputChange({ target: { value: transcript } } as any)
      setIsListening(false)
      // Auto-send after voice
      setTimeout(() => inputRef.current?.form?.requestSubmit(), 300)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  // Render de tool results (Generative UI)
  const renderToolResult = (toolName: string, result: any) => {
    if (toolName === 'mostrar_joya' && result?.vehicles?.length) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {result.vehicles.map((v: Vehicle) => (
            <ChatCarCard key={v.id} vehicle={v} onReservar={onReservar} />
          ))}
        </div>
      )
    }

    if (toolName === 'cotizar_usado_gitano') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--ai-dim)',
            border: '1px solid var(--ai-border)',
            borderRadius: 6,
            padding: '14px 16px',
            marginTop: 4,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ai)', marginBottom: 12 }}>
            📋 Formulario de Tasación
          </p>
          {[
            { label: 'Marca y modelo', placeholder: 'Ej: Toyota Corolla 2020' },
            { label: 'Kilometraje', placeholder: 'Ej: 65000' },
            { label: 'Estado general', placeholder: 'Excelente / Bueno / Regular' },
          ].map(({ label, placeholder }) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
              </p>
              <input
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '8px 10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: 12,
                  color: 'var(--fg-primary)',
                }}
              />
            </div>
          ))}
          <button style={{
            width: '100%', marginTop: 8, padding: '9px',
            background: 'var(--ai)', color: '#fff',
            border: 'none', borderRadius: 3,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            Tasar mi auto gratis
          </button>
        </motion.div>
      )
    }

    if (toolName === 'lanzar_cierre_sena' && result?.vehicle) {
      return <SenaButton vehicle={result.vehicle} mensaje={result.mensaje} onReservar={onReservar} />
    }

    return null
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'var(--brand-dim)',
          border: '2px solid var(--brand-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
          boxShadow: '0 0 16px var(--brand-glow)',
        }}>
          👤
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg-primary)' }}>
            Asesor Premium
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>Consultoría de Ventas · En línea</span>
          </div>
        </div>
        <button
          onClick={() => {
            const nextMuted = !isMuted
            setIsMuted(nextMuted)
            if (!nextMuted && messages.length > 0) {
              // Leer el último mensaje al desmutear
              const lastMsg = messages[messages.length - 1]
              if (lastMsg.role === 'assistant' && lastMsg.content) {
                speakText(lastMsg.content)
              }
            } else if (nextMuted) {
              window.speechSynthesis?.cancel()
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: isMuted ? 'var(--fg-tertiary)' : 'var(--brand)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s',
          }}
          title={isMuted ? 'Activar voz' : 'Silenciar'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <Sparkles size={13} style={{ color: 'var(--brand)', opacity: 0.8 }} />
      </div>

      {/* No API key warning */}
      {noApiKey && (
        <div style={{
          margin: '10px 14px',
          padding: '10px 12px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 4, fontSize: 11, color: '#f59e0b',
          lineHeight: 1.5,
        }}>
          ⚠️ Gemini API key no configurada. Agregá <code>GOOGLE_GENERATIVE_AI_API_KEY</code> al <code>.env.local</code> para activar El Gitano real.
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence initial={false}>
          {messages.map((msg: any) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}
            >
              {/* Text bubble */}
              {msg.content && (
                <div style={{
                  maxWidth: '90%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                  fontSize: 13, lineHeight: 1.65,
                  ...(msg.role === 'user'
                    ? { background: 'var(--brand)', color: '#fff' }
                    : {
                      background: 'var(--bg-elevated)',
                      color: 'var(--fg-primary)',
                      border: '1px solid var(--border)',
                     })
                }}>
                  {msg.content}
                </div>
              )}

              {/* Tool results — Generative UI */}
              {msg.role === 'assistant' && msg.toolInvocations?.map((invocation: any) => {
                if (invocation.state !== 'result') return null
                const ui = renderToolResult(invocation.toolName, invocation.result)
                return ui ? <div key={invocation.toolCallId} style={{ width: '100%' }}>{ui}</div> : null
              })}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        {(isLoading || isProcessingImage) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '2px 12px 12px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'var(--fg-secondary)',
            }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)' }} />
              {isProcessingImage ? 'El Gitano está mirando la foto de tu auto...' : 'El Gitano está pensando...'}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 5, overflowX: 'auto',
        background: 'var(--bg-elevated)',
      }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => { handleInputChange({ target: { value: s } } as any); inputRef.current?.focus() }}
            style={{
              flexShrink: 0, padding: '4px 10px',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
              background: 'var(--bg-card)',
              color: 'var(--fg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 2, cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.borderColor = 'var(--brand-border)'
              ;(e.target as HTMLElement).style.color = 'var(--brand)'
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.borderColor = 'var(--border)'
              ;(e.target as HTMLElement).style.color = 'var(--fg-secondary)'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-elevated)',
        }}
      >
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '8px 12px', gap: 8,
        }}>
          <input
            ref={inputRef}
            value={input || ''}
            onChange={handleInputChange}
            placeholder={isListening ? '🎙️ Escuchando...' : 'Escribile a El Gitano...'}
            disabled={isListening}
            style={{
              flex: 1, fontSize: 13,
              background: 'transparent',
              color: isListening ? 'var(--brand)' : 'var(--fg-primary)',
            }}
          />
          {input && (
            <button type="button" onClick={() => setInput('')} style={{ color: 'var(--fg-tertiary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Input file oculto para la cámara */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Camera button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingImage || isLoading}
          style={{
            width: 36, height: 36, borderRadius: 4,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--fg-secondary)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title="Subir foto de mi usado"
        >
          <Camera size={14} />
        </motion.button>

        {/* Mic button */}
        {hasSpeechRecognition && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoice}
            style={{
              width: 36, height: 36, borderRadius: 4,
              background: isListening ? 'var(--brand)' : 'var(--bg-card)',
              border: `1px solid ${isListening ? 'transparent' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isListening ? '#fff' : 'var(--fg-secondary)',
              cursor: 'pointer',
              boxShadow: isListening ? '0 0 16px var(--brand-glow)' : 'none',
              flexShrink: 0,
            }}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </motion.button>
        )}

        {/* Send button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!(input || '').trim() || isLoading || isProcessingImage}
          style={{
            width: 36, height: 36, borderRadius: 4,
            background: (input || '').trim() && !isLoading && !isProcessingImage ? 'var(--brand)' : 'var(--bg-card)',
            border: `1px solid ${(input || '').trim() && !isLoading && !isProcessingImage ? 'transparent' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: (input || '').trim() && !isLoading && !isProcessingImage ? '#fff' : 'var(--fg-tertiary)',
            cursor: (input || '').trim() && !isLoading && !isProcessingImage ? 'pointer' : 'default',
            flexShrink: 0,
          }}
        >
          <Send size={13} />
        </motion.button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
