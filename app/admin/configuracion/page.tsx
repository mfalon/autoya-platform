'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Percent, FileText, Check, RotateCcw, ShieldCheck } from 'lucide-react'

export default function ConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Datos del formulario
  const [tna12, setTna12] = useState('65')
  const [tna24, setTna24] = useState('68')
  const [tna36, setTna36] = useState('72')
  const [tna48, setTna48] = useState('75')
  const [cftDefault, setCftDefault] = useState('95')
  const [legend, setLegend] = useState('')

  // Cargar configuración actual
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setTna12(String(Math.round(data.tna12 * 100)))
        setTna24(String(Math.round(data.tna24 * 100)))
        setTna36(String(Math.round(data.tna36 * 100)))
        setTna48(String(Math.round(data.tna48 * 100)))
        setCftDefault(String(Math.round(data.cftDefault * 100)))
        setLegend(data.legend || '')
        setLoading(false)
      })
      .catch(err => {
        console.error('Error al cargar config:', err)
        setLoading(false)
      })
  }, [])

  // Guardar configuración
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tna12: Number(tna12) / 100,
          tna24: Number(tna24) / 100,
          tna36: Number(tna36) / 100,
          tna48: Number(tna48) / 100,
          cftDefault: Number(cftDefault) / 100,
          legend,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Error al guardar la configuración')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al servidor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)', fontSize: 14 }}>
        Cargando parámetros prendarios...
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-base)', padding: '36px 40px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)' }}>
            <Settings size={18} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Configuración Global</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
            Parámetros Prendarios
          </h1>
          <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 4 }}>
            Edite las tasas de interés prendario y la leyenda legal del simulador de financiación del catálogo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 900 }} className="flex-col md:grid">
        
        {/* Left Column: Tasas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '24px 28px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Percent size={14} style={{ color: 'var(--brand)' }} /> Tasas Nominales Anuales (TNA)
          </h3>
          <div style={{ height: 1, background: 'var(--border)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { id: '12', label: 'Plazo 12 Meses', value: tna12, setter: setTna12 },
              { id: '24', label: 'Plazo 24 Meses', value: tna24, setter: setTna24 },
              { id: '36', label: 'Plazo 36 Meses', value: tna36, setter: setTna36 },
              { id: '48', label: 'Plazo 48 Meses', value: tna48, setter: setTna48 },
            ].map(p => (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>{p.label}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={p.value}
                    onChange={e => p.setter(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', paddingRight: 28,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 3, fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)',
                      outline: 'none',
                    }}
                    required
                  />
                  <span style={{ position: 'absolute', right: 12, fontSize: 12, fontWeight: 700, color: 'var(--fg-tertiary)' }}>%</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Costo Financiero Total de Referencia (CFT)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '50%' }}>
              <input
                type="number"
                min="1"
                max="400"
                value={cftDefault}
                onChange={e => setCftDefault(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', paddingRight: 28,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)',
                  outline: 'none',
                }}
                required
              />
              <span style={{ position: 'absolute', right: 12, fontSize: 12, fontWeight: 700, color: 'var(--fg-tertiary)' }}>%</span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginTop: 2 }}>
              Tasa anualizada orientativa utilizada para calcular el CFT de referencia.
            </p>
          </div>
        </div>

        {/* Right Column: Leyenda & Guardar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '24px 28px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={14} style={{ color: 'var(--brand)' }} /> Leyenda Legal e Información
            </h3>
            <div style={{ height: 1, background: 'var(--border)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Texto aclaratorio del simulador</label>
              <textarea
                value={legend}
                onChange={e => setLegend(e.target.value)}
                style={{
                  width: '100%', minHeight: 110, padding: '10px 12px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)',
                  outline: 'none', lineHeight: 1.5, resize: 'none',
                }}
                required
              />
            </div>
            <p style={{ fontSize: 10, color: 'var(--fg-tertiary)' }}>
              Esta aclaración legal se renderizará al pie de la caja informativa en la pestaña "Simular Financiación" de los vehículos.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              style={{
                flex: 1, padding: '14px',
                background: 'var(--brand)', color: '#fff',
                border: 'none', borderRadius: 3,
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {saving ? 'Guardando...' : (
                <>
                  <ShieldCheck size={14} /> Guardar Parámetros
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '12px 16px', borderRadius: 3,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                    color: '#22c55e', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Check size={14} /> ¡Guardado!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </form>

    </div>
  )
}
