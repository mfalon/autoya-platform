import AdminSidebar from '@/components/admin/AdminSidebar'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'AutoYa Admin — Intranet',
  robots: { index: false, follow: false }, // nunca indexar el admin
}

export default function AdminLayout({ children }: { children: ReactNode }) {
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
