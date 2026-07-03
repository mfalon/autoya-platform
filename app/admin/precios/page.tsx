'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Search, Car, HelpCircle, FileText, CheckCircle, ShieldCheck } from 'lucide-react'
import { formatARS } from '@/utils/currency'

export default function PreciosAcaraPage() {
  const [brand, setBrand] = useState('Toyota')
  const [model, setModel] = useState('Hilux')
  const [year, setYear] = useState('2022')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !model || !year) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/precios/acara?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&year=${year}`)
      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        alert(data.error || 'No se pudo obtener la cotización.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de red al consultar las Guías de Precios.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-base)', padding: '36px 40px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)' }}>
          <DollarSign size={18} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Valuaciones Oficiales</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
          Consulta de Precios (ACARA / Info Auto)
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 4 }}>
          Consulte y compare en tiempo real las valuaciones fiscales de la Guía Oficial ACARA y la Guía de Referencia Info Auto de la Cámara CCA.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Formulario y Resultados Container */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }} className="flex-col lg:grid">
          
          {/* Formulario */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '24px 28px', height: 'fit-content'
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Search size={14} style={{ color: 'var(--brand)' }} /> Panel de Búsqueda
            </h3>

            <form onSubmit={handleQuery} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Marca / Fabricante</label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)',
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {['Toyota', 'Chevrolet', 'Ford', 'Volkswagen', 'Peugeot', 'Fiat', 'Renault', 'Honda', 'Jeep'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Modelo de Serie / Versión</label>
                <input
                  type="text"
                  placeholder="Ej: Hilux SRX, Cruze Premier, Polo Track..."
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Año de Fabricación</label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)',
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {Array.from({ length: 15 }, (_, i) => String(2026 - i)).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', marginTop: 8,
                  background: 'var(--brand)', color: '#fff',
                  border: 'none', borderRadius: 3,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? 'Consultando...' : 'Consultar Guías'}
              </motion.button>
            </form>
          </div>

          {/* Resultados Comparativos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  {/* Header de resultados */}
                  <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)' }}>Comparativa de Guías Oficiales</h4>
                        <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginTop: 2 }}>{brand} {model} · Modelo {year}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                      Vigentes ✓
                    </span>
                  </div>

                  {/* Doble Columna ACARA vs Info Auto */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="flex-col md:grid">
                    
                    {/* Columna ACARA */}
                    <div style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 4, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fg-secondary)' }} />
                          Guía ACARA
                        </h4>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)' }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase' }}>Valor de Lista</span>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--fg-primary)', marginTop: 2 }}>
                            {formatARS(result.acara.lista_oficial)}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase' }}>Valor Asegurado</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-secondary)', marginTop: 2 }}>
                            {formatARS(result.acara.valor_asegurado)}
                          </p>
                        </div>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3, padding: '10px 12px', marginTop: 4 }}>
                          <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase' }}>Toma en Concesionaria</span>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginTop: 2 }}>
                            {formatARS(result.acara.toma_estimada)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Columna Info Auto */}
                    <div style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--brand-border)',
                      borderRadius: 4, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)' }} />
                          Guía Info Auto
                        </h4>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)' }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase' }}>Valor de Lista</span>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--fg-primary)', marginTop: 2 }}>
                            {formatARS(result.info_auto.lista_oficial)}
                          </p>
                        </div>
                        <div>
                          <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase' }}>Valor Asegurado</span>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-secondary)', marginTop: 2 }}>
                            {formatARS(result.info_auto.valor_asegurado)}
                          </p>
                        </div>
                        <div style={{ background: 'var(--brand-dim)', border: '1px dashed var(--brand-border)', borderRadius: 3, padding: '10px 12px', marginTop: 4 }}>
                          <span style={{ fontSize: 9, color: 'var(--brand)', fontWeight: 600, textTransform: 'uppercase' }}>Toma en Concesionaria</span>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginTop: 2 }}>
                            {formatARS(result.info_auto.toma_estimada)}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '12px 14px', fontSize: 10, color: 'var(--fg-tertiary)',
                    lineHeight: 1.5
                  }}>
                    * Info Auto y ACARA son marcas registradas de sus respectivas entidades. Los valores son de carácter informativo para tasación comercial interna y se calculan basándose en la fluctuación y depreciación estándar del mercado de concesionarios de la República Argentina.
                  </div>
                </motion.div>
              ) : (
                <div style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '48px 0', textAlign: 'center', color: 'var(--fg-tertiary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                  minHeight: 320,
                }}>
                  <Car size={32} style={{ opacity: 0.5, color: 'var(--fg-tertiary)' }} />
                  <div style={{ maxWidth: 300 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-secondary)' }}>Esperando Consulta de Valuación</span>
                    <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 6, lineHeight: 1.5 }}>
                      Ingrese la marca, modelo y año del coche a cotizar en el panel de la izquierda para contrastar los precios de ACARA e Info Auto.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  )
}
