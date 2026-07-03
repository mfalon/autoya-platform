'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Shield, CheckCircle2, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import { SENA_ARS } from '@/services/mercadopago'
import type { Vehicle } from '@/data/vehicles'

interface ReservaModalProps {
  vehicle: Vehicle
  onClose: () => void
}

type Step = 'form' | 'loading' | 'success' | 'error'

export default function ReservaModal({ vehicle, onClose }: ReservaModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [nombre, setNombre] = useState('')
  const [email, setEmail]   = useState('')
  const [dni, setDni]       = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [isMock, setIsMock] = useState(false)
  const [error, setError]   = useState('')

  const handleReservar = async () => {
    if (!nombre.trim() || !email.trim() || !dni.trim()) return
    setStep('loading')
    setError('')

    try {
      const res = await fetch('/api/reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: vehicle.id, comprador: { nombre, email, dni } }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) throw new Error(data.error ?? 'Error desconocido')

      setPaymentUrl(data.paymentUrl)
      setIsMock(data.isMock)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando la reserva')
      setStep('error')
    }
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
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            width: '100%', maxWidth: 440,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CreditCard size={16} style={{ color: 'var(--brand)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>
                Reservar vehículo
              </span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-tertiary)', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Vehicle summary */}
          <div style={{
            padding: '14px 20px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {vehicle.brand}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {vehicle.model} {vehicle.version}
              </p>
              <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 2 }}>
                Precio: {formatARS(vehicle.precio_ars)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seña</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.02em' }}>
                {formatARS(SENA_ARS)}
              </p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px' }}>
            {step === 'form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 12, color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
                  Completá tus datos para reservar este vehículo. El pago de la seña bloquea el auto por <strong style={{ color: 'var(--fg-primary)' }}>48 horas</strong>.
                </p>

                {[
                  { label: 'Nombre completo', value: nombre, set: setNombre, placeholder: 'Juan Pérez', type: 'text' },
                  { label: 'Email', value: email, set: setEmail, placeholder: 'juan@gmail.com', type: 'email' },
                  { label: 'DNI', value: dni, set: setDni, placeholder: '28456789', type: 'text' },
                ].map(({ label, value, set, placeholder, type }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 3,
                        fontSize: 13, color: 'var(--fg-primary)',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--brand-border)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                ))}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px',
                  background: 'var(--ai-dim)',
                  border: '1px solid var(--ai-border)',
                  borderRadius: 3,
                  fontSize: 11, color: 'var(--ai)',
                }}>
                  <Shield size={12} />
                  Pago seguro procesado por MercadoPago. Podés pagar con tarjeta, débito o saldo MP.
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReservar}
                  disabled={!nombre || !email || !dni}
                  style={{
                    padding: '12px',
                    background: nombre && email && dni ? 'var(--brand)' : 'var(--bg-card)',
                    color: nombre && email && dni ? '#fff' : 'var(--fg-tertiary)',
                    border: `1px solid ${nombre && email && dni ? 'transparent' : 'var(--border)'}`,
                    borderRadius: 3,
                    fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    cursor: nombre && email && dni ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <CreditCard size={14} /> Pagar seña · {formatARS(SENA_ARS)}
                </motion.button>
              </div>
            )}

            {step === 'loading' && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Loader2 size={32} style={{ color: 'var(--brand)', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--fg-secondary)', fontSize: 13 }}>Creando tu reserva...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={40} style={{ color: '#22c55e', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  ¡Reserva creada!
                </p>
                <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                  {isMock
                    ? '(Modo demo — configurá las credenciales de MercadoPago para pagos reales)'
                    : `Tenés 48 horas para completar el pago de ${formatARS(SENA_ARS)} y asegurar el auto.`}
                </p>
                {isMock && (
                  <div style={{
                    padding: '10px 12px', marginBottom: 16,
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 3, fontSize: 11, color: '#f59e0b',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <AlertCircle size={12} />
                    Modo sandbox activo. Agregá MP_ACCESS_TOKEN al .env.local para producción.
                  </div>
                )}
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 24px',
                    background: '#009ee3', color: '#fff',  // color oficial de MercadoPago
                    borderRadius: 3,
                    fontSize: 13, fontWeight: 700,
                    textDecoration: 'none',
                    letterSpacing: '0.03em',
                  }}
                >
                  Ir a MercadoPago <ExternalLink size={14} />
                </a>
              </div>
            )}

            {step === 'error' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <AlertCircle size={36} style={{ color: 'var(--brand)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Algo salió mal</p>
                <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginBottom: 16 }}>{error}</p>
                <button
                  onClick={() => setStep('form')}
                  style={{
                    padding: '9px 20px',
                    background: 'var(--brand)', color: '#fff',
                    border: 'none', borderRadius: 3,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
