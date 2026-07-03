'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (userEmail: string, role: string, name: string) => {
    setLoading(true)
    
    // Guardar registro de inicio de sesión en auditoría
    try {
      await fetch('/api/auditoria/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: name,
          rol: role,
          accion: 'Inicio de Sesión',
          detalles: `Ingresó al sistema de administración desde el correo ${userEmail}`
        })
      })
    } catch (e) {
      console.error('[Login Audit] Error al auditar login:', e)
    }

    setTimeout(() => {
      const user = { email: userEmail, role, name }
      localStorage.setItem('autoya_user', JSON.stringify(user))
      router.push('/admin/dashboard')
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Asignamos rol basado en el correo por conveniencia o admin por defecto
    let role = 'role_admin'
    let name = 'Martín Falón'

    if (email.includes('ventas')) {
      role = 'role_ventas'
      name = 'Sandra Rossi'
    } else if (email.includes('gestoria')) {
      role = 'role_gestoria'
      name = 'Ramiro Paz'
    }

    handleLogin(email, role, name)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg-base)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20
    }}>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '40px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--brand-dim)', border: '2px solid var(--brand-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand)', margin: '0 auto 12px',
            boxShadow: '0 0 24px var(--brand-glow)'
          }}>
            <Shield size={22} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fg-primary)' }}>
            AUTOYA <span style={{ color: 'var(--brand)' }}>ADMIN</span>
          </h2>
          <p style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Intranet de Gestión Comercial
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Dirección de Correo</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 3, padding: '10px 12px'
            }}>
              <Mail size={14} style={{ color: 'var(--fg-tertiary)' }} />
              <input
                type="email" placeholder="nombre@autoya.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg-primary)', fontSize: 13, flex: 1 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Contraseña</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 3, padding: '10px 12px'
            }}>
              <Lock size={14} style={{ color: 'var(--fg-tertiary)' }} />
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg-primary)', fontSize: 13, flex: 1 }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              padding: 12, background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 10
            }}
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'} <ArrowRight size={13} />
          </motion.button>
        </form>

        <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />

        {/* Acceso Rápido por Rol */}
        <div>
          <span style={{ fontSize: 10, color: 'var(--fg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: 12, textAlign: 'center' }}>
            Acceso de Prueba por Rol
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            
            <button
              onClick={() => handleLogin('admin@autoya.com', 'role_admin', 'Martín Falón')}
              style={{
                width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: 'var(--fg-primary)', fontSize: 12, cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserCheck size={12} style={{ color: 'var(--brand)' }} /> Administrador</span>
              <span style={{ fontSize: 9, color: 'var(--fg-tertiary)' }}>Martín F.</span>
            </button>

            <button
              onClick={() => handleLogin('ventas@autoya.com', 'role_ventas', 'Sandra Rossi')}
              style={{
                width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: 'var(--fg-primary)', fontSize: 12, cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserCheck size={12} style={{ color: '#22c55e' }} /> Ventas</span>
              <span style={{ fontSize: 9, color: 'var(--fg-tertiary)' }}>Sandra R.</span>
            </button>

            <button
              onClick={() => handleLogin('gestoria@autoya.com', 'role_gestoria', 'Ramiro Paz')}
              style={{
                width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: 'var(--fg-primary)', fontSize: 12, cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserCheck size={12} style={{ color: 'var(--ai)' }} /> Gestoría / DNRPA</span>
              <span style={{ fontSize: 9, color: 'var(--fg-tertiary)' }}>Ramiro P.</span>
            </button>

          </div>
        </div>

      </motion.div>
    </div>
  )
}
