'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function CameraMobilePage() {
  return (
    <SuspenseWrapper>
      <CameraMobileContent />
    </SuspenseWrapper>
  )
}

// React Suspense wrapper para evitar problemas con useSearchParams en build estático de Next.js
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{
        background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa'
      }}>
        Cargando interfaz de cámara...
      </div>
    )
  }

  return <>{children}</>
}

function CameraMobileContent() {
  const searchParams = useSearchParams()
  const syncId = searchParams.get('syncId')

  // Estados de carga de imagen
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Acceder a la cámara trasera nativa del móvil
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressing(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1000 // Tamaño optimizado comercial
        const MAX_HEIGHT = 750
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Comprimir a WebP ultraligero (calidad 0.7)
          const compressedBase64 = canvas.toDataURL('image/webp', 0.7)
          setImageSrc(compressedBase64)
        }
        setCompressing(false)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Enviar imagen a la intranet de escritorio
  const handleSendImage = async () => {
    if (!imageSrc || !syncId) return

    setSending(true)
    try {
      const res = await fetch('/api/vehiculos/camera-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncId,
          image: imageSrc
        })
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        alert('Error al enviar la imagen. Inténtelo de nuevo.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al servidor.')
    } finally {
      setSending(false)
    }
  }

  if (!syncId) {
    return (
      <div style={{
        background: '#09090b', minHeight: '100vh', padding: '40px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#f4f4f5', fontFamily: 'var(--font-sans)', textAlign: 'center'
      }}>
        <AlertCircle size={44} style={{ color: 'var(--brand)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Enlace de Sincronización Inválido</h2>
        <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 8, maxWidth: 300 }}>
          Este portal requiere ser abierto escaneando el código QR generado en el sistema de stock del panel administrativo.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(180deg, #09090b 0%, #18090a 100%)',
      minHeight: '100vh', padding: '32px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      color: '#f4f4f5', fontFamily: 'var(--font-sans)'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em' }}>AUTO</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
        </div>
        <p style={{ fontSize: 10, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
          Cámara Sincronizada QR
        </p>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '24px 0' }}>
        <AnimatePresence mode="wait">
          
          {/* PASO 1: Captura o Compresión */}
          {!imageSrc && !success && (
            <motion.div
              key="step-capture"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCapture}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: 'rgba(224,34,50,0.1)', border: '2px dashed var(--brand-border)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--brand)', margin: '0 auto 24px', cursor: 'pointer',
                  boxShadow: '0 0 32px var(--brand-glow)'
                }}
              >
                {compressing ? (
                  <RefreshCw size={36} style={{ animation: 'spin 1.5s linear infinite' }} />
                ) : (
                  <Camera size={38} />
                )}
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 10 }}>
                  {compressing ? 'Optimizando...' : 'Tomar Foto'}
                </span>
              </button>

              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Capturar Foto del Vehículo</h3>
              <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 8, padding: '0 20px', lineHeight: 1.5 }}>
                Presione el botón para abrir la cámara de su celular. Al capturar, la foto se optimizará automáticamente para reducir peso.
              </p>
            </motion.div>
          )}

          {/* PASO 2: Confirmar Envío */}
          {imageSrc && !success && (
            <motion.div
              key="step-preview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Foto capturada */}
              <div style={{
                width: '100%', aspectRatio: '4/3', borderRadius: 6,
                border: '1px solid var(--border)', overflow: 'hidden',
                background: '#18181b', position: 'relative'
              }}>
                <img src={imageSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {sending && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(9,9,11,0.7)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10
                  }}>
                    <RefreshCw size={24} style={{ color: 'var(--brand)', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12, color: '#f4f4f5', fontWeight: 600 }}>Enviando a computadora...</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setImageSrc(null)}
                  disabled={sending}
                  style={{
                    flex: 1, padding: 12, background: 'transparent', border: '1px solid var(--border)',
                    color: '#a1a1aa', borderRadius: 4, fontSize: 12, fontWeight: 700,
                    textTransform: 'uppercase', cursor: 'pointer'
                  }}
                >
                  Repetir
                </button>
                <button
                  onClick={handleSendImage}
                  disabled={sending}
                  style={{
                    flex: 2, padding: 12, background: 'var(--brand)', border: 'none',
                    color: '#fff', borderRadius: 4, fontSize: 12, fontWeight: 700,
                    textTransform: 'uppercase', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Enviar Foto <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Éxito */}
          {success && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#22c55e', margin: '0 auto 20px',
                boxShadow: '0 0 24px rgba(34,197,94,0.2)'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>¡Foto Vinculada con Éxito!</h3>
              <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 8, lineHeight: 1.5 }}>
                La imagen ha sido comprimida en WebP y transferida de forma segura a su panel de administración en la computadora. Ya puede cerrar esta ventana.
              </p>
              
              <button
                onClick={() => { setImageSrc(null); setSuccess(false); }}
                style={{
                  marginTop: 24, padding: '10px 20px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', color: '#f4f4f5', borderRadius: 3,
                  fontSize: 12, cursor: 'pointer'
                }}
              >
                Capturar otra foto
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#71717a', fontSize: 10 }}>
        <ShieldCheck size={12} style={{ color: 'var(--brand)' }} />
        <span>Conexión Segura AutoYa · Compresión WebP Activa</span>
      </div>

    </div>
  )
}
