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
      // TODO (cuando Supabase esté conectado):
      //   1. UPDATE vehiculos SET estado='reservado' WHERE id=vehicleId
      //   2. INSERT INTO tramites_legales (vehiculo_id, comprador_email, estado) VALUES (vehicleId, email, 'reserva')
      //   3. Enviar email de confirmación al comprador (Resend)

      console.log(`[Webhook MP] ✅ Pago aprobado — vehiculo: ${vehicleId}, comprador: ${email}`)
      console.log('[Webhook MP] TODO: marcar vehículo como reservado en Supabase')
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
