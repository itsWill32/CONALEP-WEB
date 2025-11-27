"use client";
import { useState } from 'react';
import { alumnosService, maestrosService, clasesService } from '@/services/api';
import toast from 'react-hot-toast';
import { FileText, AlertTriangle, Check, X, Edit2, Trash2, Eye } from 'lucide-react';

export default function ImportView() {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState([]);

  // --- Estilos para la barra de desplazamiento personalizada ---
  const customScrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      height: 10px; /* Reducido a 10px para ahorrar espacio */
      width: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 5px;
      border: 3px solid #f1f5f9;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #94a3b8;
    }
    /* Asegura que los inputs no rompan la tabla, min-width flexible */
    .table-input {
      width: 100%;
      box-sizing: border-box;
      min-width: 120px; 
      transition: all 0.2s;
    }
  `;

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }

      setPreviewData(data);
      setEditedData(data);
      setPreviewType(type);
      
      toast.success(`${data.length} registros cargados.`);
      e.target.value = '';

    } catch (error) {
      const message = error.response?.data?.error || 'Error al leer archivo';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!editedData || editedData.length === 0) {
      toast.error('No hay datos para importar');
      return;
    }

    setLoading(true);

    try {
      let previewResponse;
      if (previewType === 'alumnos') previewResponse = await alumnosService.previewCSV(editedData);
      else if (previewType === 'maestros') previewResponse = await maestrosService.previewCSV(editedData);
      else if (previewType === 'clases') previewResponse = await clasesService.previewCSV(editedData);

      const preview = previewResponse.preview;
      
      if (preview.errores > 0 || preview.duplicados > 0) {
        const message = `Total: ${preview.total}\nVálidos: ${preview.validos}\nErrores: ${preview.errores}\nDuplicados: ${preview.duplicados}\n\n¿Continuar? (Se omitirán errores)`;
        if (!confirm(message)) {
          setLoading(false);
          return;
        }
      }

      let importResponse;
      if (previewType === 'alumnos') importResponse = await alumnosService.importCSV(editedData, true);
      else if (previewType === 'maestros') importResponse = await maestrosService.importCSV(editedData, true);
      else if (previewType === 'clases') importResponse = await clasesService.importCSV(editedData, true);

      toast.success(`${importResponse.data.insertados} registros importados exitosamente`);
      
      handleCancelPreview();

    } catch (error) {
      const message = error.response?.data?.error || 'Error al importar datos';
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
  };

  const handleEditRow = (index) => setEditingRow(index);
  const handleSaveRow = (index) => {
    setEditingRow(null);
    toast.success('Fila actualizada');
  };

  const handleDeleteRow = (index) => {
    if (!confirm('¿Eliminar esta fila?')) return;
    const newData = editedData.filter((_, i) => i !== index);
    setEditedData(newData);
    setEditingRow(null);
    toast.success('Fila eliminada');
  };

  const handleFieldChange = (rowIndex, field, value) => {
    const newData = [...editedData];
    newData[rowIndex][field] = value;
    setEditedData(newData);
  };

  const getPreviewHeaders = () => {
    if (!editedData || editedData.length === 0) return [];
    return Object.keys(editedData[0]);
  };

  return (
    <>
      <style>{customScrollbarStyles}</style>

      {/* SECCIÓN DE VISTA PREVIA MEJORADA */}
      {previewData && (
        <div className="content-card" style={{ 
          marginBottom: 30, 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          // Ajuste clave para responsividad del CARD
          overflow: 'hidden', 
          width: '100%', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header de la tarjeta */}
          <div className="card-header" style={{ 
            background: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0', 
            padding: '16px 20px',
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 15
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: 8, background: '#e0f2fe', borderRadius: '50%', color: '#0284c7' }}>
                <Eye size={20} />
              </div>
              <div>
                <h4 style={{ color: '#0f172a', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Vista Previa: {previewType?.charAt(0).toUpperCase() + previewType?.slice(1)}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Mostrando {editedData.length} registros para importar
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCancelPreview} className="btn btn-outline" disabled={loading} style={{display: 'flex', alignItems:'center', gap: 6, padding: '8px 16px', fontSize: '0.9rem'}}>
                <X size={16} /> Cancelar
              </button>
              <button onClick={handleConfirmImport} className="btn btn-primary" disabled={loading || editedData.length === 0} style={{display: 'flex', alignItems:'center', gap: 6, padding: '8px 16px', fontSize: '0.9rem'}}>
                <Check size={16} /> {loading ? 'Procesando...' : 'Confirmar Importación'}
              </button>
            </div>
          </div>

          {/* Contenedor de la Tabla con Scroll Personalizado y Responsivo */}
          <div className="custom-scrollbar" style={{
            width: '100%',
            overflowX: 'auto', 
            overflowY: 'auto',
            maxHeight: '65vh', 
            position: 'relative',
            background: '#ffffff'
          }}>
            <table style={{ 
              width: 'max-content',
              minWidth: '100%',
              borderCollapse: 'separate', 
              borderSpacing: 0,
              fontSize: '0.85rem'
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                <tr>
                  {/* # Fijo */}
                  <th style={{ 
                    width: 50, padding: '12px', borderBottom: '1px solid #cbd5e1',
                    position: 'sticky', left: 0, background: '#f1f5f9', zIndex: 31,
                    textAlign: 'center', fontWeight: 600, color: '#475569',
                    boxShadow: '4px 0 8px -2px rgba(0,0,0,0.05)'
                  }}>#</th>
                  
                  {/* Headers */}
                  {getPreviewHeaders().map(header => (
                    <th key={header} style={{ 
                      padding: '12px 16px', borderBottom: '1px solid #cbd5e1',
                      whiteSpace: 'nowrap', fontWeight: 600, color: '#475569',
                      background: '#f1f5f9', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px'
                    }}>
                      {header.replace(/_/g, ' ')}
                    </th>
                  ))}
                  
                  {/* Acciones Fijo */}
                  <th style={{ 
                    width: 100, textAlign: 'center', padding: '12px', borderBottom: '1px solid #cbd5e1',
                    position: 'sticky', right: 0, background: '#f1f5f9', zIndex: 31,
                    fontWeight: 600, color: '#475569',
                    boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.05)'
                  }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {editedData.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ background: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'background 0.2s' }}>
                    
                    {/* # Celda Fija */}
                    <td style={{ 
                      fontWeight: 600, color: '#94a3b8', padding: '10px', 
                      borderBottom: '1px solid #e2e8f0',
                      position: 'sticky', left: 0, 
                      background: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc',
                      zIndex: 20, textAlign: 'center',
                      boxShadow: '4px 0 8px -2px rgba(0,0,0,0.05)'
                    }}>
                      {rowIndex + 1}
                    </td>
                    
                    {/* Datos */}
                    {getPreviewHeaders().map(header => (
                      <td key={header} style={{ 
                        padding: '8px 16px', borderBottom: '1px solid #e2e8f0', 
                        whiteSpace: 'nowrap'
                      }}>
                        {editingRow === rowIndex ? (
                          <input
                            type="text"
                            className="table-input" 
                            value={row[header] || ''}
                            onChange={(e) => handleFieldChange(rowIndex, header, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #3b82f6', 
                              borderRadius: '4px',
                              outline: 'none', 
                              fontSize: '0.85rem',
                              backgroundColor: '#fff',
                              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                            }}
                          />
                        ) : (
                          <span style={{ display: 'block', minWidth: '100px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row[header]}>
                            {row[header] || <span style={{color: '#cbd5e1'}}>-</span>}
                          </span>
                        )}
                      </td>
                    ))}
                    
                    {/* Acciones Celda Fija */}
                    <td style={{ 
                      textAlign: 'center', padding: '8px', 
                      borderBottom: '1px solid #e2e8f0',
                      position: 'sticky', right: 0, 
                      background: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc',
                      zIndex: 20,
                      boxShadow: '-4px 0 8px -2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {editingRow === rowIndex ? (
                          <button onClick={() => handleSaveRow(rowIndex)} className="btn-icon" style={{color: '#16a34a', background: '#dcfce7', border:'none', borderRadius: 4, padding: 6, cursor:'pointer'}}>
                            <Check size={16} />
                          </button>
                        ) : (
                          <button onClick={() => handleEditRow(rowIndex)} className="btn-icon" style={{color: '#3b82f6', background: '#dbeafe', border:'none', borderRadius: 4, padding: 6, cursor:'pointer'}}>
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteRow(rowIndex)} className="btn-icon" style={{color: '#ef4444', background: '#fee2e2', border:'none', borderRadius: 4, padding: 6, cursor:'pointer'}}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALERTAS */}
      <div className="alert-box">
        <AlertTriangle size={20} />
        <div>
          <strong>Nota Importante:</strong> Verifica que tu archivo CSV esté codificado en UTF-8 para mostrar correctamente tildes y ñ.
        </div>
      </div>

      <div className="import-grid">
        <div className="import-card">
          <span className="step-badge">1</span>
          <FileText size={32} color="var(--primary)" style={{marginBottom: 15}} />
          <h4>Importar Alumnos</h4>
          <p>Campos: nombre, apellido_paterno, grado, grupo, matricula, correo_institucional</p>
          <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'alumnos')} className="file-input" disabled={loading || previewData !== null} />
        </div>

        <div className="import-card">
          <span className="step-badge">2</span>
          <FileText size={32} color="var(--accent)" style={{marginBottom: 15}} />
          <h4>Importar Maestros</h4>
          <p>Campos: nombre, apellido_paterno, correo_login</p>
          <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'maestros')} className="file-input" disabled={loading || previewData !== null} />
        </div>

        <div className="import-card">
          <span className="step-badge">3</span>
          <FileText size={32} color="var(--secondary)" style={{marginBottom: 15}} />
          <h4>Importar Clases</h4>
          <p>Campos: nombre_clase, codigo_clase, correo_maestro</p>
          <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, 'clases')} className="file-input" disabled={loading || previewData !== null} />
        </div>
      </div>
    </>
  );
}