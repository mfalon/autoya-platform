'use client'

import { motion } from 'framer-motion'
import { CreditCard, Zap, Shield } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import { SENA_ARS } from '@/services/mercadopago'
import type { Vehicle } from '@/data/vehicles'

interface SenaButtonProps {
  vehicle: Vehicle
  mensaje: string
  onReservar: (vehicle: Vehicle) => void
}

export default function SenaButton({ vehicle, mensaje, onReservar }: SenaButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(135deg, rgba(224,34,50,0.15), rgba(224,34,50,0.05))',
        border: '1px solid var(--brand-border)',
        borderRadius: 6,
        padding: '16px',
        marginTop: 4,
        boxShadow: '0 0 30px var(--brand-glow)',
      }}
    >
      {/* Vehicle summary */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, paddingBottom: 12,
        borderBottom: '1px solid var(--brand-border)',
      }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {vehicle.brand}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {vehicle.model} {vehicle.year}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seña</p>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
            color: 'var(--brand)', letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {formatARS(SENA_ARS)}
          </p>
        </div>
      </div>

      {/* Urgency badges */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { icon: <Zap size={9} />, text: '🔥 Oportunidad única' },
          { icon: <Shield size={9} />, text: 'Bloqueo 48hs' },
        ].map(({ icon, text }) => (
          <span key={text} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600,
            padding: '3px 9px',
            background: 'rgba(224,34,50,0.1)',
            border: '1px solid rgba(224,34,50,0.2)',
            borderRadius: 2,
            color: 'var(--brand)',
          }}>
            {icon} {text}
          </span>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 0 40px var(--brand-glow)' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onReservar(vehicle)}
        style={{
          width: '100%',
          padding: '14px',
          background: 'var(--brand)',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 0 24px var(--brand-glow)',
          fontFamily: 'var(--font-display)',
        }}
      >
        <CreditCard size={16} />
        💳 Señar Vehículo Ahora
      </motion.button>

      <p style={{
        fontSize: 10, color: 'var(--fg-tertiary)', textAlign: 'center', marginTop: 8,
        lineHeight: 1.5,
      }}>
        Pago seguro via MercadoPago · El auto queda bloqueado para vos 48hs
      </p>
    </motion.div>
  )
}
