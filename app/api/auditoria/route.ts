import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

// Datos simulados de telemetría de combustible de un camión Scania R450 en un trayecto
const TELEMETRIA_MOCK = [
  { timestamp: '10:00', estado: 'Marcha', velocidad_kmh: 80, combustible_litros: 450, inclinacion: 0 },
  { timestamp: '10:15', estado: 'Marcha', velocidad_kmh: 82, combustible_litros: 446, inclinacion: 1 },
  { timestamp: '10:30', estado: 'Marcha', velocidad_kmh: 78, combustible_litros: 442, inclinacion: -1 },
  { timestamp: '10:45', estado: 'Detenido', velocidad_kmh: 0, combustible_litros: 441, inclinacion: 0 },
  { timestamp: '10:47', estado: 'Detenido', velocidad_kmh: 0, combustible_litros: 421, inclinacion: 0 }, // Anomalía: -20 litros en 2 mins detenido
  { timestamp: '10:50', estado: 'Detenido', velocidad_kmh: 0, combustible_litros: 421, inclinacion: 0 },
  { timestamp: '11:05', estado: 'Marcha', velocidad_kmh: 85, combustible_litros: 416, inclinacion: 5 }, // Pendiente: alteración boya por inclinación
  { timestamp: '11:20', estado: 'Marcha', velocidad_kmh: 80, combustible_litros: 412, inclinacion: 0 },
  { timestamp: '11:35', estado: 'Detenido', velocidad_kmh: 0, combustible_litros: 410, inclinacion: -4 },
  { timestamp: '11:37', estado: 'Detenido', velocidad_kmh: 0, combustible_litros: 407, inclinacion: -4 }, // Variación de 3 litros en pendiente
  { timestamp: '11:50', estado: 'Marcha', velocidad_kmh: 75, combustible_litros: 402, inclinacion: 0 }
]

export async function POST(req: NextRequest) {
  try {
    const { vehiculo = 'Scania R450 (Patente AF-892-BB)' } = await req.json()

    // 1. Agente 1: El Investigador Escéptico (The Forensic Auditor)
    const promptInvestigador = `
      Eres un auditor forense de élite, sumamente desconfiado e implacable. Tu única misión es detectar anomalías, discrepancias o posibles fraudes en los datos de telemetría de la flota.
      
      DATOS DE TELEMETRÍA DEL VEHÍCULO:
      ${JSON.stringify(TELEMETRIA_MOCK, null, 2)}

      REGLAS DE ANÁLISIS:
      1. Adopta una mentalidad de sospecha: Asume que cada parada de vehículo oculta una anomalía hasta que demuestres matemáticamente lo contrario.
      2. No confíes en los promedios generales: Analiza cada fila del registro. Busca caídas lentas de gasoil que duren más de 2 minutos después de la detención.
      3. Genera una lista de sospechas detallando: hora exacta, cantidad extraída sospechada y la "huella" de comportamiento detectada.
      
      Escribe tu reporte paso a paso (Chain of Thought), detallando las restas matemáticas. Si no encuentras ninguna sospecha, debes justificar rigurosamente por qué consideras que el 100% de la ruta fue perfecta.
    `

    const { text: reporteInvestigador } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: promptInvestigador,
    })

    // 2. Agente 2: El Abogado del Diablo (The Adversarial Critic)
    const promptAbogado = `
      Eres el Abogado del Diablo y un experto en sensores físicos de combustible. Tu único objetivo es encontrar fallos en el análisis del Agente Investigador.
      
      INFORME DE SOSPECHAS DEL INVESTIGADOR:
      ${reporteInvestigador}

      DATOS DE TELEMETRÍA ORIGINALES:
      ${JSON.stringify(TELEMETRIA_MOCK, null, 2)}

      TU MISIÓN:
      Destruye las conclusiones del Investigador. Para cada "robo" o "error" que él afirme detectar, debes proponer explicaciones alternativas físicas:
      - ¿Pudo ser una pendiente del terreno que alteró la boya del tanque? (Revisa el campo 'inclinacion')
      - ¿Pudo ser contracción térmica del combustible por frío repentino?
      - ¿Los sensores tienen margen de error en ese modelo de camión? (Margen estándar de sensores capacitivos: +-3 litros).
      
      Escribe tu contrarreporte de forma hipercrítica y agresiva, desacreditando las conclusiones flojas de papeles.
    `

    const { text: contraReporteAbogado } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: promptAbogado,
    })

    // 3. Agente 3: El Auditor General (The Judge)
    const promptJuez = `
      Eres el Auditor General de la Flota. Tu función es actuar como juez imparcial ante la disputa del Agente Investigador (acusación) y el Abogado del Diablo (defensa).
      
      HISTORIAL DEL DEBATE:
      - ACUSACIÓN (Investigador):
      ${reporteInvestigador}
      
      - DEFENSA (Abogado del Diablo):
      ${contraReporteAbogado}

      INSTRUCCIONES DE RESOLUCIÓN:
      1. Analiza el debate entre ambos.
      2. Valida las pruebas matemáticas: Si una bajada de nivel de combustible no supera el margen de error del sensor justificado por el Abogado del Diablo, descártala.
      3. Si ambos coinciden en que un evento no tiene explicación física normal (como una pérdida grande detenido en terreno plano), márcalo como "FRAUDE CONFIRMADO CON ALTA PROBABILIDAD".
      4. Redacta el reporte final de veredicto. Clasifica los errores o eventos confirmados en tres niveles: Crítico (posible fraude), Sospechoso e Inconsistencia de Sensores.
      5. Puntuación de Confianza: Califica el nivel de fraude confirmado del 1 al 10. Solo eventos mayores a 8 disparan alertas al teléfono del supervisor.
    `

    const { text: veredictoJuez } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: promptJuez,
    })

    return NextResponse.json({
      success: true,
      vehiculo,
      telemetria: TELEMETRIA_MOCK,
      debate: {
        investigador: reporteInvestigador,
        abogado: contraReporteAbogado,
        juez: veredictoJuez
      }
    })
  } catch (error) {
    console.error('[API AUDITORIA] Error:', error)
    return NextResponse.json({ error: 'Error al procesar la auditoría de telemetría' }, { status: 500 })
  }
}
