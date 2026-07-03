'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Play, Users, Eye, Terminal, CheckCircle2,
  AlertTriangle, HelpCircle, ArrowRight, ShieldCheck, Info, FileCode, Clock
} from 'lucide-react'

const MODULOS_SISTEMA = [
  { modulo: 'Checkout & Reserva MP', archivo: '/api/webhooks/mp/route.ts', implementacion: 'Recibe webhook de MercadoPago, actualiza estado a reservado y avanza trámite DNRPA.', riesgo: 'Validación de firma de webhook ausente o simulada.' },
  { modulo: 'Gestoría Digital DNRPA (OCR)', archivo: 'GestoriaDetailModal.tsx', implementacion: 'Gemini Vision OCR para DNI, auto-completa Formulario 08 Digital.', riesgo: 'OCR depende del contraste de imagen; borrador DNRPA es simulado.' },
  { modulo: 'Simulador Financiero', archivo: 'VehicleDetailModal.tsx', implementacion: 'Fórmula de Amortización Francesa reactiva con TNA/CFT configurable desde admin.', riesgo: 'Posible inconsistencia en redondeos de cuotas centavo a centavo.' },
  { modulo: 'Recuperación de Carritos (WhatsApp)', archivo: '/admin/clientes/page.tsx', implementacion: 'Dashboard omnichannel para clientes con carrito abandonado y alertas con 1-click WhatsApp.', riesgo: 'Logs de outbox en JSON local como fallback si falla Twilio.' },
  { modulo: 'Persistencia & DB', archivo: 'supabase.ts', implementacion: 'Lógica híbrida: Supabase Cloud en producción y fallback JSON/localStorage offline.', riesgo: 'Sincronización bidireccional asíncrona limitada.' },
  { modulo: 'Memoria de Asistente IA', archivo: 'memoria.ts', implementacion: 'Embeddings de Gemini y pgvector en Base de Datos para recordar preferencias del cliente.', riesgo: 'Consumo de tokens de contexto en hilos de conversación largos.' }
]

const ROL_COLOR: Record<string, string> = {
  role_admin:    '#e02232',
  role_ventas:   '#f59e0b',
  role_gestoria: '#4f8ef7',
}

const ROL_LABEL: Record<string, string> = {
  role_admin:    'Administrador',
  role_ventas:   'Ventas',
  role_gestoria: 'Gestoría',
}

