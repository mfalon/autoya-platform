'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Car, ShieldCheck, Upload, AlertCircle, Check, FileText, Download } from 'lucide-react'
import { formatARS } from '@/utils/currency'
import type { Tramite } from '@/types/admin'

interface GestoriaDetailModalProps {
  tramite: Tramite
  onClose: () => void
  onUpdate: (updated: Tramite) => void
}

export default function GestoriaDetailModal({ tramite, onClose, onUpdate }: GestoriaDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'expediente' | 'ocr' | 'formulario08'>('expediente')
  
  // Estados de datos
  const [nombre, setNombre] = useState(tramite.comprador_nombre)
  const [dni, setDni] = useState(tramite.comprador_dni)
  const [email, setEmail] = useState(tramite.comprador_email)
  const [notas, setNotas] = useState(tramite.notas || '')
  
  // Datos extraídos por OCR
  const [ocrData, setOcrData] = useState<any>(null)
  const [ocrErrorAlert, setOcrErrorAlert] = useState<string | null>(null)
  
  // Estados de UI
  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Subida de DNI y procesamiento OCR
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessing(true)
    setOcrErrorAlert(null)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.data) {
        setOcrData(result.data)
        
        // Validación estructurada de integridad del OCR (DNI y Nombres)
        const dniClean = String(result.data.dni || '').replace(/\D/g, '')
        const hasNames = !!result.data.nombres && !!result.data.apellido
        
        if (dniClean.length < 7 || dniClean.length > 9 || !hasNames) {
          setOcrErrorAlert('⚠️ Advertencia: Calidad de imagen baja. La lectura óptica devolvió campos incompletos o fuera de formato. Verifique y corrija los datos del comprador.')
        } else {
          setOcrErrorAlert(null)
        }

        // Auto-completamos los datos del comprador con la lectura de Gemini
        const fullname = `${result.data.nombres} ${result.data.apellido}`.trim()
        setNombre(fullname)
        
        // Formateamos el DNI con puntos si no los tiene
        let formattedDni = result.data.dni
        if (formattedDni.length === 8) {
          formattedDni = `${formattedDni.slice(0, 2)}.${formattedDni.slice(2, 5)}.${formattedDni.slice(5)}`
        }
        setDni(formattedDni)

        // Cambiamos a la pestaña de expediente para ver los campos auto-completados
        setActiveTab('expediente')
      } else {
        alert(result.error || 'No se pudo leer la imagen del DNI. Intente con otra foto más nítida.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de red al procesar el OCR.')
    } finally {
      setProcessing(false)
    }
  }

  // Guardar cambios en el expediente (PUT /api/tramites)
  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/tramites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tramite.id,
          comprador_nombre: nombre,
          comprador_dni: dni,
          comprador_email: email,
          notas: notas,
          dni_data: ocrData, // si cargó DNI
        }),
      })

      if (response.ok) {
        // Registrar en auditoría
        let userAudit = 'Gestoría'
        let roleAudit = 'role_gestoria'
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('autoya_user')
          if (userStr) {
            const u = JSON.parse(userStr)
            userAudit = u.name
            roleAudit = u.role
          }
        }
        fetch('/api/auditoria/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario: userAudit,
            rol: roleAudit,
            accion: 'Modificación de Expediente',
            detalles: `Actualizó datos del expediente #${tramite.id.slice(0, 8)}: Comprador ${nombre}, DNI: ${dni}`
          })
        }).catch(err => console.error('[Audit Log Error]', err))

        setSaved(true)
        onUpdate({
          ...tramite,
          comprador_nombre: nombre,
          comprador_dni: dni,
          comprador_email: email,
          notas: notas,
          dni_procesado: !!ocrData || tramite.dni_procesado,
        })
        setTimeout(() => setSaved(false), 2000)
      } else {
        alert('Error al guardar el expediente.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión.')
    } finally {
      setSaving(false)
    }
  }

  // Simulación de descarga de PDF 08 Digital
  const handleDownloadPdf = () => {
    // Importación dinámica de jsPDF para evitar crashes en Server-Side Rendering (SSR)
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF()

      // ── Encabezado Institucional ──────────────────────────────
      doc.setFillColor(34, 43, 69) // Azul marino oscuro corporativo
      doc.rect(0, 0, 210, 16, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('DIRECCIÓN NACIONAL DE LOS REGISTROS NACIONALES DE LA PROPIEDAD DEL AUTOMOTOR', 105, 10, { align: 'center' })

      // Título del formulario
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(15)
      doc.text('FORMULARIO 08 - SOLICITUD DE TRANSFERENCIA DIGITAL', 15, 30)

      doc.setFontSize(9)
      doc.setFont('Helvetica', 'normal')
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}`, 15, 36)
      doc.text(`ID de Trámite: #${tramite.id}`, 15, 42)

      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(15, 48, 195, 48)

      // ── Sección A: Datos del Vehículo ────────────────────
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('A. DATOS DEL AUTOMOTOR', 15, 56)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Patente / Dominio: MOCK-789`, 15, 63)
      doc.text(`Marca de fábrica: ${tramite.vehiculo_brand.toUpperCase()}`, 15, 69)
      doc.text(`Modelo comercial: ${tramite.vehiculo_model.toUpperCase()}`, 15, 75)
      doc.text(`Año / Modelo: ${tramite.vehiculo_year}`, 15, 81)
      doc.text(`Nro. Chasis: 8G3HD982173H921`, 15, 87)
      doc.text(`Nro. Motor: 1.4L-T-98716238`, 15, 93)

      doc.line(15, 99, 195, 99)

      // ── Sección B: Datos del Transmitente (Vendedor) ───────────
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('B. DATOS DEL TRANSMITENTE (VENDEDOR)', 15, 107)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Apellido y Nombres / Razón Social: AUTOYA S.A.', 15, 114)
      doc.text('C.U.I.T. / C.U.I.L.: 30-71122334-9', 15, 120)
      doc.text('Domicilio Real / Legal: Av. del Libertador 12500, San Isidro, Buenos Aires', 15, 126)
      doc.text('Porcentaje de titularidad a transmitir: 100%', 15, 132)

      doc.line(15, 138, 195, 138)

      // ── Sección C: Datos del Adquirente (Comprador) ───────────
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('C. DATOS DEL ADQUIRENTE (COMPRADOR)', 15, 146)

      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Apellido y Nombres: ${nombre.toUpperCase()}`, 15, 153)
      doc.text(`Documento (DNI): ${dni}`, 15, 159)
      doc.text(`C.U.I.L. / C.U.I.T.: ${ocrData?.cuil || 'XX-XXXXXXXX-X'}`, 15, 165)
      doc.text(`Domicilio Real: ${ocrData?.domicilio?.toUpperCase() || 'DOMICILIO PENDIENTE DE VALIDACIÓN'}`, 15, 171)

      // Cuadros de firmas certificadas
      doc.setDrawColor(180, 180, 180)
      doc.rect(15, 185, 80, 24)
      doc.rect(115, 185, 80, 24)

      doc.setFontSize(8)
      doc.text('Firma y Certificación (Vendedor)', 55, 213, { align: 'center' })
      doc.text('Firma y Certificación (Comprador)', 155, 213, { align: 'center' })

      // Pie de página
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      doc.text('* Borrador oficial preliminar emitido de forma automatizada por el sistema AutoYa Gestoría para pre-carga DNRPA.', 15, 235)
      doc.text('AutoYa Platform · Innovación Registral Automotriz.', 15, 240)

      doc.save(`Borrador_Formulario_08_${tramite.id.slice(0, 8)}.pdf`)

      // Registrar descarga en auditoría
      let userAudit = 'Gestoría'
      let roleAudit = 'role_gestoria'
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('autoya_user')
        if (userStr) {
          const u = JSON.parse(userStr)
          userAudit = u.name
          roleAudit = u.role
        }
      }
      fetch('/api/auditoria/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: userAudit,
          rol: roleAudit,
          accion: 'Descarga PDF Formulario 08',
          detalles: `Descargó borrador digital oficial en formato PDF para el trámite #${tramite.id.slice(0, 8)}`
        })
      }).catch(err => console.error('[Audit Log Error]', err))

    }).catch(err => {
      console.error('[PDF Exporter] Error loading jsPDF:', err)
      alert('Error al inicializar el motor de descarga de PDF.')
    })
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,6,10,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            width: '100%', maxWidth: 840,
            maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)',
          }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Dossier Registral · DNRPA
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
                Expediente: #{tramite.id.slice(0, 8)}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--fg-secondary)', cursor: 'pointer', padding: 6 }}>
              <X size={18} />
            </button>
          </div>

          {/* Tab Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            {[
              { id: 'expediente', label: 'Datos de Expediente' },
              { id: 'ocr', label: 'Escanear DNI (Gemini OCR)' },
              { id: 'formulario08', label: 'Borrador Formulario 08' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  flex: 1, padding: '14px 10px',
                  fontSize: 12, fontWeight: 600,
                  background: 'none', border: 'none',
                  color: activeTab === t.id ? 'var(--brand)' : 'var(--fg-secondary)',
                  borderBottom: `2px solid ${activeTab === t.id ? 'var(--brand)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Modal Split View */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'row' }} className="flex-col md:flex-row">
            
            {/* Left Column: Form / Action Area */}
            <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto', borderRight: '1px solid var(--border)', background: 'var(--bg-base)' }}>
              
              {activeTab === 'expediente' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {ocrErrorAlert && (
                    <div style={{
                      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: 4, padding: '12px 14px', fontSize: 11, color: '#f59e0b',
                      lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{ocrErrorAlert}</span>
                    </div>
                  )}

                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Datos del Comprador
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Nombre Completo (como figura en DNI)</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      style={{
                        padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Número de DNI</label>
                      <input
                        type="text"
                        value={dni}
                        onChange={e => setDni(e.target.value)}
                        style={{
                          padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                          borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Correo Electrónico</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                          padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                          borderRadius: 3, fontSize: 13, color: 'var(--fg-primary)', outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {ocrData && (
                    <div style={{
                      background: 'rgba(34,197,94,0.05)', border: '1px dashed rgba(34,197,94,0.3)',
                      borderRadius: 4, padding: '12px', fontSize: 11, color: 'var(--fg-secondary)',
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontWeight: 700 }}>
                        <ShieldCheck size={14} /> DNI validado mediante OCR con Inteligencia Artificial
                      </div>
                      <p style={{ margin: 0, fontSize: 10, color: 'var(--fg-tertiary)' }}>
                        CUIL: {ocrData.cuil} | Domicilio: {ocrData.domicilio} | Nacimiento: {ocrData.nacimiento}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, color: 'var(--fg-secondary)', fontWeight: 600 }}>Notas de Gestoría</label>
                    <textarea
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      style={{
                        padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 3, fontSize: 12, color: 'var(--fg-primary)', outline: 'none',
                        minHeight: 80, resize: 'none', lineHeight: 1.5,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        flex: 1, padding: '12px', background: 'var(--brand)', color: '#fff',
                        border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {saving ? 'Guardando...' : 'Guardar Expediente'}
                    </button>
                    {saved && (
                      <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={14} /> Guardado
                      </span>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'ocr' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 280 }}>
                  <div style={{ textAlign: 'center', maxWidth: 360 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg-primary)' }}>
                      Validación Documental por Visión
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      Cargue el frente del DNI argentino del comprador. Gemini extraerá los nombres, apellido, número, CUIL y domicilio para completar el expediente registral.
                    </p>
                  </div>

                  {processing ? (
                    <div style={{
                      width: '100%', maxWidth: 380, height: 160, borderRadius: 4,
                      border: '1px dashed var(--brand)', background: 'var(--brand-dim)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 12, color: 'var(--brand)',
                    }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} className="animate-spin" />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>Gemini Vision procesando DNI...</span>
                    </div>
                  ) : (
                    <label style={{
                      width: '100%', maxWidth: 380, height: 160, borderRadius: 4,
                      border: '1px dashed var(--border)', background: 'var(--bg-card)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 12, color: 'var(--fg-secondary)', cursor: 'pointer',
                    }} className="hover:border-[var(--brand)] hover:background-[var(--brand-dim)] transition-colors">
                      <Upload size={24} />
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-primary)' }}>Subir imagen de DNI</span>
                        <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginTop: 4 }}>Soporta JPG, PNG o WEBP de frente.</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              )}

              {activeTab === 'formulario08' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Borrador de Formulario 08 Digital
                    </h3>
                    <button
                      onClick={handleDownloadPdf}
                      style={{
                        padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--fg-primary)', borderRadius: 2, cursor: 'pointer', fontSize: 11,
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                      }}
                    >
                      <Download size={12} /> PDF
                    </button>
                  </div>

                  {/* Solicitud DNRPA style draft */}
                  <div style={{
                    background: '#fff', color: '#000', borderRadius: 4,
                    padding: '24px', fontSize: 11, fontFamily: 'monospace',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 10 }}>
                      <strong style={{ fontSize: 13 }}>DIRECCIÓN NACIONAL DE LOS REGISTROS NACIONALES</strong><br />
                      <strong>DE LA PROPIEDAD DEL AUTOMOTOR Y DE CRÉDITOS PRENDARIOS</strong><br />
                      <span style={{ fontSize: 10 }}>SOLICITUD DE TRANSFERENCIA - FORMULARIO 08 DIGITAL</span>
                    </div>

                    <div>
                      <strong style={{ borderBottom: '1px solid #000', display: 'block', paddingBottom: 2, marginBottom: 6 }}>A. DATOS DEL VEHÍCULO</strong>
                      DOMINIO/PATENTE: MOCK-789 | MARCA: {tramite.vehiculo_brand.toUpperCase()} | MODELO: {tramite.vehiculo_model.toUpperCase()} | AÑO: {tramite.vehiculo_year}<br />
                      TIPO: SEDAN/SUV | NRO CHASIS: 8G3HD982173H921 | NRO MOTOR: 1.4L-T-98716238
                    </div>

                    <div>
                      <strong style={{ borderBottom: '1px solid #000', display: 'block', paddingBottom: 2, marginBottom: 6 }}>B. DATOS DEL TRANSMITENTE (VENDEDOR)</strong>
                      APELLIDO Y NOMBRES / RAZÓN SOCIAL: AUTOYA S.A. | CUIT: 30-71122334-9<br />
                      DOMICILIO: AV. DEL LIBERTADOR 12500, SAN ISIDRO, GBA | PORCENTAJE TRANSMISIÓN: 100%
                    </div>

                    <div>
                      <strong style={{ borderBottom: '1px solid #000', display: 'block', paddingBottom: 2, marginBottom: 6 }}>C. DATOS DEL ADQUIRENTE (COMPRADOR)</strong>
                      APELLIDO Y NOMBRES: {nombre.toUpperCase()} | DNI: {dni}<br />
                      CUIL: {ocrData?.cuil || 'XX-XXXXXXXX-X'}<br />
                      DOMICILIO: {ocrData?.domicilio?.toUpperCase() || 'DOMICILIO PENDIENTE VALIDACIÓN DNI'}
                    </div>

                    <div style={{ borderTop: '1px dashed #000', paddingTop: 10, fontSize: 9, color: '#666' }}>
                      * Documento preliminar generado automáticamente por el sistema de gestoría registral AutoYa. Los datos de comprador y su firma deben certificarse ante Registro Seccional o Escribano Público.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Vehicle & Status Info */}
            <div style={{ flex: '0.8', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-tertiary)', marginBottom: 12 }}>
                  Unidad Vinculada
                </h3>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 4, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                      <Car size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-primary)' }}>
                        {tramite.vehiculo_brand} {tramite.vehiculo_model}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 2 }}>
                        Año {tramite.vehiculo_year}
                      </p>
                    </div>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--fg-secondary)' }}>Precio de seña:</span>
                    <strong style={{ color: 'var(--fg-primary)' }}>{formatARS(tramite.precio_ars)}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-tertiary)', marginBottom: 12 }}>
                  Estado de Trámite
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { id: 'reserva', label: 'Reserva Pagada', desc: 'MercadoPago/Transferencia recibida.' },
                    { id: 'validacion', label: 'Validación DNI', desc: 'Análisis y extracción OCR.' },
                    { id: 'formulario08', label: 'Borrador 08 Digital', desc: 'Borrador registral oficial.' },
                    { id: 'finalizado', label: 'Finalizado / Entregado', desc: 'Trámite inscripto ante la DNRPA.' },
                  ].map(step => {
                    const isCurrent = tramite.estado === step.id
                    return (
                      <div key={step.id} style={{
                        padding: '10px 12px', borderRadius: 4,
                        background: isCurrent ? 'var(--brand-dim)' : 'var(--bg-card)',
                        border: `1px solid ${isCurrent ? 'var(--brand-border)' : 'var(--border)'}`,
                        opacity: isCurrent ? 1 : 0.6,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: isCurrent ? 'var(--brand)' : 'var(--fg-secondary)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isCurrent ? 'var(--brand)' : 'var(--fg-tertiary)' }} />
                          {step.label}
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--fg-tertiary)', marginTop: 4, paddingLeft: 12 }}>
                          {step.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
