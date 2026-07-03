import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Gauge, Shield, Info, CreditCard, ChevronLeft, ChevronRight, Zap, Check, Send } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import type { Vehicle } from '@/data/vehicles'

interface VehicleDetailModalProps {
  vehicle: Vehicle
  onClose: () => void
  onReservar: () => void
  initialTab?: 'ficha' | 'financiacion'
}

const DEFAULT_PLAZOS = [
  { meses: 12, tna: 0.65 },
  { meses: 24, tna: 0.68 },
  { meses: 36, tna: 0.72 },
  { meses: 48, tna: 0.75 },
]

export default function VehicleDetailModal({ vehicle, onClose, onReservar, initialTab = 'ficha' }: VehicleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'ficha' | 'financiacion'>(initialTab)
  const [currentImgIdx, setCurrentImgIdx] = useState(0)

  // Datos de tasas y leyendas dinámicas desde la API
  const [plazos, setPlazos] = useState(DEFAULT_PLAZOS)
  const [leyenda, setLeyenda] = useState("Simulación bajo sistema de amortización francés. Tasa fija en Pesos. No incluye gastos de otorgamiento ni seguros.")

  // Cargar configuración dinámica
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.tna12) {
          setPlazos([
            { meses: 12, tna: Number(data.tna12) },
            { meses: 24, tna: Number(data.tna24) },
            { meses: 36, tna: Number(data.tna36) },
            { meses: 48, tna: Number(data.tna48) },
          ])
        }
        if (data.legend) {
          setLeyenda(data.legend)
        }
      })
      .catch(err => console.error('[Config] Error al cargar tasas prendarias:', err))
  }, [])

  // Datos del simulador de financiación
  const [anticipo, setAnticipo] = useState(Math.round(vehicle.precio_ars * 0.40)) // 40% por defecto
  const [plazoMeses, setPlazoMeses] = useState(24)
  const [hasUsado, setHasUsado] = useState(false)
  const [valorUsado, setValorUsado] = useState(Math.round(vehicle.precio_ars * 0.30)) // 30% por defecto si activa

  // Lista de fotos mockeada según el tipo de auto
  const images = useMemo(() => {
    return [
      vehicle.image,
      vehicle.image, // duplicamos o simulamos variantes de luz
      vehicle.image,
    ]
  }, [vehicle.image])

  // Lógica del simulador de financiación
  const totalEntregado = anticipo + (hasUsado ? valorUsado : 0)
  const saldoAFinanciar = Math.max(0, vehicle.precio_ars - totalEntregado)
  const plazoConfig = plazos.find(p => p.meses === plazoMeses) || plazos[1]
  
  const cuotaMensual = useMemo(() => {
    if (saldoAFinanciar <= 0) return 0
    // Fórmula francesa de amortización: C = (V * i) / (1 - (1 + i)^-n)
    const tasaMensual = plazoConfig.tna / 12
    const cuota = (saldoAFinanciar * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses))
    return Math.round(cuota)
  }, [saldoAFinanciar, plazoMeses, plazoConfig])

  const nextImage = () => {
    setCurrentImgIdx(prev => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImgIdx(prev => (prev - 1 + images.length) % images.length)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,6,10,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            width: '100%', maxWidth: 840,
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)',
          }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {vehicle.brand} · Ficha Exclusiva
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
                {vehicle.model} <span style={{ color: 'var(--fg-secondary)', fontWeight: 400, fontSize: 15 }}>{vehicle.version}</span>
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', padding: 6 }}>
              <X size={18} />
            </button>
          </div>

          {/* Body Split */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row' }} className="flex-col md:flex-row">
            
            {/* Left Column: Gallery & Fast Info */}
            <div style={{
              flex: '1.2', display: 'flex', flexDirection: 'column',
              borderRight: '1px solid var(--border)',
              background: 'var(--bg-base)',
            }}>
              {/* Slider */}
              <div style={{ position: 'relative', height: 260, background: 'var(--bg-card)', overflow: 'hidden' }}>
                <img
                  src={images[currentImgIdx]}
                  alt="Gallery"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Navigation arrows */}
                <button onClick={prevImage} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer',
                }}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextImage} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', cursor: 'pointer',
                }}>
                  <ChevronRight size={16} />
                </button>

                {/* Bullets */}
                <div style={{
                  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 6,
                }}>
                  {images.map((_, idx) => (
                    <div key={idx} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: idx === currentImgIdx ? 'var(--brand)' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.15s',
                    }} />
                  ))}
                </div>
              </div>

              {/* Fast specs below gallery */}
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { icon: <Calendar size={13} />, label: 'Año', value: vehicle.year },
                  { icon: <Gauge size={13} />, label: 'Odómetro', value: vehicle.condition === '0km' ? '0 km' : `${vehicle.km.toLocaleString('es-AR')} km` },
                  { icon: <Shield size={13} />, label: 'Garantía', value: vehicle.condition === '0km' ? '3 años o 100k' : 'Apta reventa' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '10px 12px', textAlign: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--brand)', marginBottom: 4 }}>
                      {icon}
                      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-tertiary)' }}>{label}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)', fontFamily: 'var(--font-display)' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Tabs */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
              
              {/* Tab Selector */}
              <div style={{
                display: 'flex', borderBottom: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}>
                {[
                  { id: 'ficha', label: 'Ficha Técnica' },
                  { id: 'financiacion', label: 'Simular Financiación' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    style={{
                      flex: 1, padding: '14px 10px',
                      fontSize: 12, fontWeight: 600,
                      background: 'none', border: 'none',
                      color: activeTab === t.id ? 'var(--brand)' : 'var(--fg-secondary)',
                      borderBottom: `2px solid ${activeTab === t.id ? 'var(--brand)' : 'transparent'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {activeTab === 'ficha' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>Especificaciones Técnicas</h3>
                    {[
                      { label: 'Marca / Fabricante', value: vehicle.brand },
                      { label: 'Modelo de serie', value: vehicle.model },
                      { label: 'Versión / Equipamiento', value: vehicle.version },
                      { label: 'Motorización', value: vehicle.specs.power_cv + ' CV de fuerza' },
                      { label: 'Combustible', value: vehicle.fuel_type },
                      { label: 'Velocidad Máxima', value: vehicle.specs.top_speed },
                      { label: 'Aceleración (0-100)', value: vehicle.specs.acceleration },
                      { label: 'Autonomía de tanque', value: vehicle.specs.autonomy },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between',
                        paddingBottom: 8, borderBottom: '1px dashed var(--border)',
                        fontSize: 12,
                      }}>
                        <span style={{ color: 'var(--fg-secondary)' }}>{label}</span>
                        <span style={{ color: 'var(--fg-primary)', fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'financiacion' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'var(--ai-dim)', border: '1px solid var(--ai-border)',
                      borderRadius: 3, padding: '8px 10px', fontSize: 11, color: 'var(--ai)',
                    }}>
                      <Info size={12} />
                      {leyenda}
                    </div>

                    {/* Anticipo en Efectivo */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anticipo en Efectivo</span>
                        <input
                          type="text"
                          value={anticipo ? `$ ${anticipo.toLocaleString('es-AR')}` : ''}
                          onChange={e => {
                            const val = Number(e.target.value.replace(/\D/g, ''));
                            if (val <= vehicle.precio_ars) setAnticipo(val);
                          }}
                          style={{
                            width: 140, padding: '4px 8px', textAlign: 'right',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            borderRadius: 3, fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.round(vehicle.precio_ars * 0.90)} // máximo 90%
                        step={100_000}
                        value={anticipo}
                        onChange={e => setAnticipo(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <p style={{ fontSize: 9, color: 'var(--fg-tertiary)', marginTop: 4 }}>
                        Deslice o tipee el monto en efectivo a entregar.
                      </p>
                    </div>

                    {/* Entrega de Usado Toggle */}
                    <div style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 4, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--fg-secondary)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={hasUsado}
                            onChange={e => setHasUsado(e.target.checked)}
                            style={{ accentColor: 'var(--brand)' }}
                          />
                          ¿Entrega un auto usado como parte de pago?
                        </label>
                      </div>

                      {hasUsado && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ marginTop: 12, overflow: 'hidden' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>Valor estimado del usado:</span>
                            <input
                              type="text"
                              value={valorUsado ? `$ ${valorUsado.toLocaleString('es-AR')}` : ''}
                              onChange={e => {
                                const val = Number(e.target.value.replace(/\D/g, ''));
                                if (val <= vehicle.precio_ars) setValorUsado(val);
                              }}
                              style={{
                                width: 140, padding: '4px 8px', textAlign: 'right',
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 3, fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)',
                                outline: 'none',
                              }}
                            />
                          </div>
                          <p style={{ fontSize: 9, color: 'var(--fg-tertiary)', textAlign: 'right' }}>
                            Tipee el valor de cotización de su vehículo actual.
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Plazo Selection */}
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--fg-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plazo de Cuotas</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {plazos.map(p => (
                          <button
                            key={p.meses}
                            onClick={() => setPlazoMeses(p.meses)}
                            style={{
                              flex: 1, padding: '8px', borderRadius: 3,
                              background: plazoMeses === p.meses ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                              border: `1px solid ${plazoMeses === p.meses ? 'var(--brand-border)' : 'var(--border)'}`,
                              color: plazoMeses === p.meses ? 'var(--brand)' : 'var(--fg-secondary)',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {p.meses} Meses
                            <span style={{ display: 'block', fontSize: 9, fontWeight: 400, color: 'var(--fg-tertiary)', marginTop: 2 }}>
                              TNA {(p.tna * 100)}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulation Result */}
                    <div style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 4, padding: '14px', marginTop: 6,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--fg-secondary)' }}>
                        <span>Total de entrega (efectivo + usado):</span>
                        <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{formatARS(totalEntregado)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: 'var(--fg-secondary)' }}>
                        <span>Saldo a financiar:</span>
                        <span>{formatARS(saldoAFinanciar)}</span>
                      </div>
                      
                      <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: 9, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                            Cuota Mensual Estimada
                          </p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--fg-primary)', letterSpacing: '-0.02em', marginTop: 2 }}>
                            {cuotaMensual > 0 ? formatARS(cuotaMensual) : '$ 0'}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 2,
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>
                          Tasa Fija
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom CTAs */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-card)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Valor al contado</span>
                  <strong style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--fg-primary)' }}>
                    {formatARS(vehicle.precio_ars)}
                  </strong>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReservar}
                    style={{
                      flex: 1, padding: '12px',
                      background: 'var(--brand)', color: '#fff',
                      border: 'none', borderRadius: 3,
                      fontSize: 12, fontWeight: 800,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 0 20px var(--brand-glow)',
                    }}
                  >
                    <CreditCard size={14} /> Reservar unidad
                  </motion.button>
                  <a
                    href={`https://wa.me/5491122334455?text=Hola,%20quisiera%20consultar%20por%20la%20unidad%20${vehicle.brand}%20${vehicle.model}%20${vehicle.version}%20(${vehicle.year})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)', color: 'var(--fg-secondary)',
                      border: '1px solid var(--border)', borderRadius: 3,
                      fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <Send size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
