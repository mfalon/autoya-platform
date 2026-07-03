import fs from 'fs'
import path from 'path'

const SYNC_FILE = path.join(process.cwd(), 'data', 'camera_sync.json')

// Garantizar que exista el directorio data y el archivo json
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
  try {
    ensureSyncFile()
    const content = fs.readFileSync(SYNC_FILE, 'utf8')
    const data = JSON.parse(content)

    data[syncId] = {
      image: imageBase64,
      timestamp: Date.now()
    }

    fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('[Camera Sync Service] Error al guardar foto:', error)
    return false
  }
}

export async function obtenerFotoSync(syncId: string): Promise<string | null> {
  try {
    ensureSyncFile()
    const content = fs.readFileSync(SYNC_FILE, 'utf8')
    const data = JSON.parse(content)

    const entry = data[syncId]
    if (!entry) return null

    // Si tiene más de 10 minutos de antigüedad, la descartamos
    if (Date.now() - entry.timestamp > 10 * 60 * 1000) {
      delete data[syncId]
      fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf8')
      return null
    }

    const image = entry.image
    
    // Limpiamos la entrada para liberar almacenamiento
    delete data[syncId]
    fs.writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2), 'utf8')

    return image
  } catch (error) {
    console.error('[Camera Sync Service] Error al obtener foto:', error)
    return null
  }
}
