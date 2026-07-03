'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Car, FileText, Users, LogOut,
  Shield, TrendingUp, Settings, DollarSign, ShieldAlert
} from 'lucide-react'

const NAV = [
  { href: '/admin/dashboard',      label: 'Dashboard',      icon: LayoutDashboard,      roles: ['role_admin', 'role_ventas', 'role_gestoria'] },
  { href: '/admin/vehiculos',      label: 'Vehículos',      icon: Car,                  roles: ['role_admin', 'role_ventas'] },
  { href: '/admin/transferencias', label: 'Transferencias', icon: FileText,             roles: ['role_admin', 'role_gestoria'] },
  { href: '/admin/clientes',       label: 'Clientes',       icon: Users,                roles: ['role_admin', 'role_ventas'] },
  { href: '/admin/configuracion',  label: 'Configuración',  icon: Settings,             roles: ['role_admin'] },
  { href: '/admin/precios',        label: 'Precios ACARA',  icon: DollarSign,           roles: ['role_admin', 'role_ventas'] },
  { href: '/admin/auditoria',      label: 'Auditoría Intranet', icon: ShieldAlert,       roles: ['role_admin'] },
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
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; role: string; name: string } | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('autoya_user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('autoya_user')
    router.push('/admin/login')
  }

  // Si no ha cargado la sesión, mostramos esqueleto o valores seguros
  const userName = user?.name || 'Cargando...'
  const userRole = user?.role || 'role_admin'

  // Filtrar links de navegación según el rol
  const allowedNav = NAV.filter(item => item.roles.includes(userRole))

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
            {userName.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {userName}
            </p>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: ROL_COLOR[userRole],
            }}>
              {ROL_LABEL[userRole]}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {allowedNav.map(({ href, label, icon: Icon }) => {
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
        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px',
            color: 'var(--fg-tertiary)',
            fontSize: 13,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        >
          <LogOut size={14} /> Cerrar sesión
        </div>
      </div>
    </aside>
  )
}
