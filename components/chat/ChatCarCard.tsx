'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap, Clock, Fuel } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import type { Vehicle } from '@/data/vehicles'

interface ChatCarCardProps {
  vehicle: Vehicle
  onReservar: (vehicle: Vehicle) => void
}

export default function ChatCarCard({ vehicle, onReservar }: ChatCarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 4,
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, var(--brand), transparent)' }} />

      {/* Image */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <img
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,12,17,0.95) 0%, transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 8, left: 12,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--brand)',
        }}>
          {vehicle.brand}
        </div>
        <span style={{
          position: 'absolute', top: 8, left: 8,
          padding: '2px 8px', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          background: vehicle.condition === '0km' ? 'var(--brand)' : 'rgba(0,0,0,0.7)',
          color: '#fff', borderRadius: 2,
        }}>
          {vehicle.condition}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--fg-primary)', marginBottom: 2,
        }}>
          {vehicle.model}
        </h3>
        <p style={{ fontSize: 11, color: 'var(--fg-secondary)', marginBottom: 10 }}>
          {vehicle.version} · {vehicle.year}
        </p>

        {/* Mini specs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[
            { icon: <Zap size={9} />, val: `${vehicle.specs.power_cv}cv` },
            { icon: <Clock size={9} />, val: vehicle.specs.acceleration },
            { icon: <Fuel size={9} />, val: vehicle.fuel_type },
          ].map(({ icon, val }) => (
            <span key={val} style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '3px 7px', fontSize: 10, fontWeight: 500,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 2, color: 'var(--fg-secondary)',
            }}>
              {icon} {val}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>
              Precio
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--fg-primary)', lineHeight: 1,
            }}>
              {formatARS(vehicle.precio_ars)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onReservar(vehicle)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px',
              background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 3,
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 0 16px var(--brand-glow)',
            }}
          >
            Señar <ArrowRight size={11} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
