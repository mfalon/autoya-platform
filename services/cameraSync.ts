import fs from 'fs'
import path from 'path'
import { supabase } from '@/lib/supabase'

const SYNC_FILE = path.join(process.cwd(), 'data', 'camera_sync.json')

// Garantizar que exista el directorio data y el archivo json para modo offline
function ensureSyncFile() {
  const dir = path.dirname(SYNC_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(SYNC_FILE)) {
    fs.writeFileSync(SYNC_FILE, JSON.stringify({}), 'utf8')
  }
}

export async function guardarFotoSync(syncId: string, imageBase64: string): Promise<boolean> {
  const sessionKey = `camera-sync-${syncId}`

  // Si Supabase está conectado, guardamos en la tabla de base de datos
  if (supabase) {
    try {
      const { error } = await supabase
        .from('chat_memoria')
        .insert({
          session_id: sessionKey,
          mensaje: imageBase64,
          rol: 'user'
        })
      if (error) throw error
      console.log(`[Camera Sync DB] Foto guardada bajo clave: ${sessionKey}`)
      return true
    } catch (err) {
      console.error('[Camera Sync DB] Error al guardar en Supabase:', err)
      // Fallback al sistema de archivos local en caso de error
    }
  }

  // Fallback local/offline
  try {
    ensureSyncFile()
    let data: any = {}
    try {
      const content = fs.readFileSync(SYNC_FILE, 'utf8')
      data = JSON.parse(content)
    } catch {
      data = {}
    }

    data[syncId] = {
      image: imageBase64,
      timestamp: Date.now()
    }

    fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf8')
    console.log(`[Camera Sync Local] Foto guardada bajo clave: ${syncId}`)
    return true
  } catch (error) {
    console.error('[Camera Sync Local] Error al guardar foto:', error)
    return false
  }
}

export async function obtenerFotoSync(syncId: string): Promise<string | null> {
  const sessionKey = `camera-sync-${syncId}`

  // Si Supabase está conectado, leemos de la base de datos
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chat_memoria')
        .select('mensaje')
        .eq('session_id', sessionKey)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        const image = data[0].mensaje

        // Limpiar/borrar el registro para liberar espacio en la base de datos
        await supabase
          .from('chat_memoria')
          .delete()
          .eq('session_id', sessionKey)

        console.log(`[Camera Sync DB] Foto recuperada y purgada para: ${sessionKey}`)
        return image
      }
      return null
    } catch (err) {
      console.error('[Camera Sync DB] Error al obtener de Supabase:', err)
      // Fallback al sistema de archivos local en caso de error
    }
  }

  // Fallback local/offline
  try {
    ensureSyncFile()
    let data: any = {}
    try {
      const content = fs.readFileSync(SYNC_FILE, 'utf8')
      data = JSON.parse(content)
    } catch {
      data = {}
    }

    const entry = data[syncId]
    if (!entry) return null

    // Si tiene más de 10 minutos de antigüedad, la descartamos
    if (Date.now() - entry.timestamp > 10 * 60 * 1000) {
      delete data[syncId]
      try {
        fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf8')
      } catch {}
      return null
    }

    const image = entry.image
    
    // Limpiar entrada
    delete data[syncId]
    try {
      fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf8')
    } catch {}

    console.log(`[Camera Sync Local] Foto recuperada y purgada para: ${syncId}`)
    return image
  } catch (error) {
    console.error('[Camera Sync Local] Error al obtener foto:', error)
    return null
  }
}
