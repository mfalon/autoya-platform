import { NextRequest, NextResponse } from 'next/server'

/**
 * AutoYa — Webhook IPN de MercadoPago
 *
 * MercadoPago envía una notificación POST aquí cuando el pago es procesado.
 * Configurar la URL en MP Dashboard: https://autoya-platform.vercel.app/api/webhooks/mp
 *
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/ipn
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    console.log('[Webhook MP] Notificación recibida:', { type, data })

    // Solo procesamos pagos aprobados
    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pago faltante' }, { status: 400 })
    }

    // Verificar pago con la API de MP
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      console.warn('[Webhook MP] Sin ACCESS_TOKEN — saltando verificación')
      return NextResponse.json({ received: true, mock: true })
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!mpRes.ok) {
      console.error('[Webhook MP] Error verificando pago:', mpRes.status)
      return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 502 })
    }

    const payment = await mpRes.json()
    const { status, external_reference } = payment

    console.log('[Webhook MP] Pago verificado:', { paymentId, status, external_reference })

    if (status === 'approved' && external_reference) {
      // external_reference = "vehicleId|email|timestamp"
      const [vehicleId, email] = external_reference.split('|')

      // ── Acciones al confirmar pago ────────────────────────────
      try {
        const { actualizarEstadoVehiculo } = await import('@/services/vehiculos')
        const { obtenerTramites, actualizarTramite } = await import('@/services/tramites')

        // 1. Marcar el vehículo como reservado en la base de datos
        await actualizarEstadoVehiculo(vehicleId, 'reservado')

        // 2. Buscar el trámite provisorio del comprador y avanzar el estado a 'validacion'
        const list = await obtenerTramites()
        const match = list.find(t => t.comprador_email === email && t.estado === 'reserva')
        if (match) {
          await actualizarTramite(match.id, {
            estado: 'validacion',
            notas: `Seña MercadoPago confirmada (Pago #${paymentId}). Trámite transferido a validación documental.`,
          })
          console.log(`[Webhook MP] ✅ Trámite ${match.id} avanzado a validación`)
        } else {
          console.warn(`[Webhook MP] No se encontró trámite coincidente para ${email}`)
        }

      } catch (dbErr) {
        console.error('[Webhook MP] Error actualizando base de datos:', dbErr)
      }

      console.log(`[Webhook MP] ✅ Pago aprobado — vehiculo: ${vehicleId}, comprador: ${email}`)
    }

    return NextResponse.json({ received: true, status })

  } catch (err) {
    console.error('[Webhook MP] Error procesando notificación:', err)
    // Siempre devolver 200 a MP para evitar reintentos
    return NextResponse.json({ received: true })
  }
}

// MercadoPago también envía GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ status: 'AutoYa MP Webhook activo ✅' })
}
