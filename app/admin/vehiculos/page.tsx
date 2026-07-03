'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Eye, Car } from 'lucide-react'
import { VEHICLES, type Vehicle } from '@/data/vehicles'
import { formatARS } from '@/utils/currency'
import VehicleEditModal from '@/components/admin/VehicleEditModal'

const ESTADO_COLORS = {
  disponible: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22c55e' },
  reservado:  { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  vendido:    { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', color: '#6b7280' },
}

export default function VehiculosPage() {
  const [search, setSearch] = useState('')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado de edición/creación de vehículo
  // undefined = cerrado, null = creando nuevo, Vehicle = editando
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null | undefined>(undefined)

  const loadVehicles = () => {
    setLoading(true)
    fetch('/api/vehiculos')
      .then(res => res.json())
      .then(data => {
        setVehicles(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('[Admin Inventario] Error al cargar vehículos:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const filtered = vehicles.filter(v =>
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)', fontSize: 13 }}>
        Cargando inventario de vehículos...
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Inventario <span style={{ color: 'var(--brand)' }}>Vehículos</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 3 }}>
            {filtered.length} vehículos en stock
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 3, padding: '8px 12px',
          }}>
            <Search size={13} style={{ color: 'var(--fg-tertiary)' }} />
            <input
              type="text" placeholder="Buscar..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', fontSize: 13, color: 'var(--fg-primary)', border: 'none', outline: 'none', width: 160 }}
            />
          </div>
          <button
            onClick={() => setSelectedVehicle(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 3,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Nuevo vehículo
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Vehículo', 'Tipo / Comb.', 'Condición', 'Precio ARS', 'Estado', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: 'var(--fg-tertiary)',
                    background: 'var(--bg-surface)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => {
                const estado = v.estado || 'disponible'
                const ec = ESTADO_COLORS[estado]
                return (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 3,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Car size={16} style={{ color: 'var(--fg-tertiary)' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)' }}>
                            {v.brand} {v.model}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--fg-tertiary)' }}>{v.version} · {v.year}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--fg-secondary)' }}>
                      {v.body_type} / {v.fuel_type}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 2,
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                        background: v.condition === '0km' ? 'var(--brand-dim)' : 'rgba(107,114,128,0.1)',
                        border: `1px solid ${v.condition === '0km' ? 'var(--brand-border)' : 'rgba(107,114,128,0.3)'}`,
                        color: v.condition === '0km' ? 'var(--brand)' : 'var(--fg-secondary)',
                      }}>
                        {v.condition}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--fg-primary)' }}>
                      {formatARS(v.precio_ars)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 2,
                        fontSize: 10, fontWeight: 600,
                        background: ec.bg, border: `1px solid ${ec.border}`, color: ec.color,
                      }}>
                        {estado}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {/* Ver Sitio Público */}
                        <button
                          onClick={() => window.open('/', '_blank')}
                          title="Ver en catálogo"
                          style={{
                            width: 28, height: 28, borderRadius: 3,
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--fg-secondary)',
                          }}
                        >
                          <Eye size={12} />
                        </button>

                        {/* Editar Vehículo */}
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          title="Editar especificaciones"
                          style={{
                            width: 28, height: 28, borderRadius: 3,
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--fg-secondary)',
                          }}
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor/Creador Modal */}
      {selectedVehicle !== undefined && (
        <VehicleEditModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(undefined)}
          onSave={() => loadVehicles()}
        />
      )}
    </div>
  )
}
