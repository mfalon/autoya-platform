'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, ArrowLeft, Clock, UserCheck, Shield, Upload, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatARS } from '@/utils/currency'
import type { Tramite, EstadoTramite } from '@/types/admin'

const ESTADOS: { id: EstadoTramite; label: string; desc: string }[] = [
  { id: 'reserva', label: 'Reserva Pagada', desc: 'Recibimos la seña de su unidad y el vehículo fue retirado del catálogo público.' },
  { id: 'validacion', label: 'Validación de Identidad', desc: 'Requerimos la carga de su documento nacional de identidad (DNI) para iniciar el trámite.' },
  { id: 'formulario08', label: 'DNRPA Formulario 08', desc: 'Su documentación se encuentra registrada digitalmente en el Registro de la Propiedad Automotor.' },
  { id: 'finalizado', label: 'Unidad Lista para Entrega', desc: 'Transferencia inscrita con éxito. La unidad está lista para ser retirada de la concesionaria.' },
]

export default function ConsultaTramitePage() {
  const [dniInput, setDniInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [tramite, setTramite] = useState<Tramite | null>(null)

  // Estados de carga de DNI
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dniInput.trim()) return

    setLoading(true)
    setErrorMsg(null)
    setTramite(null)

    try {
      const res = await fetch(`/api/tramites/consulta?dni=${dniInput.trim()}`)
      const data = await res.json()

      if (res.ok && data.success) {
        setTramite(data.tramite)
      } else {
        setErrorMsg(data.error || 'No se encontró ningún trámite activo para el DNI ingresado.')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Error de conexión al consultar el trámite.')
    } finally {
      setLoading(false)
    }
  }

  // Carga de archivo DNI (frente o dorso)
  const handleUploadDni = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !tramite) return

    setUploading(true)
    setOcrError(null)
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append('image', file)

    try {
      // 1. Ejecutar OCR con Gemini Vision
      const ocrRes = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })
      const ocrData = await ocrRes.json()

      if (!ocrRes.ok || !ocrData.success) {
        throw new Error(ocrData.error || 'No se pudo leer la imagen del DNI. Intente con una foto más nítida.')
      }

      // Validación de calidad básica
      const dniClean = String(ocrData.data.dni || '').replace(/\D/g, '')
      const hasNames = !!ocrData.data.nombres && !!ocrData.data.apellido
      
      if (dniClean.length < 7 || dniClean.length > 9 || !hasNames) {
        setOcrError('⚠️ Calidad de imagen baja. La lectura automática falló. Sin embargo, cargaremos el documento para validación manual de la gestoría.')
      }

      // 2. Actualizar trámite con la data y marcar como procesado
      const updateRes = await fetch('/api/tramites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tramite.id,
          comprador_nombre: hasNames ? `${ocrData.data.nombres} ${ocrData.data.apellido}`.trim() : tramite.comprador_nombre,
          comprador_dni: ocrData.data.dni || tramite.comprador_dni,
          dni_data: ocrData.data,
        }),
      })

      if (updateRes.ok) {
        // 3. Registrar en Auditoría (Seguridad)
        await fetch('/api/auditoria/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario: `Cliente Extrano (DNI: ${dniInput})`,
            rol: 'cliente_externo',
            accion: 'Carga de Documentación',
            detalles: `Subió y validó foto de DNI en Extranet para el trámite #${tramite.id.slice(0, 8)}. OCR: ${ocrData.data.nombres} ${ocrData.data.apellido}`
          })
        })

        setUploadSuccess(true)
        // Recargar datos
        setTramite(prev => prev ? {
          ...prev,
          comprador_nombre: hasNames ? `${ocrData.data.nombres} ${ocrData.data.apellido}`.trim() : prev.comprador_nombre,
          comprador_dni: ocrData.data.dni || prev.comprador_dni,
          dni_procesado: true,
        } : null)
      } else {
        throw new Error('Error al actualizar el trámite en base de datos.')
      }

    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Error al procesar el archivo.')
    } finally {
      setUploading(false)
    }
  }

  // Índice del paso actual en la visualización del stepper
  const currentStepIndex = tramite ? ESTADOS.findIndex(e => e.id === tramite.estado) : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg, #09090b 45%, #1d0c0e 100%)',
      minHeight: '100vh', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)',
      padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      
      {/* Header Corporativo */}
      <div style={{ width: '100%', maxWidth: 720, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 2, textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fg-primary)' }}>AUTO</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--brand)' }}>YA</span>
          <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: 8 }}>Extranet</span>
        </Link>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--fg-secondary)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }} className="hover:text-[var(--brand)] transition-colors">
          <ArrowLeft size={13} /> Volver al sitio
        </Link>
      </div>

      <main style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* BUSCADOR */}
        <AnimatePresence mode="wait">
          {!tramite ? (
            <motion.div
              key="search-box"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '40px 32px', textAlign: 'center',
                boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--brand-dim)', border: '1px solid var(--brand-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--brand)', margin: '0 auto 16px'
              }}>
                <FileText size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg-primary)' }}>
                Rastreo de Transferencia Prendaria
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 8, maxWidth: 500, marginInline: 'auto', lineHeight: 1.6 }}>
                Ingrese el Documento Nacional de Identidad (DNI) del comprador registrado para verificar el estado de su trámite de transferencia de Formulario 08 en tiempo real.
              </p>

              <form onSubmit={handleBuscar} style={{
                display: 'flex', gap: 10, maxWidth: 460, margin: '28px auto 0',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: 6, alignItems: 'center'
              }}>
                <Search size={16} style={{ color: 'var(--fg-tertiary)', marginLeft: 10 }} />
                <input
                  type="text"
                  placeholder="Ingrese DNI (ej: 28.456.789)"
                  value={dniInput}
                  onChange={e => setDniInput(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 14, color: 'var(--fg-primary)', flex: 1, padding: '8px 4px'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px', background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer'
                  }}
                >
                  {loading ? 'Consultando...' : 'Buscar'}
                </button>
              </form>

              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 12, color: 'var(--brand)', marginTop: 16 }}
                >
                  ⚠️ {errorMsg}
                </motion.p>
              )}
            </motion.div>
          ) : (
            
            // DETALLE DEL TRÁMITE / SEGUIMIENTO
            <motion.div
              key="details-box"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Botón nueva búsqueda */}
              <button
                onClick={() => { setTramite(null); setDniInput(''); setErrorMsg(null); setOcrError(null); setUploadSuccess(false); }}
                style={{
                  alignSelf: 'flex-start', background: 'none', border: 'none',
                  color: 'var(--fg-secondary)', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                &larr; Buscar otro documento
              </button>

              {/* Ficha del Auto Señado */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '20px 24px', display: 'flex', gap: 20,
                alignItems: 'center', flexWrap: 'wrap'
              }}>
                <div style={{
                  width: 80, height: 60, borderRadius: 4,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  overflow: 'hidden', flexShrink: 0
                }}>
                  {tramite.vehiculo_image ? (
                    <img src={tramite.vehiculo_image} alt={tramite.vehiculo_model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚗</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Unidad Señada</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg-primary)', marginTop: 2 }}>
                    {tramite.vehiculo_brand} {tramite.vehiculo_model}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>
                    Año modelo: {tramite.vehiculo_year} · Operación registrada a favor de {tramite.comprador_nombre}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Valor Contado</span>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg-primary)', fontFamily: 'var(--font-display)', marginTop: 2 }}>
                    {formatARS(tramite.precio_ars)}
                  </p>
                </div>
              </div>

              {/* ESTADO STEPS (Línea de Tiempo) */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '32px'
              }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg-primary)', marginBottom: 24 }}>
                  Estado de su Gestión
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {ESTADOS.map((est, idx) => {
                    const isCompleted = idx < currentStepIndex
                    const isCurrent = idx === currentStepIndex
                    const isPending = idx > currentStepIndex

                    return (
                      <div key={est.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        
                        {/* Línea vertical conectora */}
                        {idx < ESTADOS.length - 1 && (
                          <div style={{
                            position: 'absolute', left: 13, top: 28, bottom: -20, width: 2,
                            background: isCompleted ? 'var(--brand)' : 'var(--border)',
                            zIndex: 1
                          }} />
                        )}

                        {/* Icono / Indicador de paso */}
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isCompleted ? 'var(--brand)' : isCurrent ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                          border: `2px solid ${isCompleted || isCurrent ? 'var(--brand-border)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isCompleted ? '#fff' : isCurrent ? 'var(--brand)' : 'var(--fg-tertiary)',
                          fontSize: 11, fontWeight: 700, zIndex: 2, flexShrink: 0
                        }}>
                          {isCompleted ? <CheckCircle2 size={14} /> : (idx + 1)}
                        </div>

                        {/* Texto descriptivo del paso */}
                        <div style={{ flex: 1, paddingTop: 3 }}>
                          <h4 style={{
                            fontSize: 14, fontWeight: 700,
                            color: isCurrent ? 'var(--fg-primary)' : isCompleted ? 'var(--fg-secondary)' : 'var(--fg-tertiary)'
                          }}>
                            {est.label}
                          </h4>
                          {isCurrent && (
                            <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                              {est.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ACCIÓN REQUERIDA: SUBIR DNI (Si está en validación) */}
              {tramite.estado === 'validacion' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'var(--bg-surface)', border: '1px dashed var(--brand-border)',
                    borderRadius: 6, padding: '24px 28px',
                    boxShadow: '0 0 24px var(--brand-glow)'
                  }}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#f59e0b', flexShrink: 0
                    }}>
                      <AlertCircle size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-primary)' }}>
                        Carga Obligatoria de Documentación (DNI)
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                        Para avanzar con la inscripción de la transferencia prendaria frente a la DNRPA, requerimos una foto nítida (frente o dorso) de su Documento Nacional de Identidad. Nuestra IA procesará el documento automáticamente.
                      </p>

                      {/* Cargador */}
                      <div style={{ marginTop: 18 }}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleUploadDni}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                              padding: '10px 16px', background: 'var(--brand)', color: '#fff',
                              border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700,
                              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 8
                            }}
                          >
                            {uploading ? <Loader2Icon /> : <Upload size={13} />}
                            {uploading ? 'Procesando OCR...' : 'Subir foto del DNI'}
                          </button>

                          {tramite.dni_procesado && !uploadSuccess && (
                            <span style={{ fontSize: 11, color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> DNI ya cargado anteriormente
                            </span>
                          )}

                          {uploadSuccess && (
                            <span style={{ fontSize: 11, color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} /> ¡Documento subido y validado con éxito!
                            </span>
                          )}
                        </div>

                        {ocrError && (
                          <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 10, lineHeight: 1.4 }}>
                            {ocrError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* NOTA ACLARATORIA / SOPORTE */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '14px 18px', display: 'flex', gap: 10,
                alignItems: 'center', color: 'var(--fg-tertiary)', fontSize: 11
              }}>
                <Shield size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                <span>
                  Este es un portal seguro de AutoYa. Toda la documentación subida cuenta con cifrado TLS y se almacena bajo estrictas medidas de seguridad informática de acuerdo a la Ley de Protección de Datos Personales.
                </span>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}

function Loader2Icon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
