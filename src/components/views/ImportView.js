"use client";
import { useState } from 'react';
import { alumnosService, maestrosService, clasesService } from '@/services/api';
import toast from 'react-hot-toast';
import { FileText, AlertTriangle, Check, X, Edit2, Trash2, Eye, Download, UploadCloud, AlertCircle, ArrowRight, Info } from 'lucide-react';

export default function ImportView() {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState([]);
  const [encodingWarning, setEncodingWarning] = useState(false);

  // --- Estilos para Scrollbar ---
  const customScrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
    .table-input { width: 100%; min-width: 120px; transition: all 0.2s; }
  `;

  // Definición de columnas esperadas para validación y templates
  const schemas = {
    maestros: {
      headers: ['correo_login', 'nombre', 'apellido_paterno', 'apellido_materno', 'telefono'],
      example: 'juan.martinez@escuela.edu,Juan,Martínez,García,555-2001'
    },
    alumnos: {
      headers: ['nombre', 'apellido_paterno', 'apellido_materno', 'grado', 'grupo', 'matricula', 'correo_institucional', 'curp', 'telefono_contacto', 'direccion'],
      example: 'Ana,Gómez,Pérez,1,A,1A001,ana.gomez@inst.mx,GOPA010101HDFLNA01,5512345678,Calle Ficticia 101'
    },
    clases: {
      headers: ['nombre_clase', 'codigo_clase', 'correo_maestro', 'descripcion'],
      example: 'Matemáticas 1A,MAT101-A,juan.martinez@escuela.edu,Matemáticas básicas primer semestre grupo A'
    }
  };

  const downloadTemplate = (type) => {
    const schema = schemas[type];
    // Añadimos BOM para que Excel reconozca UTF-8 correctamente al abrirlo
    const bom = "\uFEFF"; 
    const csvContent = [
      schema.headers.join(','), // Cabecera
      schema.example            // Fila de ejemplo
    ].join('\n');

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `plantilla_importacion_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función simple para detectar Mojibake común (UTF-8 mal interpretado)
  const detectEncodingIssue = (text) => {
    // Patrones comunes de error de codificación:
    // Ã± (ñ), Ã¡ (á), Ã© (é), Ã (inicio de muchos errores), \uFFFD ( replacement character)
    const badPatterns = [/Ã±/g, /Ã¡/g, /Ã©/g, /Ã/g, /\uFFFD/g]; 
    return badPatterns.some(pattern => pattern.test(text));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setEncodingWarning(false); // Reset warning

    try {
      const text = await file.text();
      
      // Detección de problemas de codificación
      if (detectEncodingIssue(text)) {
        setEncodingWarning(true);
        toast((t) => (
          <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <AlertTriangle color="#f59e0b" />
            <div>
                <strong>¡Posible error de formato!</strong>
                <br/>Se detectaron caracteres extraños. Revisa la vista previa.
            </div>
          </div>
        ), { duration: 6000, style: { border: '1px solid #f59e0b' } });
      }

      const lines = text.split(/\r\n|\n/); // Manejar saltos de línea universales
      const fileHeaders = lines[0].split(',').map(h => h.trim());
      
      // VALIDACIÓN ESTRICTA DE CABECERAS
      const expectedHeaders = schemas[type].headers;
      const missingHeaders = expectedHeaders.filter(h => !fileHeaders.includes(h));

      if (missingHeaders.length > 0) {
        toast.error((
          <div style={{ fontSize: '0.9rem' }}>
            <strong>Formato Incorrecto:</strong><br/>
            Faltan las columnas: {missingHeaders.join(', ')}.<br/>
            Por favor descarga la plantilla correcta.
          </div>
        ), { duration: 5000 });
        e.target.value = ''; // Reset input
        return;
      }

      const data = [];
      // Empezar desde 1 para saltar cabecera
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        
        // Solo procesar si la fila tiene datos suficientes (al menos la mayoría de columnas)
        if (values.length >= expectedHeaders.length - 2) { 
            const row = {};
            fileHeaders.forEach((header, index) => {
              row[header] = values[index] || ''; // Manejar valores vacíos
            });
            data.push(row);
        }
      }

      if (data.length === 0) {
        toast.error('El archivo parece estar vacío o no tiene datos válidos.');
        return;
      }

      setPreviewData(data);
      setEditedData(data);
      setPreviewType(type);
      
      toast.success(`${data.length} registros leídos correctamente.`);
      e.target.value = '';

    } catch (error) {
      console.error(error);
      toast.error('Error al leer el archivo. Asegúrate de que sea un CSV válido (UTF-8).');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!editedData || editedData.length === 0) return;

    setLoading(true);
    try {
      let previewResponse;
      const serviceMap = { alumnos: alumnosService, maestros: maestrosService, clases: clasesService };
      const service = serviceMap[previewType];

      previewResponse = await service.previewCSV(editedData);
      const preview = previewResponse.preview;
      
      if (preview.errores > 0 || preview.duplicados > 0) {
        const message = `Resumen de validación:\n\n✅ Válidos: ${preview.validos}\n⚠️ Errores: ${preview.errores}\n🔁 Duplicados: ${preview.duplicados}\n\n¿Deseas continuar? Los registros con errores serán omitidos.`;
        if (!confirm(message)) {
          setLoading(false);
          return;
        }
      }

      const importResponse = await service.importCSV(editedData, true);
      toast.success(`Proceso finalizado: ${importResponse.data.insertados} registros importados.`);
      handleCancelPreview();

    } catch (error) {
      const message = error.response?.data?.error || 'Error crítico durante la importación';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    setEditedData([]);
    setPreviewType(null);
    setEditingRow(null);
    setEncodingWarning(false);
  };

  const handleEditRow = (index) => setEditingRow(index);
  const handleSaveRow = () => { setEditingRow(null); toast.success('Fila actualizada temporalmente'); };
  const handleDeleteRow = (index) => {
    if (!confirm('¿Omitir este registro de la importación?')) return;
    const newData = editedData.filter((_, i) => i !== index);
    setEditedData(newData);
    if (newData.length === 0) handleCancelPreview();
  };
  const handleFieldChange = (rowIndex, field, value) => {
    const newData = [...editedData];
    newData[rowIndex][field] = value;
    setEditedData(newData);
  };
  const getPreviewHeaders = () => editedData.length > 0 ? Object.keys(editedData[0]) : [];

  // --- Estilos de Tarjetas de Importación ---
  const stepCardStyle = {
    background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px',
    position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px',
    transition: 'all 0.2s ease'
  };

  const stepNumberStyle = {
    position: 'absolute', top: '-12px', left: '20px', background: '#0f172a', color: 'white',
    width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  };

  return (
    <>
      <style>{customScrollbarStyles}</style>

      {/* HEADER INFORMATIVO: ORDEN */}
      <div style={{ 
        background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '20px', marginBottom: '20px',
        display: 'flex', gap: '16px', alignItems: 'start'
      }}>
        <AlertCircle size={24} color="#0284c7" style={{ marginTop: '2px' }} />
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#075985', fontWeight: 700 }}>Orden Recomendado de Carga</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
            Sigue este orden para asegurar que las relaciones se creen correctamente:
            <br/>
            <strong>1. Maestros y Alumnos</strong> (Primero) <ArrowRight size={14} style={{display:'inline'}}/> <strong>2. Clases</strong> (Después).
          </p>
        </div>
      </div>

      {/* GUÍA VISUAL: FORMATO UTF-8 */}
      <div style={{ 
        background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '16px', padding: '20px', marginBottom: '30px',
        display: 'flex', gap: '16px', alignItems: 'start'
      }}>
        <Info size={24} color="#d97706" style={{ marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#92400e', fontWeight: 700 }}>
            ¿Cómo saber si mi archivo está bien?
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#78350f', lineHeight: '1.5' }}>
            Lo importante es cómo se ve <strong>AQUÍ</strong> en la previsualización. Si al subir el archivo ves los acentos bien, <strong>todo está correcto</strong> (aunque en Excel se vea raro).
          </p>
          
          {/* EJEMPLO VISUAL COMPARATIVO */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', 
            background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #fbbf24'
          }}>
            <div>
              <div style={{fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                <X size={14} /> ASÍ SE VE MAL (Codificación Incorrecta)
              </div>
              <div style={{fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b', background: '#fef2f2', padding: '8px', borderRadius: '6px', border: '1px dashed #fecaca'}}>
                GÃ³mez, PÃ©rez, MartÃnez
              </div>
              <p style={{fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0'}}>Símbolos extraños en lugar de acentos.</p>
            </div>
            <div>
              <div style={{fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                <Check size={14} /> ASÍ SE VE BIEN (Formato UTF-8)
              </div>
              <div style={{fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b', background: '#dcfce7', padding: '8px', borderRadius: '6px', border: '1px dashed #bbf7d0'}}>
                Gómez, Pérez, Martínez
              </div>
              <p style={{fontSize: '0.75rem', color: '#15803d', margin: '4px 0 0'}}>Acentos y Ñ legibles correctamente.</p>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: '1px solid #fcd34d' }}>
            <p style={{ margin: '0', fontSize: '0.85rem', color: '#78350f' }}>
              Si ves símbolos raros en la previsualización, vuelve a guardar tu archivo en Excel como: <br/>
              <strong>CSV UTF-8 (delimitado por comas) (*.csv)</strong>
            </p>
          </div>
        </div>
      </div>

      {/* VISTA PREVIA */}
      {previewData ? (
        <div className="content-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          
          {/* Header de Previsualización */}
          <div className="card-header" style={{ background: '#fff', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                Previsualizando: <span style={{ color: '#3b82f6', textTransform: 'capitalize' }}>{previewType}</span>
              </h4>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{editedData.length} registros detectados</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleCancelPreview} className="btn-outline" style={{padding:'8px 16px', borderRadius:'8px'}}>Cancelar</button>
                <button onClick={handleConfirmImport} className="btn-primary" style={{padding:'8px 16px', borderRadius:'8px'}} disabled={loading}>
                    {loading ? 'Importando...' : 'Confirmar y Guardar'}
                </button>
            </div>
          </div>

          {/* ALERTA DE CODIFICACIÓN DINÁMICA (Solo si se detecta error REAL) */}
          {encodingWarning && (
            <div style={{ background: '#fff1f2', borderBottom: '1px solid #fecaca', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, color: '#991b1b' }}>
              <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '50%' }}>
                <AlertTriangle size={24} color="#dc2626" />
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong style={{ fontSize: '1rem' }}>¡Atención: Caracteres extraños detectados!</strong>
                <br/>
                La previsualización muestra símbolos corruptos (ej: Ã±). Esto significa que el archivo NO se leerá correctamente.
                <br/>
                <span style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }} onClick={handleCancelPreview}>Cancela</span> y guarda el archivo como <strong>CSV UTF-8</strong> antes de subirlo.
              </div>
            </div>
          )}
          
          <div className="custom-scrollbar" style={{ overflowX: 'auto', maxHeight: '60vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', width: '50px', textAlign: 'center', color: '#64748b' }}>#</th>
                  {getPreviewHeaders().map(h => (
                    <th key={h} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>
                        {h.replace('_', ' ')}
                    </th>
                  ))}
                  <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', width: '80px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editedData.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#fbfbfb' }}>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>{idx + 1}</td>
                    {getPreviewHeaders().map(header => (
                        <td key={header} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                            {editingRow === idx ? (
                                <input 
                                    className="table-input"
                                    value={row[header]} 
                                    onChange={(e) => handleFieldChange(idx, header, e.target.value)}
                                    style={{ padding: '6px', border: '1px solid #3b82f6', borderRadius: '4px', outline: 'none' }}
                                />
                            ) : (
                                <span style={{ fontSize: '0.9rem', color: '#334155' }}>{row[header]}</span>
                            )}
                        </td>
                    ))}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {editingRow === idx ? (
                                <button onClick={handleSaveRow} style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16}/></button>
                            ) : (
                                <button onClick={() => handleEditRow(idx)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16}/></button>
                            )}
                            <button onClick={() => handleDeleteRow(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- GRID DE CARGA --- */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* PASO 1: Maestros */}
          <div style={stepCardStyle} className="hover-lift">
            <div style={stepNumberStyle}>1</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: '#f3e8ff', borderRadius: '10px', color: '#7c3aed' }}>
                    <FileText size={24} />
                </div>
                <h4 style={{ margin: 0, color: '#1e293b' }}>Importar Maestros</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Base de datos del personal docente. Necesario antes de crear clases.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => downloadTemplate('maestros')} className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    <Download size={16} style={{ marginRight: 8 }} /> Descargar Plantilla
                </button>
                <label className="btn-primary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UploadCloud size={18} />
                    Subir CSV Maestros
                    <input type="file" accept=".csv" hidden onChange={(e) => handleFileUpload(e, 'maestros')} />
                </label>
            </div>
          </div>

          {/* PASO 1b: Alumnos (Paralelo) */}
          <div style={stepCardStyle} className="hover-lift">
            <div style={stepNumberStyle}>1</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: '#e0f2fe', borderRadius: '10px', color: '#0284c7' }}>
                    <FileText size={24} />
                </div>
                <h4 style={{ margin: 0, color: '#1e293b' }}>Importar Alumnos</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Listado general de estudiantes. Asegúrate de incluir matricula y correo.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => downloadTemplate('alumnos')} className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    <Download size={16} style={{ marginRight: 8 }} /> Descargar Plantilla
                </button>
                <label className="btn-primary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UploadCloud size={18} />
                    Subir CSV Alumnos
                    <input type="file" accept=".csv" hidden onChange={(e) => handleFileUpload(e, 'alumnos')} />
                </label>
            </div>
          </div>

          {/* PASO 2: Clases */}
          <div style={{...stepCardStyle, border: '2px dashed #cbd5e1', background: '#f8fafc'}}>
            <div style={{...stepNumberStyle, background: '#475569'}}>2</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '10px', color: '#16a34a' }}>
                    <FileText size={24} />
                </div>
                <h4 style={{ margin: 0, color: '#1e293b' }}>Importar Clases</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Relaciona materias con maestros. <strong style={{color: '#dc2626'}}>Requiere correos de maestros válidos.</strong>
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => downloadTemplate('clases')} className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', background: 'white' }}>
                    <Download size={16} style={{ marginRight: 8 }} /> Descargar Plantilla
                </button>
                <label className="btn-primary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px', background: '#475569' }}>
                    <UploadCloud size={18} />
                    Subir CSV Clases
                    <input type="file" accept=".csv" hidden onChange={(e) => handleFileUpload(e, 'clases')} />
                </label>
            </div>
          </div>

        </div>
      )}

      <style jsx global>{`
        .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
            border-color: #cbd5e1;
        }
      `}</style>
    </>
  );
}