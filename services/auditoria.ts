import fs from 'fs/promises'
import path from 'path'

const AUDIT_LOGS_PATH = path.join(process.cwd(), 'data', 'audit_logs.json')

export interface AuditLog {
  id: string
  timestamp: string
  usuario: string
  rol: string
  accion: string
  detalles: string
}

export async function registrarAccion(
  usuario: string,
  rol: string,
  accion: string,
  detalles: string
): Promise<void> {
  try {
    let logs: AuditLog[] = []
    
    // Crear el directorio data si no existe
    await fs.mkdir(path.dirname(AUDIT_LOGS_PATH), { recursive: true })

    try {
      const fileData = await fs.readFile(AUDIT_LOGS_PATH, 'utf-8')
      logs = JSON.parse(fileData)
    } catch {
      // Si el archivo no existe o está corrupto, empezamos con array vacío
    }

    const nuevoLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      usuario: usuario || 'Sistema',
      rol: rol || 'system',
      accion,
      detalles
    }

    logs.unshift(nuevoLog)
    // Limitar a los últimos 200 registros para evitar sobrecarga en disco
    const limitedLogs = logs.slice(0, 200)
    
    await fs.writeFile(AUDIT_LOGS_PATH, JSON.stringify(limitedLogs, null, 2), 'utf-8')
    console.log(`[Audit Log] Acción registrada: ${usuario} (${rol}) -> ${accion}`)
  } catch (err) {
    console.error('[Audit Log] Error al guardar bitácora de seguridad:', err)
  }
}

export async function obtenerLogsAuditoria(): Promise<AuditLog[]> {
  try {
    const fileData = await fs.readFile(AUDIT_LOGS_PATH, 'utf-8')
    return JSON.parse(fileData)
  } catch {
    return []
  }
}