export default function AuditoriaFlotaPage() {
  const [activeTab, setActiveTab] = useState<'debate' | 'logs'>('debate')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0) // 0: Idle, 1: Investigador, 2: Abogado, 3: Juez
  const [result, setResult] = useState<any>(null)
  const [selectedModule, setSelectedModule] = useState('Todos los Módulos')
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Cargar logs al cambiar a la pestaña de bitácora
  useEffect(() => {
    if (activeTab === 'logs') {
      setLogsLoading(true)
      fetch('/api/auditoria/logs')
        .then(res => res.json())
        .then(data => {
          setAuditLogs(data)
          setLogsLoading(false)
        })
        .catch(err => {
          console.error('[Logs UI] Error:', err)
          setLogsLoading(false)
        })
    }
  }, [activeTab])

  const handleAudit = async () => {
    setLoading(true)
    setResult(null)
    setStep(1)

    // Simular el paso visual al Investigador
    setTimeout(() => {
      setStep(2)
    }, 2500)

    // Simular el paso al Abogado del Diablo
    setTimeout(() => {
      setStep(3)
    }, 5000)

    try {
      const response = await fetch('/api/auditoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduloSeleccionado: selectedModule })
      })
      const data = await response.json()

      // Esperar a que la simulación visual termine antes de inyectar los datos reales
      setTimeout(() => {
        if (data.success) {
          setResult(data)
          setStep(4) // Finalizado
        } else {
          alert('Error al realizar la auditoría')
          setStep(0)
        }
        setLoading(false)
      }, 7500)

    } catch (err) {
      console.error(err)
      alert('Error de red al invocar al enjambre de auditoría')
      setLoading(false)
      setStep(0)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-base)', padding: '36px 40px' }}>
      
      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('debate')}
          style={{
            background: 'none', border: 'none',
            padding: '10px 4px', fontSize: 13, fontWeight: 600,
            color: activeTab === 'debate' ? 'var(--brand)' : 'var(--fg-secondary)',
            borderBottom: `2px solid ${activeTab === 'debate' ? 'var(--brand)' : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          Debate del Enjambre
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            background: 'none', border: 'none',
            padding: '10px 4px', fontSize: 13, fontWeight: 600,
            color: activeTab === 'logs' ? 'var(--brand)' : 'var(--fg-secondary)',
            borderBottom: `2px solid ${activeTab === 'logs' ? 'var(--brand)' : 'transparent'}`,
            cursor: 'pointer', transition: 'all 0.15s'
          }}
        >
          Bitácora de Seguridad (Audit Trail)
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)' }}>
          <ShieldAlert size={18} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Auditoría de Código y Arquitectura</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
          {activeTab === 'debate' ? 'Enjambre Auditor de Intranet' : 'Registro de Auditoría de Operaciones'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 4 }}>
          {activeTab === 'debate' 
            ? 'Estructura de debate de agentes con incentivos opuestos para evaluar la seguridad, lógica y UI de la plataforma de la Concesionaria.'
            : 'Listado en tiempo real de las operaciones críticas realizadas por los diferentes roles de usuario dentro del sistema.'}
        </p>
      </div>

      {activeTab === 'debate' ? (
        <>
          {/* Grid Superior: Arquitectura de Agentes y Control */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, marginBottom: 32 }} className="flex-col lg:grid">
            
            {/* Panel Izquierdo: Flujo del Enjambre */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)' }}>
                Estructura del Enjambre Auditor
              </h3>
              
              {/* Gráfico visual del enjambre */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0' }} className="flex-col md:flex-row">
                
                {/* Agente 1 */}
                <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '14px', textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Terminal size={14} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-primary)', display: 'block' }}>1. Investigador</span>
                  <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 4, display: 'block' }}>Forensic Auditor (Busca fallos)</span>
                </div>

                <ArrowRight size={16} style={{ color: 'var(--border)' }} className="rotate-90 md:rotate-0" />

                {/* Agente 2 */}
                <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '14px', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Users size={14} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-primary)', display: 'block' }}>2. Abogado del Diablo</span>
                  <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 4, display: 'block' }}>Critic (Propone defensas)</span>
                </div>

                <ArrowRight size={16} style={{ color: 'var(--border)' }} className="rotate-90 md:rotate-0" />

                {/* Agente 3 */}
                <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '14px', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <ShieldCheck size={14} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-primary)', display: 'block' }}>3. Auditor General</span>
                  <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 4, display: 'block' }}>The Judge (Veredicto y Alertas)</span>
                </div>

              </div>

              <div style={{ height: 1, background: 'var(--border)' }} />

              {/* Consola de Control */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }} className="flex-col md:flex-row">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                  <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Módulo del Sistema a Auditar</label>
                  <select
                    value={selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)',
                      outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="Todos los Módulos">Todos los Módulos (Auditoría Completa)</option>
                    <option value="Checkout & Reserva MP">Checkout & Reserva MP (/api/webhooks/mp)</option>
                    <option value="Gestoría Digital DNRPA (OCR)">Gestoría Digital DNRPA (OCR DNI)</option>
                    <option value="Simulador Financiero">Simulador Financiero (Amortización Francesa)</option>
                    <option value="Recuperación de Carritos (WhatsApp)">Recuperación de Carritos (WhatsApp Leads)</option>
                    <option value="Persistencia & DB">Persistencia & DB (Supabase Fallback)</option>
                    <option value="Memoria de Asistente IA">Memoria de Asistente IA (pgvector)</option>
                  </select>
                </div>
                
                <button
                  onClick={handleAudit}
                  disabled={loading}
                  style={{
                    padding: '12px 24px', background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                    width: '100%', flex: 'initial'
                  }}
                >
                  <Play size={12} fill="#fff" /> Iniciar Auditoría
                </button>
              </div>
            </div>

            {/* Panel Derecho: Tabla de la Arquitectura de Software */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)' }}>
                  Componentes del Sistema Auditados
                </h3>
                <span style={{ fontSize: 10, color: 'var(--fg-tertiary)' }}>AutoYa Intranet</span>
              </div>

              <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 3 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Módulo</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Archivo</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Riesgo Auditado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULOS_SISTEMA.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg-secondary)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{m.modulo}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--brand)' }}>{m.archivo}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--fg-tertiary)' }}>{m.riesgo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Flujo de Debate Animado en tiempo real */}
          <AnimatePresence>
            {loading && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20
                }}
              >
                <div className="animate-spin" style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--brand)' }} />
                
                <div style={{ maxWidth: 450 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)', display: 'block' }}>
                    {step === 1 && '📑 [Agente 1] El Investigador Escéptico buscando vulnerabilidades de software...'}
                    {step === 2 && '😈 [Agente 2] El Abogado del Diablo argumentando soluciones de diseño...'}
                    {step === 3 && '👑 [Agente 3] El Auditor General resolviendo prioridades de refactorización...'}
                  </span>
                  <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                    {step === 1 && 'El Auditor Forense está evaluando riesgos lógicos de negocio, control de firmas de webhooks e inconsistencias en simulaciones prendarias.'}
                    {step === 2 && 'El Abogado del Diablo está rebatiendo las acusaciones argumentando fallbacks locales eficientes, reducción de latencia y modularidad.'}
                    {step === 3 && 'El Juez está ponderando el descargo y clasificando hallazgos críticos de seguridad para emitir el dictamen final.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resultados de la Auditoría */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
              >
                
                {/* Caja de Dictamen Principal */}
                <div style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-primary)' }}>Dictamen Final del Enjambre de Software</h3>
                        <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 2 }}>{result.moduloSeleccionado} · Análisis de calidad de código e intranet completado</p>
                      </div>
                    </div>
                    
                    {/* Alerta Refactorización */}
                    <div style={{
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                      padding: '6px 12px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 10, fontWeight: 700
                    }}>
                      <FileCode size={12} /> REPORTE DE MEJORAS ENVIADO A DESARROLLO (PUNTAJE GENERAL DICTADO)
                    </div>
                  </div>
                </div>

                {/* Bloques de Debate Lado a Lado */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }} className="flex-col lg:grid">
                  
                  {/* Columna Investigador */}
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
                      <Terminal size={14} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Investigador Escéptico</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    <div style={{
                      fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace', background: 'var(--bg-card)', padding: 14, borderRadius: 3, border: '1px solid var(--border)', maxHeight: 380, overflowY: 'auto'
                    }}>
                      {result.debate.investigador}
                    </div>
                  </div>

                  {/* Columna Abogado del Diablo */}
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b' }}>
                      <Users size={14} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Abogado del Diablo (Defensa)</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    <div style={{
                      fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace', background: 'var(--bg-card)', padding: 14, borderRadius: 3, border: '1px solid var(--border)', maxHeight: 380, overflowY: 'auto'
                    }}>
                      {result.debate.abogado}
                    </div>
                  </div>

                  {/* Columna Juez */}
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--brand-border)', borderRadius: 4, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)' }}>
                      <ShieldCheck size={14} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Veredicto del Juez</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    <div style={{
                      fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace', background: 'var(--brand-dim)', padding: 14, borderRadius: 3, border: '1px dashed var(--brand-border)', maxHeight: 380, overflowY: 'auto'
                    }}>
                      {result.debate.juez}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Estado Idle */}
          {!loading && !result && (
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '64px 0', textAlign: 'center', color: 'var(--fg-tertiary)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              minHeight: 280,
            }}>
              <ShieldAlert size={36} style={{ opacity: 0.5, color: 'var(--fg-tertiary)' }} />
              <div style={{ maxWidth: 360 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-secondary)' }}>Esperando Auditoría de Código</span>
                <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 6, lineHeight: 1.5 }}>
                  Seleccione un módulo funcional de la intranet de la concesionaria en el panel superior y presione "Iniciar Auditoría" para desplegar el debate de agentes sobre la calidad del desarrollo.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Bitácora de Seguridad (Audit Trail) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)' }}>
                Bitácora Operativa de Seguridad
              </h3>
              <span style={{ fontSize: 11, color: 'var(--fg-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> Actualizado en caliente
              </span>
            </div>

            {logsLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-secondary)', fontSize: 12 }}>
                Cargando registros de auditoría...
              </div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-tertiary)', fontSize: 12 }}>
                No se registran operaciones en la bitácora aún.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 3 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--fg-secondary)', fontSize: 11 }}>Timestamp</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--fg-secondary)', fontSize: 11 }}>Usuario</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--fg-secondary)', fontSize: 11 }}>Rol</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--fg-secondary)', fontSize: 11 }}>Operación</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--fg-secondary)', fontSize: 11 }}>Detalles de Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg-secondary)' }}>
                        <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--fg-tertiary)', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString('es-AR')}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--fg-primary)' }}>
                          {log.usuario}
                        </td>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
                            background: ROL_COLOR[log.rol] + '15',
                            border: `1px solid ${ROL_COLOR[log.rol]}25`,
                            color: ROL_COLOR[log.rol]
                          }}>
                            {ROL_LABEL[log.rol] || log.rol}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--brand)', whiteSpace: 'nowrap' }}>
                          {log.accion}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--fg-secondary)', lineHeight: 1.4 }}>
                          {log.detalles}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
