'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Car, FileText, Users, LogOut,
  Shield, TrendingUp, Settings
} from 'lucide-react'
import { MOCK_USER } from '@/types/admin'

const NAV = [
  { href: '/admin/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/vehiculos',      label: 'Vehículos',      icon: Car },
  { href: '/admin/transferencias', label: 'Transferencias', icon: FileText },
  { href: '/admin/clientes',       label: 'Clientes',       icon: Users },
  { href: '/admin/configuracion',  label: 'Configuración',  icon: Settings },
]

const ROL_LABEL: Record<string, string> = {
  role_admin:    'Administrador',
  role_ventas:   'Ventas',
  role_gestoria: 'Gestoría',
}

const ROL_COLOR: Record<string, string> = {
  role_admin:    '#e02232',
  role_ventas:   '#f59e0b',
  role_gestoria: '#4f8ef7',
}

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Shield size={16} style={{ color: 'var(--brand)' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}>
            AUTO<span style={{ color: 'var(--brand)' }}>YA</span>
            <span style={{ color: 'var(--fg-tertiary)', fontSize: 10, fontWeight: 400, marginLeft: 6, letterSpacing: '0.1em' }}>
              ADMIN
            </span>
          </span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Intranet Administrativa
        </p>
      </div>

      {/* User info */}
      <div style={{
        padding: '14px 16px',
        margin: '12px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--brand-dim)',
            border: '1px solid var(--brand-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--brand)',
            flexShrink: 0,
          }}>
            {MOCK_USER.nombre.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {MOCK_USER.nombre}
            </p>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: ROL_COLOR[MOCK_USER.rol],
            }}>
              {ROL_LABEL[MOCK_USER.rol]}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: 2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 4,
                  background: isActive ? 'var(--brand-dim)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--brand-border)' : 'transparent'}`,
                  color: isActive ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={15} style={{ color: isActive ? 'var(--brand)' : 'inherit', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && (
                  <div style={{
                    marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%',
                    background: 'var(--brand)',
                  }} />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px',
            color: 'var(--fg-secondary)',
            fontSize: 13,
            cursor: 'pointer',
            borderRadius: 4,
          }}>
            <TrendingUp size={14} /> Ver sitio público
          </div>
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px',
          color: 'var(--fg-tertiary)',
          fontSize: 13,
          cursor: 'pointer',
          borderRadius: 4,
        }}>
          <LogOut size={14} /> Cerrar sesión
        </div>
      </div>
    </aside>
  )
}
