// ── Tipos de la Intranet ──────────────────────────────────────

export type Rol = 'role_admin' | 'role_ventas' | 'role_gestoria'

export interface AdminUser {
  id: string
  nombre: string
  email: string
  rol: Rol
}

export type EstadoTramite = 'reserva' | 'validacion' | 'formulario08' | 'finalizado'

export interface Tramite {
  id: string
  vehiculo_brand: string
  vehiculo_model: string
  vehiculo_year: number
  precio_ars: number
  comprador_nombre: string
  comprador_dni: string
  comprador_email: string
  estado: EstadoTramite
  notas?: string
  created_at: string
  dni_procesado: boolean
}

// ── Mock data para demo (sin Supabase) ────────────────────────

export const MOCK_USER: AdminUser = {
  id: 'demo-user',
  nombre: 'Martín Falón',
  email: 'admin@autoya.com.ar',
  rol: 'role_admin',
}

export const MOCK_TRAMITES: Tramite[] = [
  {
    id: 't-001',
    vehiculo_brand: 'Toyota',
    vehiculo_model: 'Hilux SR 4x4',
    vehiculo_year: 2024,
    precio_ars: 55_000_000,
    comprador_nombre: 'Carlos Rodríguez',
    comprador_dni: '28.456.789',
    comprador_email: 'carlos@gmail.com',
    estado: 'reserva',
    notas: 'Seña abonada por transferencia',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    dni_procesado: false,
  },
  {
    id: 't-002',
    vehiculo_brand: 'Chevrolet',
    vehiculo_model: 'Tracker Premier',
    vehiculo_year: 2024,
    precio_ars: 33_000_000,
    comprador_nombre: 'Ana Gómez',
    comprador_dni: '32.123.456',
    comprador_email: 'ana.gomez@outlook.com',
    estado: 'validacion',
    notas: 'DNI subido, procesando OCR',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    dni_procesado: true,
  },
  {
    id: 't-003',
    vehiculo_brand: 'Ford',
    vehiculo_model: 'Ranger XLS 4x4',
    vehiculo_year: 2024,
    precio_ars: 57_000_000,
    comprador_nombre: 'Jorge Méndez',
    comprador_dni: '25.789.012',
    comprador_email: 'jorge.m@yahoo.com',
    estado: 'formulario08',
    notas: 'Cargado en TAD, esperando turno registral',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    dni_procesado: true,
  },
  {
    id: 't-004',
    vehiculo_brand: 'Volkswagen',
    vehiculo_model: 'Polo Track',
    vehiculo_year: 2024,
    precio_ars: 22_000_000,
    comprador_nombre: 'Lucía Fernández',
    comprador_dni: '38.456.123',
    comprador_email: 'lufer@gmail.com',
    estado: 'finalizado',
    notas: 'Transferencia completada. Entrega 15/07',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    dni_procesado: true,
  },
]
