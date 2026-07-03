'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, Check, Clock, AlertTriangle, FileText, Smartphone, Calendar, Search } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import type { Tramite } from '@/types/admin'

interface WhatsappLog {
  id: string
  nombre: string
  telefono: string
  mensaje: string
  fecha: string
  estado: string
}

export default function ClientesPage() {
  const [loading, setLoading] = useState(true)
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [logs, setLogs] = useState<WhatsappLog[]>([])
  
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  
  // Control de envío de recordatorios
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sentId, setSentId] = useState<string | null>(null)

  // Carga inicial de datos
  const loadData = async () => {
    try {
      const [tramitesRes, logsRes] = await Promise.all([
        fetch('/api/tramites'),
        fetch('/api/whatsapp')
      ])

      const tramitesData = await tramitesRes.json()
      const logsData = await logsRes.json()

      setTramites(tramitesData)
      setLogs(logsData)
    } catch (err) {
      console.error('Error al cargar datos del portal de clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar los trámites que son checkout abandonados (estado 'reserva')
  const abandonos = useMemo(() => {
    return tramites.filter(t => {
      const isReserva = t.estado === 'reserva'
      const matchesSearch = t.comprador_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.comprador_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.vehiculo_model.toLowerCase().includes(searchTerm.toLowerCase())
      return isReserva && matchesSearch
    })
  }, [tramites, searchTerm])

  const handleSendReminder = async (tramite: Tramite) => {
    setSendingId(tramite.id)
    setSentId(null)

    // Simulamos un teléfono móvil o usamos uno de prueba
    const fakePhone = '+54 9 11 2233-4455'

    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compradorNombre: tramite.comprador_nombre,
          compradorTelefono: fakePhone,
          vehiculoModelo: `${tramite.vehiculo_brand} ${tramite.vehiculo_model}`,
          precioARS: tramite.precio_ars,
        }),
      })

      if (response.ok) {
        setSentId(tramite.id)
        setTimeout(() => setSentId(null), 3000)
        // Recargamos los logs para mostrar la notificación en la bandeja
        const logsRes = await fetch('/api/whatsapp')
        const logsData = await logsRes.json()
        setLogs(logsData)
      } else {
        alert('Error al enviar el recordatorio')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión')
    } finally {
      setSendingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)', fontSize: 13 }}>
        Cargando centro de leads y notificaciones...
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-base)', padding: '36px 40px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand)' }}>
          <Users size={18} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Gestión Omnicanal</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg-primary)' }}>
          Recuperación de Leads & WhatsApp
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fg-secondary)', marginTop: 4 }}>
          Monitoree carritos abandonados con seña pendiente y despache recordatorios automáticos formateados bajo los estándares formales del Asesor Premium.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }} className="flex-col lg:grid">
        
        {/* Left Column: Checkout Abandonados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-primary)' }}>
                  Reservas Pendientes de Pago
                </h3>
                <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 2 }}>
                  Clientes que iniciaron checkout de seña de unidad pero no completaron la transacción.
                </p>
              </div>

              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 3, padding: '6px 12px', width: 220,
              }}>
                <Search size={12} style={{ color: 'var(--fg-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Buscar lead..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ flex: 1, fontSize: 12, background: 'transparent', border: 'none', color: 'var(--fg-primary)', outline: 'none' }}
                />
              </div>
            </div>

            {abandonos.length === 0 ? (
              <div style={{
                padding: '48px 0', border: '1px dashed var(--border)', borderRadius: 3,
                textAlign: 'center', color: 'var(--fg-tertiary)', fontSize: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <AlertTriangle size={24} />
                <span>No hay leads con reservas pendientes en este momento.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--fg-tertiary)' }}>
                      <th style={{ padding: '10px 8px', fontWeight: 600 }}>Comprador</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600 }}>Unidad Reservada</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600 }}>Monto Seña</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abandonos.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-[var(--bg-elevated)]">
                        <td style={{ padding: '12px 8px' }}>
                          <p style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{t.comprador_nombre}</p>
                          <span style={{ fontSize: 10, color: 'var(--fg-tertiary)' }}>{t.comprador_email}</span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <p style={{ color: 'var(--fg-secondary)' }}>{t.vehiculo_brand} {t.vehiculo_model}</p>
                          <span style={{ fontSize: 10, color: 'var(--fg-tertiary)' }}>Año {t.vehiculo_year}</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--fg-primary)' }}>
                          {formatARS(t.precio_ars)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleSendReminder(t)}
                            disabled={sendingId === t.id}
                            style={{
                              padding: '6px 12px',
                              background: sentId === t.id ? 'rgba(34,197,94,0.1)' : 'var(--bg-elevated)',
                              border: `1px solid ${sentId === t.id ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                              color: sentId === t.id ? '#22c55e' : 'var(--fg-primary)',
                              borderRadius: 2, fontSize: 10, fontWeight: 700,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              cursor: sendingId === t.id ? 'default' : 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            {sendingId === t.id ? (
                              'Enviando...'
                            ) : sentId === t.id ? (
                              <>
                                <Check size={12} /> Enviado
                              </>
                            ) : (
                              <>
                                <Send size={11} /> WhatsApp
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outbox Logs (WhatsApp logs) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '24px 28px',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-primary)' }}>
                Bandeja de Salida (Outbox)
              </h3>
              <p style={{ fontSize: 11, color: 'var(--fg-tertiary)', marginTop: 2 }}>
                Registro de notificaciones enviadas de manera real o simulada.
              </p>
            </div>

            <div style={{ height: 1, background: 'var(--border)' }} />

            <div style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              maxHeight: 380, overflowY: 'auto',
            }}>
              {logs.length === 0 ? (
                <div style={{
                  padding: '24px 0', textAlign: 'center', color: 'var(--fg-tertiary)', fontSize: 11,
                  fontStyle: 'italic',
                }}>
                  Sin notificaciones registradas.
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 12, color: 'var(--fg-primary)' }}>{log.nombre}</strong>
                      <span style={{ fontSize: 9, color: 'var(--fg-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={10} /> {new Date(log.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                      </span>
                    </div>

                    <p style={{
                      fontSize: 10, color: 'var(--fg-secondary)',
                      whiteSpace: 'pre-wrap', lineHeight: 1.5,
                      background: 'var(--bg-elevated)', padding: '8px 10px',
                      borderRadius: 3, border: '1px solid var(--border)',
                    }}>
                      {log.mensaje}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
                      <span style={{ color: 'var(--fg-tertiary)' }}>Destinatario: {log.telefono}</span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '2px 6px', borderRadius: 2,
                        background: log.estado === 'simulado' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                        border: `1px solid ${log.estado === 'simulado' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                        color: log.estado === 'simulado' ? '#f59e0b' : '#22c55e',
                      }}>
                        {log.estado}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
