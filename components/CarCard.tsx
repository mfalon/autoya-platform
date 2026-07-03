'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, Gauge, MapPin, ArrowRight, Percent } from 'lucide-react';
import { formatARS } from '@/utils/currency';
import type { Vehicle } from '@/data/vehicles';

interface CarCardProps {
  vehicle: Vehicle;
  index?: number;
  onSelect?: (vehicle: Vehicle) => void;
  onSimulate?: (vehicle: Vehicle) => void;
}

export default function CarCard({ vehicle, index = 0, onSelect, onSimulate }: CarCardProps) {
  const isNew = vehicle.condition === '0km';

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect?.(vehicle)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      className="group hover:border-[var(--brand-border)] hover:shadow-[0_0_30px_var(--brand-glow)]"
    >
      {/* ── Top accent line ── */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--brand), transparent)',
          transformOrigin: 'left',
          zIndex: 10,
        }}
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* ── Image section ── */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
        <motion.img
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,12,17,0.95) 0%, rgba(11,12,17,0.2) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Condition badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '3px 10px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          background: isNew ? 'var(--brand)' : 'rgba(15,16,20,0.85)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          border: isNew ? 'none' : '1px solid var(--border-strong)',
          borderRadius: 2,
        }}>
          {vehicle.condition}
        </div>

        {/* Km badge — usado */}
        {!isNew && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(15,16,20,0.85)',
            color: 'var(--fg-secondary)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: 2,
          }}>
            <MapPin size={9} />
            {vehicle.km.toLocaleString('es-AR')} km
          </div>
        )}

        {/* Brand watermark bottom-left */}
        <div style={{
          position: 'absolute', bottom: 10, left: 14,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--brand)',
          fontFamily: 'var(--font-display)',
        }}>
          {vehicle.brand}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

        {/* Model + version */}
        <div>
          <h3 className="font-display" style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--fg-primary)',
            fontFamily: 'var(--font-display)',
          }}>
            {vehicle.model}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 4, letterSpacing: '0.01em' }}>
            {vehicle.version} · {vehicle.year}
          </p>
        </div>

        {/* Specs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { icon: <Zap size={10} />, label: 'Potencia', value: `${vehicle.specs.power_cv} CV` },
            { icon: <Clock size={10} />, label: '0–100', value: vehicle.specs.acceleration },
            { icon: <Gauge size={10} />, label: 'Vel. Máx.', value: vehicle.specs.top_speed },
            { icon: null, label: 'Combustible', value: vehicle.fuel_type },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              padding: '7px 10px',
            }}>
              <p style={{ fontSize: 9, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                {icon}{label}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
        }}>
          <div>
            <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
              Precio
            </p>
            <p className="font-display" style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--fg-primary)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
            }}>
              {formatARS(vehicle.precio_ars)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {onSimulate && (
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(224,34,50,0.1)' }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSimulate(vehicle);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34,
                  background: 'none',
                  border: '1px solid var(--brand-border)',
                  color: 'var(--brand)',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
                title="Simular Financiación en Cuotas"
              >
                <Percent size={14} />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: 'var(--brand-hover)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px',
                background: 'var(--brand)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              Ver más <ArrowRight size={12} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
