/**
 * AutoYa — MercadoPago Service (Sprint 3)
 *
 * Crea preferencias de pago para la seña de reserva.
 * Funciona en modo SANDBOX por defecto (sin necesidad de cuenta real).
 *
 * Para activar producción:
 *   1. Cuenta MP Business: https://www.mercadopago.com.ar/developers
 *   2. Agregar al .env.local:
 *      MP_ACCESS_TOKEN=APP_USR-xxxx   (producción o sandbox)
 *      MP_PUBLIC_KEY=APP_USR-xxxx
 *      NEXT_PUBLIC_APP_URL=https://autoya-platform.vercel.app
 */

import MercadoPago, { Preference } from 'mercadopago'
import type { Vehicle } from '@/data/vehicles'
import { formatARS } from '@/utils/currency'

// Monto fijo de la seña (configurable)
export const SENA_ARS = 500_000

export interface ReservaPayload {
  vehicle: Vehicle
  comprador: {
    nombre: string
    email:  string
    dni:    string
  }
}

export interface ReservaResult {
  success:    boolean
  paymentUrl: string    // link de pago de MercadoPago
  preferenceId: string
  isMock:     boolean   // true cuando se usa sin credenciales reales
}

/**
 * Crea una preferencia de pago en MercadoPago.
 * Si no hay ACCESS_TOKEN configurado, devuelve una URL de sandbox demo.
 */
export async function crearReserva(payload: ReservaPayload): Promise<ReservaResult> {
  const { vehicle, comprador } = payload
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const accessToken = process.env.MP_ACCESS_TOKEN

  // ── Modo MOCK (sin credenciales) ─────────────────────────────
  if (!accessToken) {
    console.warn('[MercadoPago] Sin ACCESS_TOKEN — usando modo mock')
    return {
      success: true,
      paymentUrl: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=MOCK-${vehicle.id}`,
      preferenceId: `MOCK-${vehicle.id}-${Date.now()}`,
      isMock: true,
    }
  }

  // ── Modo REAL (con credenciales MP) ──────────────────────────
  const client = new MercadoPago({ accessToken })
  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      items: [
        {
          id:          vehicle.id,
          title:       `Seña de reserva — ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
          description: `${vehicle.version} · ${vehicle.condition} · ${formatARS(vehicle.precio_ars)}`,
          quantity:    1,
          unit_price:  SENA_ARS,
          currency_id: 'ARS',
          category_id: 'vehicles',
        },
      ],
      payer: {
        name:  comprador.nombre,
        email: comprador.email,
      },
      back_urls: {
        success: `${appUrl}/reserva/exito?vehiculo=${vehicle.id}`,
        failure: `${appUrl}/reserva/error`,
        pending: `${appUrl}/reserva/pendiente`,
      },
      auto_return:        'approved',
      notification_url:   `${appUrl}/api/webhooks/mp`,
      statement_descriptor: 'AUTOYA RESERVA',
      external_reference: `${vehicle.id}|${comprador.email}|${Date.now()}`,
      expires:            true,
      expiration_date_to: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // 48h
    },
  })

  return {
    success:      true,
    paymentUrl:   result.init_point!,
    preferenceId: result.id!,
    isMock:       false,
  }
}
