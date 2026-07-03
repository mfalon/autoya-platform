import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

// Estructura técnica de la plataforma AutoYa para que el enjambre audite
const ARQUITECTURA_AUTOYA = [
  { modulo: 'Checkout & Reserva MP', archivo: '/api/webhooks/mp/route.ts', implementacion: 'Recibe webhook de MercadoPago, actualiza estado a reservado y avanza trámite DNRPA.', riesgo: 'Validación de firma de webhook ausente o simulada.' },
  { modulo: 'Gestoría Digital DNRPA (OCR)', archivo: '/components/admin/GestoriaDetailModal.tsx', implementacion: 'Gemini Vision OCR para DNI, auto-completa Formulario 08 Digital.', riesgo: 'OCR depende del contraste de imagen; borrador DNRPA es simulado.' },
  { modulo: 'Simulador Financiero', archivo: '/components/VehicleDetailModal.tsx', implementacion: 'Fórmula de Amortización Francesa reactiva con TNA/CFT configurable desde admin.', riesgo: 'Posible inconsistencia en redondeos de cuotas centavo a centavo.' },
  { modulo: 'Recuperación de Carritos (WhatsApp)', archivo: '/admin/clientes/page.tsx', implementacion: 'Dashboard omnichannel para clientes con carrito abandonado y alertas con 1-click WhatsApp.', riesgo: 'Logs de outbox en JSON local como fallback si falla Twilio.' },
  { modulo: 'Persistencia & DB', archivo: '/lib/supabase.ts', implementacion: 'Lógica híbrida: Supabase Cloud en producción y fallback JSON/localStorage offline.', riesgo: 'Sincronización bidireccional asíncrona limitada.' },
  { modulo: 'Memoria de Asistente IA', archivo: '/services/memoria.ts', implementacion: 'Embeddings de Gemini y pgvector en Base de Datos para recordar preferencias del cliente.', riesgo: 'Consumo de tokens de contexto en hilos de conversación largos.' }
]

export async function POST(req: NextRequest) {
  try {
    const { moduloSeleccionado = 'Todos los Módulos' } = await req.json()

    // 1. Agente 1: El Investigador Escéptico (The Forensic Software Auditor)
    const promptInvestigador = `
      Eres un auditor forense de software de élite, sumamente desconfiado e implacable. Tu única misión es detectar fallos, vulnerabilidades de negocio, inconsistencias o malas prácticas en el código e intranet de la concesionaria AutoYa.
      
      ESTRUCTURA TÉCNICA DEL PROYECTO:
      ${JSON.stringify(ARQUITECTURA_AUTOYA, null, 2)}

      MÓDULO FILTRADO PARA ENFOQUE: ${moduloSeleccionado}

      REGLAS DE ANÁLISIS:
      1. Adopta una mentalidad de sospecha: Asume que cada módulo web tiene vulnerabilidades de negocio o errores lógicos latentes.
      2. No confíes en las respuestas de éxito: Revisa los riesgos declarados en la arquitectura.
      3. Genera una lista de hallazgos críticos detallando: componente, riesgo lógico de negocio o UI detectado y la "huella" de comportamiento inadecuado.
      
      Escribe tu reporte paso a paso (Chain of Thought), analizando rigurosamente. Si consideras que todo está perfecto, justifícalo, pero recuerda que el conformismo no es una opción.
    `

    const { text: reporteInvestigador } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: promptInvestigador,
    })

    // 2. Agente 2: El Abogado del Diablo (The Adversarial Critic)
    const promptAbogado = `
      Eres el Abogado del Diablo y un Lead Software Engineer defensor del equipo de desarrollo. Tu único objetivo es encontrar fallos en el análisis del Agente Investigador.
      
      INFORME DE VULNERABILIDADES DEL INVESTIGADOR:
      ${reporteInvestigador}

      ESTRUCTURA TÉCNICA ORIGINAL:
      ${JSON.stringify(ARQUITECTURA_AUTOYA, null, 2)}

      TU MISIÓN:
      Destruye las conclusiones del Investigador. Para cada "vulnerabilidad" o "error" que él afirme detectar, debes proponer explicaciones de arquitectura o justificaciones lógicas:
      - ¿El fallback offline de Supabase resguarda la experiencia de usuario si falla la conexión?
      - ¿Los simulacros de DNRPA evitan costos de tasa de API oficiales en la etapa de desarrollo?
      - ¿El diseño modular permite escalabilidad futura inmediata?
      
      Escribe tu contrarreporte de forma hipercrítica y defensiva, desacreditando las conclusiones alarmistas del Investigador.
    `

    const { text: contraReporteAbogado } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: promptAbogado,
    })

    // 3. Agente 3: El Auditor General (The Judge)
    const promptJuez = `
      Eres el Auditor General de la Concesionaria. Tu función es actuar como juez imparcial ante la disputa del Agente Investigador (acusación) y el Abogado del Diablo (defensa) sobre la intranet AutoYa.
      
      HISTORIAL DEL DEBATE DE AGENTES:
      - ACUSACIÓN (Investigador):
      ${reporteInvestigador}
      
      - DEFENSA (Abogado del Diablo):
      ${contraReporteAbogado}

      INSTRUCCIONES DE RESOLUCIÓN:
      1. Analiza el debate entre ambos sobre la calidad del desarrollo.
      2. Valida las pruebas técnicas: Si un riesgo detectado es crítico para la seguridad de cobros o datos de patentes, márcalo con prioridad alta.
      3. Si ambos coinciden en que un módulo requiere refactorización urgente (como la firma de webhooks de MercadoPago), márcalo como "REFACTORIZACIÓN RECOMENDADA CON ALTA PRIORIDAD".
      4. Redacta el reporte final de veredicto de software. Clasifica los hallazgos en tres niveles: Crítico (bloqueante en producción), Sospechoso e Inconsistencia Menor/Sugerencia de Optimización.
      5. Puntuación de Calidad/Madurez: Califica la robustez de la plataforma del 1 al 10. Solo puntajes consolidados menores a 7 disparan alertas de refactorización al director del proyecto.
    `

    const { text: veredictoJuez } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: promptJuez,
    })

    return NextResponse.json({
      success: true,
      moduloSeleccionado,
      arquitectura: ARQUITECTURA_AUTOYA,
      debate: {
        investigador: reporteInvestigador,
        abogado: contraReporteAbogado,
        juez: veredictoJuez
      }
    })
  } catch (error) {
    console.error('[API AUDITORIA GET] Error:', error)
    return NextResponse.json({ error: 'Error al procesar la auditoría de desarrollo' }, { status: 500 })
  }
}
