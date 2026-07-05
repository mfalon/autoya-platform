import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json')

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

export async function GET() {
  const isOffline = !process.env.SUPABASE_URL
  const detectedIp = getLocalIpAddress()
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8')
    const config = JSON.parse(data)
    config.isOffline = isOffline
    config.localIp = detectedIp
    return NextResponse.json(config)
  } catch (error) {
    // Si no existe, retornamos valores por defecto
    const defaults: any = {
      tna12: 0.65,
      tna24: 0.68,
      tna36: 0.72,
      tna48: 0.75,
      cftDefault: 0.95,
      legend: "Simulación bajo sistema de amortización francés. Tasa fija en Pesos. No incluye gastos de otorgamiento ni seguros."
    }
    defaults.isOffline = isOffline
    defaults.localIp = detectedIp
    return NextResponse.json(defaults)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validamos que los valores sean lógicos
    const newConfig = {
      tna12: Number(body.tna12) || 0.65,
      tna24: Number(body.tna24) || 0.68,
      tna36: Number(body.tna36) || 0.72,
      tna48: Number(body.tna48) || 0.75,
      cftDefault: Number(body.cftDefault) || 0.95,
      legend: body.legend || "Simulación bajo sistema de amortización francés. Tasa fija en Pesos. No incluye gastos de otorgamiento ni seguros."
    }

    await fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8')
    return NextResponse.json({ success: true, config: newConfig })
  } catch (error) {
    console.error('[API Config] Error:', error)
    return NextResponse.json({ error: 'Error al escribir la configuración' }, { status: 500 })
  }
}
