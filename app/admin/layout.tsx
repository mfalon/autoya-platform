'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('autoya_user')
    const isLoginPage = pathname === '/admin/login'

    if (!userStr) {
      if (!isLoginPage) {
        router.push('/admin/login')
      }
      return
    }

    // El usuario está logueado
    const user = JSON.parse(userStr)
    const role = user.role || 'role_admin'

    // Definición de reglas de ruta por Rol (RBAC)
    let isPathAllowed = true

    if (pathname.startsWith('/admin/configuracion') || pathname.startsWith('/admin/auditoria')) {
      isPathAllowed = role === 'role_admin'
    } else if (pathname.startsWith('/admin/transferencias')) {
      isPathAllowed = role === 'role_admin' || role === 'role_gestoria'
    } else if (
      pathname.startsWith('/admin/vehiculos') || 
      pathname.startsWith('/admin/clientes') || 
      pathname.startsWith('/admin/precios')
    ) {
      isPathAllowed = role === 'role_admin' || role === 'role_ventas'
    }

    if (!isPathAllowed) {
      setAuthorized(false)
      // Registrar intento de intrusión en auditoría
      fetch('/api/auditoria/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: user.name,
          rol: role,
          accion: 'Intento de Intrusión',
          detalles: `Intento de acceso bloqueado a la ruta protegida: ${pathname}`
        })
      }).catch(err => console.error('[Intrusion Audit Error]', err))

      // Redirigir al dashboard seguro
      router.push('/admin/dashboard')
    } else {
      setAuthorized(true)
    }
  }, [pathname, router])

  const isLoginPage = pathname === '/admin/login'

  if (!authorized && !isLoginPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)', color: 'var(--fg-secondary)', fontSize: 13 }}>
        Validando credenciales de acceso...
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-base)',
    }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}
