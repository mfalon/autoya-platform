'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Play, Users, Eye, Terminal, CheckCircle2,
  AlertTriangle, HelpCircle, ArrowRight, ShieldCheck, Info
} from 'lucide-react'

export default function AuditoriaFlotaPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0) // 0: Idle, 1: Investigador, 2: Abogado, 3: Juez
  const [result, setResult] = useState<any>(null)
  
  const [selectedTruck, setSelectedTruck] = useState('Scania R450 - Patente AF-892-BB')

  const handleAudit = async () => {
    setLoading(true)
    setResult(null)
    setStep(1)

    // Simular el paso de telemetría al Investigador
    setTimeout(() => {
      setStep(2)
    }, 2500)

    // Simular el paso de análisis al Abogado del Diablo
    setTimeout(() => {
      setStep(3)
    }, 5000)

    try {
      const response = await fetch('/api/auditoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehiculo: selectedTruck })
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
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)' }}>
          <ShieldAlert size={18} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Auditoría Inteligente</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
          Enjambre Auditor de Combustible
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 4 }}>
          Estructura de debate de agentes con incentivos opuestos para auditar telemetría de tanques, mitigando falsos positivos.
        </p>
      </div>

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
              <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 4, display: 'block' }}>Critic (Propone causas físicas)</span>
            </div>

            <ArrowRight size={16} style={{ color: 'var(--border)' }} className="rotate-90 md:rotate-0" />

            {/* Agente 3 */}
            <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '14px', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <ShieldCheck size={14} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-primary)', display: 'block' }}>3. Auditor General</span>
              <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 4, display: 'block' }}>The Judge (Veredicto y Puntuación)</span>
            </div>

          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Consola de Control */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }} className="flex-col md:flex-row">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Unidad de la Flota a Auditar</label>
              <select
                value={selectedTruck}
                onChange={e => setSelectedTruck(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)',
                  outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="Scania R450 - Patente AF-892-BB">Scania R450 (Remolque Combustible) - Patente AF-892-BB</option>
                <option value="Volvo FH16 - Patente AE-112-CC">Volvo FH16 (Carga Pesada) - Patente AE-112-CC</option>
                <option value="Mercedes-Benz Axor - Patente AD-344-DD">Mercedes Axor - Patente AD-344-DD</option>
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

        {/* Panel Derecho: Telemetría Activa (Datos Crudos) */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 4, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)' }}>
              Telemetría Cruda (Gasoil)
            </h3>
            <span style={{ fontSize: 10, color: 'var(--fg-tertiary)' }}>Último Viaje (11 Registros)</span>
          </div>

          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 3 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Hora</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Estado</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Velocidad</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Litros</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--fg-secondary)' }}>Inclinación</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '10:00', est: 'Marcha', v: '80 km/h', l: 450, inc: '0°' },
                  { t: '10:15', est: 'Marcha', v: '82 km/h', l: 446, inc: '+1°' },
                  { t: '10:30', est: 'Marcha', v: '78 km/h', l: 442, inc: '-1°' },
                  { t: '10:45', est: 'Detenido', v: '0 km/h', l: 441, inc: '0°' },
                  { t: '10:47', est: 'Detenido', v: '0 km/h', l: 421, inc: '0°', highlight: true }, // Anomalía
                  { t: '10:50', est: 'Detenido', v: '0 km/h', l: 421, inc: '0°' },
                  { t: '11:05', est: 'Marcha', v: '85 km/h', l: 416, inc: '+5°' },
                  { t: '11:20', est: 'Marcha', v: '80 km/h', l: 412, inc: '0°' },
                  { t: '11:35', est: 'Detenido', v: '0 km/h', l: 410, inc: '-4°' },
                  { t: '11:37', est: 'Detenido', v: '0 km/h', l: 407, inc: '-4°' },
                  { t: '11:50', est: 'Marcha', v: '75 km/h', l: 402, inc: '0°' },
                ].map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid var(--border)',
                    background: row.highlight ? 'rgba(239,68,68,0.1)' : 'transparent',
                    color: row.highlight ? '#ef4444' : 'var(--fg-secondary)'
                  }}>
                    <td style={{ padding: '8px 12px', fontWeight: row.highlight ? 700 : 'normal' }}>{row.t}</td>
                    <td style={{ padding: '8px 12px' }}>{row.est}</td>
                    <td style={{ padding: '8px 12px' }}>{row.v}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>{row.l} L</td>
                    <td style={{ padding: '8px 12px' }}>{row.inc}</td>
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
                {step === 1 && '📑 [Agente 1] El Investigador Escéptico analizando datos...'}
                {step === 2 && '😈 [Agente 2] El Abogado del Diablo buscando causas físicas alternativas...'}
                {step === 3 && '👑 [Agente 3] El Auditor General recopilando debate para dictar veredicto...'}
              </span>
              <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                {step === 1 && 'El Auditor Forense está ejecutando restas y restas paso a paso sobre el combustible para hallar variaciones mayores a 2.5 litros detenido.'}
                {step === 2 && 'El Abogado del Diablo está cruzando las anomalías detectadas con las pendientes, variaciones térmicas e inconsistencias de sensores.'}
                {step === 3 && 'El Juez está evaluando el descargo y calculando la puntuación de confianza de fraude definitiva para el reporte de la concesionaria.'}
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
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fg-primary)' }}>Dictamen Final del Enjambre Auditor</h3>
                    <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 2 }}>{result.vehiculo} · Análisis de sensores completado</p>
                  </div>
                </div>
                
                {/* Alerta Supervisor */}
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  padding: '6px 12px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 10, fontWeight: 700
                }}>
                  <Info size={12} /> ALERTA DISPARADA A SUPERVISOR (CONF. {`>`} 8)
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
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Abogado del Diablo</span>
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
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-secondary)' }}>Esperando Ejecución de Auditoría</span>
            <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 6, lineHeight: 1.5 }}>
              Seleccione un camión de la flota de AutoYa en el panel superior y presione "Iniciar Auditoría" para desplegar el debate de agentes sobre los sensores de gasoil.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
