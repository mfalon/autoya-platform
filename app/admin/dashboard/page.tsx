'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Car, FileText, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import Link from 'next/link'
import type { Vehicle } from '@/data/vehicles'
import type { Tramite } from '@/types/admin'

const ESTADO_CONFIG = {
  reserva:      { label: 'Reserva Pagada',    color: '#f59e0b', icon: Clock },
  validacion:   { label: 'Validación DNI',    color: 'var(--ai)', icon: Users },
  formulario08: { label: '08 Digital (TAD)',  color: 'var(--brand)', icon: AlertCircle },
  finalizado:   { label: 'Finalizado',        color: '#22c55e', icon: CheckCircle2 },
}

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar estadísticas y datos del Dashboard
  useEffect(() => {
    Promise.all([
      fetch('/api/vehiculos').then(res => res.json()),
      fetch('/api/tramites').then(res => res.json())
    ])
      .then(([vehiclesData, tramitesData]) => {
        setVehicles(vehiclesData)
        setTramites(tramitesData)
        setLoading(false)
      })
      .catch(err => {
        console.error('[Dashboard API] Error al cargar estadísticas:', err)
        setLoading(false)
      })
  }, [])

  // Cómputo dinámico de KPI stats
  const totalVehiculos = vehicles.length
  const nuevos = vehicles.filter(v => v.condition === '0km').length
  const usados = vehicles.filter(v => v.condition === 'Usado').length
  
  const tramitesActivos = tramites.filter(t => t.estado !== 'finalizado').length
  const tramitesFinalizados = tramites.filter(t => t.estado === 'finalizado').length
  
  const totalInventarioValor = vehicles.reduce((acc, v) => acc + Number(v.precio_ars), 0)

  const stats = [
    {
      label: 'Autos en Stock',
      value: totalVehiculos,
      sub: `${nuevos} nuevos · ${usados} usados`,
      icon: Car,
      color: 'var(--brand)',
      colorDim: 'var(--brand-dim)',
      colorBorder: 'var(--brand-border)',
    },
    {
      label: 'Trámites Activos',
      value: tramitesActivos,
      sub: 'En proceso de transferencia',
      icon: FileText,
      color: 'var(--ai)',
      colorDim: 'var(--ai-dim)',
      colorBorder: 'var(--ai-border)',
    },
    {
      label: 'Finalizados (mes)',
      value: tramitesFinalizados,
      sub: 'Transferencias completadas',
      icon: CheckCircle2,
      color: '#22c55e',
      colorDim: 'rgba(34,197,94,0.1)',
      colorBorder: 'rgba(34,197,94,0.25)',
    },
    {
      label: 'Valor en Stock',
      value: null,
      valueStr: formatARS(totalInventarioValor),
      sub: 'Total inventario en ARS',
      icon: TrendingUp,
      color: '#f59e0b',
      colorDim: 'rgba(245,158,11,0.1)',
      colorBorder: 'rgba(245,158,11,0.25)',
    },
  ]

  const recientes = [...tramites]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)', fontSize: 13 }}>
        Cargando estadísticas del Dashboard...
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--fg-primary)',
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 4 }}>
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }} className="flex-col md:grid">
        {stats.map(({ label, value, valueStr, sub, icon: Icon, color, colorDim, colorBorder }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: 'var(--fg-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                {label}
              </p>
              <div style={{
                width: 32, height: 32, borderRadius: 4,
                background: colorDim, border: `1px solid ${colorBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: valueStr ? 18 : 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--fg-primary)',
              lineHeight: 1,
            }}>
              {valueStr ?? value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 6 }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Trámites recientes */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>
            Trámites Recientes
          </h2>
          <Link href="/admin/transferencias" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 12, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Ver Kanban <ArrowUpRight size={12} />
            </span>
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--fg-tertiary)', fontSize: 12 }}>
            No hay trámites registrados recientemente.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Comprador', 'Vehículo', 'Precio', 'Estado', 'Fecha'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--fg-tertiary)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recientes.map((t, i) => {
                const cfg = ESTADO_CONFIG[t.estado]
                const StatusIcon = cfg.icon
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    style={{
                      borderBottom: i < recientes.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>{t.comprador_nombre}</p>
                      <p style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>{t.comprador_dni}</p>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--fg-secondary)' }}>
                      {t.vehiculo_brand} {t.vehiculo_model} {t.vehiculo_year}
                    </td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>
                      {formatARS(t.precio_ars)}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px',
                        fontSize: 10, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: `${cfg.color}15`,
                        border: `1px solid ${cfg.color}40`,
                        borderRadius: 2,
                        color: cfg.color,
                      }}>
                        <StatusIcon size={9} /> {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 11, color: 'var(--fg-tertiary)' }}>
                      {new Date(t.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
