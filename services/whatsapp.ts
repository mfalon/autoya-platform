import fs from 'fs/promises'
import path from 'path'

const LOGS_PATH = path.join(process.cwd(), 'data', 'whatsapp_logs.json')

export interface WhatsappLog {
  id: string
  nombre: string
  telefono: string
  mensaje: string
  fecha: string
  estado: 'enviado' | 'simulado' | 'fallado'
}

export async function enviarRecordatorioWhatsApp(datos: {
  compradorNombre: string
  compradorTelefono: string
  vehiculoModelo: string
  precioARS: number
}): Promise<boolean> {
  const telf = datos.compradorTelefono || '+54 9 11 2233-4455'
  
  // Template formal del Asesor Premium (cumpliendo Tono y Trato del Master Plan)
  const mensajeTemplate = `Estimado/a ${datos.compradorNombre}, le escribimos desde el canal de atención oficial de AutoYa.

Hemos registrado el inicio de reserva para la unidad ${datos.vehiculoModelo} por valor de seña de ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(datos.precioARS)}. Le recordamos que la reserva provisoria de la unidad expira en las próximas horas.

Puede completar su seña de forma segura ingresando al portal de pago de AutoYa o respondiendo a este mensaje para recibir asistencia técnica personalizada.

Quedamos a su entera disposición para lo que requiera.
Atentamente,
Asesoría de Ventas AutoYa Premium.`

  // Integración Twilio Mock / Real
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886' // Sandbox Twilio

  let envStatus: 'enviado' | 'simulado' | 'fallado' = 'simulado'
  let success = true

  if (accountSid && authToken) {
    try {
      // Twilio requiere formato urlencoded
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromPhone.startsWith('whatsapp:') ? fromPhone : `whatsapp:${fromPhone}`,
          To: telf.startsWith('whatsapp:') ? telf : `whatsapp:${telf.replace(/\s+/g, '')}`,
          Body: mensajeTemplate,
        }),
      })

      if (res.ok) {
        console.log('[WhatsApp Service] ✅ Mensaje Twilio enviado con éxito')
        envStatus = 'enviado'
      } else {
        const errText = await res.text()
        console.error('[WhatsApp Service] ❌ Error Twilio API:', errText)
        envStatus = 'fallado'
        success = false
      }
    } catch (err) {
      console.error('[WhatsApp Service] Error de red Twilio:', err)
      envStatus = 'fallado'
      success = false
    }
  }

  // Guardar log en el archivo JSON local para el Dashboard con estado verídico
  try {
    let logs: WhatsappLog[] = []
    try {
      const fileData = await fs.readFile(LOGS_PATH, 'utf-8')
      logs = JSON.parse(fileData)
    } catch {
      // no-op, el archivo no existe aún
    }

    const nuevoLog: WhatsappLog = {
      id: `wa-${Date.now()}`,
      nombre: datos.compradorNombre,
      telefono: telf,
      mensaje: mensajeTemplate,
      fecha: new Date().toISOString(),
      estado: envStatus,
    }

    logs.unshift(nuevoLog)
    await fs.writeFile(LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8')
  } catch (err) {
    console.error('[WhatsApp Service] Error al escribir log de notificaciones:', err)
  }

  return success;
}

export async function obtenerLogsWhatsApp(): Promise<WhatsappLog[]> {
  try {
    const fileData = await fs.readFile(LOGS_PATH, 'utf-8')
    return JSON.parse(fileData)
  } catch {
    return []
  }
}
