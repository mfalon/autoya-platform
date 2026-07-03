'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText, User, CheckCircle2, Clock, AlertCircle, GripVertical, Eye, Upload } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import { MOCK_TRAMITES, type Tramite, type EstadoTramite } from '@/types/admin'
import GestoriaDetailModal from '@/components/admin/GestoriaDetailModal'

const COLUMNS: { id: EstadoTramite; label: string; color: string; icon: React.ElementType }[] = [
  { id: 'reserva',      label: 'Reserva Pagada',   color: '#f59e0b', icon: Clock },
  { id: 'validacion',   label: 'Validación DNI',   color: '#4f8ef7', icon: User },
  { id: 'formulario08', label: '08 Digital (TAD)', color: '#e02232', icon: AlertCircle },
  { id: 'finalizado',   label: 'Finalizado',       color: '#22c55e', icon: CheckCircle2 },
]

function TramiteCard({ tramite, isDragging = false, onVer }: { tramite: Tramite; isDragging?: boolean; onVer?: (t: Tramite) => void }) {
  return (
    <div style={{
      background: isDragging ? 'var(--bg-elevated)' : 'var(--bg-card)',
      border: `1px solid ${isDragging ? 'var(--brand-border)' : 'var(--border)'}`,
      borderRadius: 4,
      padding: '12px 14px',
      cursor: 'grab',
      boxShadow: isDragging ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      opacity: isDragging ? 0.95 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <GripVertical size={13} style={{ color: 'var(--fg-tertiary)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 2 }}>
            {tramite.comprador_nombre}
          </p>
          <p style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>
            {tramite.vehiculo_brand} {tramite.vehiculo_model}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 8, borderTop: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)',
        }}>
          {formatARS(tramite.precio_ars)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {tramite.dni_procesado && (
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 6px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e', borderRadius: 2,
            }}>
              DNI ✓
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onVer?.(tramite)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--fg-secondary)',
              borderRadius: 2, cursor: 'pointer',
            }}
          >
            <Eye size={10} /> Ver
          </button>
        </div>
      </div>

      {tramite.notas && (
        <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginTop: 8, fontStyle: 'italic' }}>
          {tramite.notas}
        </p>
      )}
    </div>
  )
}

function SortableCard({ tramite, onVer }: { tramite: Tramite; onVer?: (t: Tramite) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tramite.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }}
      {...attributes}
      {...listeners}
    >
      <TramiteCard tramite={tramite} onVer={onVer} />
    </div>
  )
}

export default function TransferenciasPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedTramite, setSelectedTramite] = useState<Tramite | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  // Cargar trámites desde la base de datos
  useEffect(() => {
    fetch('/api/tramites')
      .then(res => res.json())
      .then(data => {
        setTramites(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('[Kanban] Error al cargar trámites:', err)
        setLoading(false)
      })
  }, [])

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(active.id as string)

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return
    const overId = over.id as string
    const colIds = COLUMNS.map(c => c.id)
    if (colIds.includes(overId as EstadoTramite)) {
      const targetTramite = tramites.find(t => t.id === active.id)
      if (!targetTramite) return

      const estadoAnterior = targetTramite.estado
      const estadoNuevo = overId as EstadoTramite

      if (estadoAnterior === estadoNuevo) return

      // 1. Actualización optimista local
      setTramites(prev => prev.map(t =>
        t.id === active.id ? { ...t, estado: estadoNuevo } : t
      ))

      // 2. Persistencia en la base de datos
      try {
        const response = await fetch('/api/tramites', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: active.id, estado: estadoNuevo }),
        })

        if (response.ok) {
          // Registrar en auditoría
          let userName = 'Gestoría'
          let userRole = 'role_gestoria'
          
          if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('autoya_user')
            if (userStr) {
              const u = JSON.parse(userStr)
              userName = u.name
              userRole = u.role
            }
          }

          const labelAnterior = COLUMNS.find(c => c.id === estadoAnterior)?.label || estadoAnterior
          const labelNuevo = COLUMNS.find(c => c.id === estadoNuevo)?.label || estadoNuevo

          fetch('/api/auditoria/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario: userName,
              rol: userRole,
              accion: 'Cambio de Estado en Kanban',
              detalles: `Movió el trámite de ${targetTramite.comprador_nombre} (Auto: ${targetTramite.vehiculo_brand} ${targetTramite.vehiculo_model}) desde '${labelAnterior}' hacia '${labelNuevo}'`
            })
          }).catch(err => console.error('[Kanban Audit Error]', err))
        }
      } catch (err) {
        console.error('[Kanban] Error al actualizar estado del trámite:', err)
      }
    }
  }

  const activeTramite = tramites.find(t => t.id === activeId)

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
            Transferencias <span style={{ color: 'var(--brand)' }}>DNRPA</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 3 }}>
            {tramites.filter(t => t.estado !== 'finalizado').length} trámites activos · Arrastrá las tarjetas para avanzar el estado
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 16px',
          background: 'var(--brand)', color: '#fff',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          border: 'none', borderRadius: 3, cursor: 'pointer',
        }}>
          <Upload size={12} /> Nuevo trámite
        </button>
      </div>

      {/* Kanban */}
      <div style={{ flex: 1, overflowX: 'auto', padding: '20px 24px' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)', fontSize: 13 }}>
            Cargando tablero Kanban...
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 16, height: '100%', minWidth: 900 }}>
            {COLUMNS.map(col => {
              const colTramites = tramites.filter(t => t.estado === col.id)
              const ColIcon = col.icon
              return (
                <div
                  key={col.id}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Column header */}
                  <div style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border)',
                    borderTop: `3px solid ${col.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <ColIcon size={13} style={{ color: col.color }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)' }}>
                        {col.label}
                      </span>
                    </div>
                    <span style={{
                      minWidth: 20, height: 20,
                      background: `${col.color}20`,
                      border: `1px solid ${col.color}40`,
                      borderRadius: 10,
                      fontSize: 10, fontWeight: 700,
                      color: col.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 6px',
                    }}>
                      {colTramites.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div
                    id={col.id}
                    style={{
                      flex: 1, overflowY: 'auto',
                      padding: '10px',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                  >
                    <SortableContext
                      items={colTramites.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence>
                        {colTramites.map(t => (
                          <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SortableCard tramite={t} onVer={setSelectedTramite} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>

                    {colTramites.length === 0 && (
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minHeight: 80,
                        border: '1px dashed var(--border)',
                        borderRadius: 4,
                        color: 'var(--fg-tertiary)', fontSize: 11,
                      }}>
                        Sin trámites
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeTramite && <TramiteCard tramite={activeTramite} isDragging />}
          </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Gestoria Dossier Details Modal */}
      {selectedTramite && (
        <GestoriaDetailModal
          tramite={selectedTramite}
          onClose={() => setSelectedTramite(null)}
          onUpdate={(updated) => {
            // Actualizar la tarjeta localmente en el Kanban de inmediato
            setTramites(prev => prev.map(t => t.id === updated.id ? updated : t))
            setSelectedTramite(updated)
          }}
        />
      )}
    </div>
  )
}
