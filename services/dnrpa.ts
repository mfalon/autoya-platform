/**
 * AutoYa — DNRPA Adapter
 *
 * Patrón de diseño: ADAPTER
 *
 * HOY: exporta un dossier estructurado para que el gestor
 *      lo cargue manualmente en el portal TAD/SITE de la DNRPA.
 *
 * MAÑANA: cuando el Estado libere la API oficial, solo se
 *         reemplaza la función `enviarAlEstado()` sin tocar
 *         nada más de la plataforma.
 */

import type { Tramite } from '@/types/admin'
import type { DniData } from '@/app/api/ocr/route'

export interface DossierDNRPA {
  tramite_id:       string
  fecha_generacion: string

  vehiculo: {
    marca:        string
    modelo:       string
    anio:         number
    precio_ars:   number
  }

  comprador: {
    apellido:    string
    nombres:     string
    dni:         string
    cuil:        string
    domicilio:   string
    email:       string
  }

  estado_tramite: string
  listo_para_08:  boolean
}

/**
 * Compila todos los datos del trámite en un dossier estructurado.
 */
export async function compilarDossier(
  tramite: Tramite,
  dniData?: DniData
): Promise<DossierDNRPA> {
  return {
    tramite_id:       tramite.id,
    fecha_generacion: new Date().toISOString(),

    vehiculo: {
      marca:      tramite.vehiculo_brand,
      modelo:     tramite.vehiculo_model,
      anio:       tramite.vehiculo_year,
      precio_ars: tramite.precio_ars,
    },

    comprador: {
      apellido:  dniData?.apellido  ?? tramite.comprador_nombre.split(' ').slice(-1)[0],
      nombres:   dniData?.nombres   ?? tramite.comprador_nombre.split(' ').slice(0, -1).join(' '),
      dni:       dniData?.dni       ?? tramite.comprador_dni.replace(/\./g, ''),
      cuil:      dniData?.cuil      ?? '',
      domicilio: dniData?.domicilio ?? '',
      email:     tramite.comprador_email,
    },

    estado_tramite: tramite.estado,
    listo_para_08:  tramite.dni_procesado && tramite.estado === 'validacion',
  }
}

/**
 * HOY: exporta el dossier como JSON para carga manual en TAD/SITE.
 * MAÑANA: reemplazar el return por fetch() a la API de la DNRPA.
 */
export async function iniciarTransferencia(tramite: Tramite, dniData?: DniData): Promise<{
  success: boolean
  dossier: DossierDNRPA
  mensaje: string
}> {
  const dossier = await compilarDossier(tramite, dniData)

  // ── HOY: exportar para carga manual ──────────────────────────
  // El gestor descarga el JSON y lo carga en https://tramitesadistancia.gob.ar
  console.log('[DNRPA Adapter] Dossier compilado para TAD/SITE:', JSON.stringify(dossier, null, 2))

  // ── MAÑANA: un solo cambio aquí, nada más toca ───────────────
  // return await fetch('https://api.dnrpa.gob.ar/v1/transferencias', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.DNRPA_API_KEY}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify(dossier),
  // }).then(r => r.json())

  return {
    success: true,
    dossier,
    mensaje: `Dossier generado para ${dossier.comprador.apellido}, ${dossier.comprador.nombres}. Cargarlo manualmente en TAD/SITE.`,
  }
}

/**
 * Genera un resumen del dossier en texto plano para imprimir o enviar por email.
 */
export function generarResumenTexto(dossier: DossierDNRPA): string {
  const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
  return `
DOSSIER DE TRANSFERENCIA — AutoYa
Fecha: ${new Date(dossier.fecha_generacion).toLocaleDateString('es-AR')}
Trámite ID: ${dossier.tramite_id}

VEHÍCULO
Marca/Modelo: ${dossier.vehiculo.marca} ${dossier.vehiculo.modelo} ${dossier.vehiculo.anio}
Precio de venta: ${ars.format(dossier.vehiculo.precio_ars)}

COMPRADOR
Apellido: ${dossier.comprador.apellido}
Nombres: ${dossier.comprador.nombres}
DNI: ${dossier.comprador.dni}
CUIL: ${dossier.comprador.cuil}
Domicilio: ${dossier.comprador.domicilio}
Email: ${dossier.comprador.email}

Estado actual: ${dossier.estado_tramite}
Listo para Formulario 08: ${dossier.listo_para_08 ? 'SÍ' : 'NO'}
`.trim()
}
