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

    if (!userStr && !isLoginPage) {
      router.push('/admin/login')
    } else {
      setAuthorized(true)
    }
  }, [pathname, router])

  const isLoginPage = pathname === '/admin/login'

  if (!authorized && !isLoginPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)', color: 'var(--fg-secondary)', fontSize: 13 }}>
        Cargando portal seguro...
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
