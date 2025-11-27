"use client";
import { useState, useEffect } from 'react';
import { X, User, GraduationCap, BookOpen, Bell, Save, Loader2, AlignLeft, Mail, Phone, MapPin, Calendar, Hash, FileText } from 'lucide-react';
import { useData } from '@/context/DataContext';
import toast from 'react-hot-toast';

export default function GenericModal({ isOpen, onClose, entity, item }) {
    const { 
        data,
        addStudent, updateStudent,
        addTeacher, updateTeacher,
        addClass, updateClass,
        addNotification
    } = useData();
    
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Configuración visual según la entidad
    const getEntityConfig = () => {
        switch(entity) {
            case 'student': return { 
                icon: User, color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                label: 'Alumno', shadow: 'rgba(37, 99, 235, 0.2)' 
            };
            case 'teacher': return { 
                icon: GraduationCap, color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                label: 'Maestro', shadow: 'rgba(124, 58, 237, 0.2)' 
            };
            case 'class': return { 
                icon: BookOpen, color: '#10b981', bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                label: 'Clase', shadow: 'rgba(5, 150, 105, 0.2)' 
            };
            case 'notification': return { 
                icon: Bell, color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                label: 'Notificación', shadow: 'rgba(217, 119, 6, 0.2)' 
            };
            default: return { 
                icon: FileText, color: '#64748b', bg: '#64748b', 
                label: entity, shadow: 'rgba(0,0,0,0.1)' 
            };
        }
    };

    const config = getEntityConfig();
    const Icon = config.icon;

    useEffect(() => {
        if (item) {
            // Modo edición
            setFormData(item);
        } else {
            // Modo creación
            if (entity === 'notification') {
                setFormData({ 
                    tipo_destinatario: 'Todos_Alumnos',
                    destinatarios: []
                });
            } else {
                setFormData({});
            }
        }
    }, [item, entity, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (entity === 'student') {
                if (item) await updateStudent(item.alumno_id, formData);
                else await addStudent(formData);
            } else if (entity === 'teacher') {
                if (item) await updateTeacher(item.maestro_id, formData);
                else await addTeacher(formData);
            } else if (entity === 'class') {
                if (item) await updateClass(item.clase_id, formData);
                else await addClass(formData);
            } else if (entity === 'notification') {
                const notifData = {
                    titulo: formData.titulo,
                    mensaje: formData.mensaje,
                    tipo_destinatario: formData.tipo_destinatario
                };

                if (['Alumno_Especifico', 'Multiples_Alumnos', 'Materia_Completa', 'Multiples_Materias'].includes(formData.tipo_destinatario)) {
                    notifData.destinatarios = Array.isArray(formData.destinatarios) 
                        ? formData.destinatarios 
                        : [formData.destinatarios];
                } else if (formData.tipo_destinatario === 'Grado_Completo') {
                    notifData.grado = parseInt(formData.grado);
                } else if (formData.tipo_destinatario === 'Grupo_Especifico') {
                    notifData.grado = parseInt(formData.grado);
                    notifData.grupo = formData.grupo;
                }
                await addNotification(notifData);
            }
            onClose();
            toast.success(`${config.label} ${item ? 'actualizado' : 'creado'} correctamente`);
        } catch (error) {
            console.error('Error en formulario:', error);
            toast.error(`Error al guardar ${config.label.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    // Estilos reutilizables
    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '0.95rem',
        color: '#334155',
        backgroundColor: '#f8fafc',
        outline: 'none',
        transition: 'all 0.2s ease'
    };

    const labelStyle = {
        display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#475569'
    };

    const focusHandler = (e) => {
        e.target.style.borderColor = config.color;
        e.target.style.backgroundColor = '#fff';
        e.target.style.boxShadow = `0 0 0 4px ${config.shadow.replace('0.2', '0.1')}`;
    };

    const blurHandler = (e) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.backgroundColor = '#f8fafc';
        e.target.style.boxShadow = 'none';
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay show" style={{
            zIndex: 9999,
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="modal-container" style={{
                width: '90%', maxWidth: "800px",
                maxHeight: '90vh',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex', flexDirection: 'column',
                animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
            }}>
                {/* --- HEADER --- */}
                <div className="modal-header" style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            background: config.bg,
                            padding: '12px',
                            borderRadius: '14px',
                            boxShadow: `0 4px 6px -1px ${config.shadow}`,
                            color: 'white'
                        }}>
                            <Icon size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                {item ? 'Editar' : 'Nuevo'} {config.label}
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                                Complete la información solicitada
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '8px', borderRadius: '50%', color: '#94a3b8', transition: '0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#ef4444' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    <form id="dynamic-form" onSubmit={handleSubmit}>
                        
                        {/* FORMULARIO DE ALUMNO */}
                        {entity === 'student' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                                <div><label style={labelStyle}>Nombre *</label>
                                    <input name="nombre" value={formData.nombre || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Apellido Paterno *</label>
                                    <input name="apellido_paterno" value={formData.apellido_paterno || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Apellido Materno</label>
                                    <input name="apellido_materno" value={formData.apellido_materno || ''} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Matrícula *</label>
                                    <input name="matricula" value={formData.matricula || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                
                                <div><label style={labelStyle}>Grado *</label>
                                    <select name="grado" value={formData.grado || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                        <option value="">Seleccionar...</option>
                                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                                    </select>
                                </div>
                                <div><label style={labelStyle}>Grupo *</label>
                                    <select name="grupo" value={formData.grupo || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                        <option value="">Seleccionar...</option>
                                        {['A','B','C','D'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}><Mail size={16} style={{display:'inline', marginRight:6}}/>Email Institucional *</label>
                                    <input type="email" name="correo_institucional" value={formData.correo_institucional || ''} onChange={handleChange} required placeholder="nombre@alumno.conalep.edu.mx" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
                                </div>

                                <div><label style={labelStyle}><Calendar size={16} style={{display:'inline', marginRight:6}}/>Fecha de Nacimiento</label>
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}><Hash size={16} style={{display:'inline', marginRight:6}}/>CURP</label>
                                    <input name="curp" value={formData.curp || ''} onChange={handleChange} maxLength={18} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}><Phone size={16} style={{display:'inline', marginRight:6}}/>Teléfono de Contacto</label>
                                    <input type="tel" name="telefono_contacto" value={formData.telefono_contacto || ''} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}><MapPin size={16} style={{display:'inline', marginRight:6}}/>Dirección</label>
                                    <input name="direccion" value={formData.direccion || ''} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
                                </div>
                            </div>
                        )}

                        {/* FORMULARIO DE MAESTRO */}
                        {entity === 'teacher' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                                <div><label style={labelStyle}>Nombre *</label>
                                    <input name="nombre" value={formData.nombre || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Apellido Paterno *</label>
                                    <input name="apellido_paterno" value={formData.apellido_paterno || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Apellido Materno</label>
                                    <input name="apellido_materno" value={formData.apellido_materno || ''} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}><Mail size={16} style={{display:'inline', marginRight:6}}/>Email de Login *</label>
                                    <input type="email" name="correo_login" value={formData.correo_login || ''} onChange={handleChange} required placeholder="nombre@conalep.edu.mx" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
                                </div>
                                
                                <div><label style={labelStyle}><Phone size={16} style={{display:'inline', marginRight:6}}/>Teléfono</label>
                                    <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                            </div>
                        )}

                        {/* FORMULARIO DE CLASE */}
                        {entity === 'class' && (
                            <div style={{ display: 'grid', gap: '24px' }}>
                                <div><label style={labelStyle}>Nombre de la Clase *</label>
                                    <input name="nombre_clase" value={formData.nombre_clase || ''} onChange={handleChange} required placeholder="Ej: Matemáticas III" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Código de Clase *</label>
                                    <input name="codigo_clase" value={formData.codigo_clase || ''} onChange={handleChange} required placeholder="Ej: MAT-301" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
                                <div><label style={labelStyle}>Maestro *</label>
                                    <select name="maestro_id" value={formData.maestro_id || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                        <option value="">Seleccionar maestro...</option>
                                        {data.teachers.map(t => (
                                            <option key={t.maestro_id} value={t.maestro_id}>{t.nombre} {t.apellido_paterno} {t.apellido_materno}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* FORMULARIO DE NOTIFICACIÓN */}
                        {entity === 'notification' && (
                            <div style={{ display: 'grid', gap: '24px' }}>
                                <div><label style={labelStyle}>Título *</label>
                                    <input name="titulo" value={formData.titulo || ''} onChange={handleChange} required placeholder="Ej: Suspensión de clases" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>

                                <div><label style={labelStyle}><AlignLeft size={16} style={{display:'inline', marginRight:6}}/>Tipo de Destinatario *</label>
                                    <select name="tipo_destinatario" value={formData.tipo_destinatario || 'Todos_Alumnos'} onChange={handleChange} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                        <option value="Todos_Alumnos">Todos los Alumnos</option>
                                        <option value="Grado_Completo">Grado Completo</option>
                                        <option value="Grupo_Especifico">Grupo Específico</option>
                                        <option value="Materia_Completa">Materia Completa</option>
                                        <option value="Multiples_Materias">Múltiples Materias</option>
                                        <option value="Alumno_Especifico">Alumno Específico</option>
                                        <option value="Multiples_Alumnos">Múltiples Alumnos</option>
                                    </select>
                                </div>

                                {/* Campos condicionales */}
                                {formData.tipo_destinatario === 'Grado_Completo' && (
                                    <div><label style={labelStyle}>Grado *</label>
                                        <select name="grado" value={formData.grado || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                            <option value="">Seleccionar...</option>
                                            {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                                        </select>
                                    </div>
                                )}

                                {formData.tipo_destinatario === 'Grupo_Especifico' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div><label style={labelStyle}>Grado *</label>
                                            <select name="grado" value={formData.grado || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                                <option value="">Seleccionar...</option>
                                                {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}°</option>)}
                                            </select></div>
                                        <div><label style={labelStyle}>Grupo *</label>
                                            <select name="grupo" value={formData.grupo || ''} onChange={handleChange} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                                <option value="">Seleccionar...</option>
                                                {['A','B','C','D'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select></div>
                                    </div>
                                )}

                                {['Materia_Completa', 'Alumno_Especifico'].includes(formData.tipo_destinatario) && (
                                    <div><label style={labelStyle}>{formData.tipo_destinatario === 'Materia_Completa' ? 'Materia' : 'Alumno'} *</label>
                                        <select name="destinatarios" value={formData.destinatarios?.[0] || ''} onChange={(e) => setFormData(prev => ({...prev, destinatarios: [parseInt(e.target.value)]}))} required style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
                                            <option value="">Seleccionar...</option>
                                            {formData.tipo_destinatario === 'Materia_Completa' 
                                                ? data.classes.map(c => <option key={c.clase_id} value={c.clase_id}>{c.nombre_clase} ({c.codigo_clase})</option>)
                                                : data.students.map(s => <option key={s.alumno_id} value={s.alumno_id}>{s.nombre} {s.apellido_paterno} - {s.matricula}</option>)
                                            }
                                        </select>
                                    </div>
                                )}

                                {formData.tipo_destinatario === 'Multiples_Materias' && (
                                    <div><label style={labelStyle}>Materias * (Ctrl/Cmd + Clic para múltiples)</label>
                                        <select name="destinatarios" value={formData.destinatarios || []} onChange={(e) => { const selected = Array.from(e.target.selectedOptions).map(o => parseInt(o.value)); setFormData(prev => ({...prev, destinatarios: selected})); }} multiple required style={{...inputStyle, minHeight: 120}} onFocus={focusHandler} onBlur={blurHandler}>
                                            {data.classes.map(c => <option key={c.clase_id} value={c.clase_id}>{c.nombre_clase} ({c.codigo_clase})</option>)}
                                        </select>
                                    </div>
                                )}

                                <div><label style={labelStyle}>Mensaje *</label>
                                    <textarea name="mensaje" rows="5" style={{...inputStyle, resize: 'vertical'}} required value={formData.mensaje || ''} onChange={handleChange} placeholder="Escribe el mensaje de la notificación..." onFocus={focusHandler} onBlur={blurHandler}></textarea>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer" style={{
                            marginTop: '32px',
                            paddingTop: '24px',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'flex-end', gap: '12px'
                        }}>
                            <button type="button" onClick={onClose} disabled={loading} style={{
                                padding: '12px 20px', borderRadius: '12px', border: '1px solid #cbd5e1',
                                background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                            }} onMouseEnter={e => e.target.style.background = '#f8fafc'} onMouseLeave={e => e.target.style.background = 'white'}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} style={{
                                padding: '12px 24px', borderRadius: '12px', border: 'none',
                                background: config.bg, color: 'white', fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: `0 4px 12px ${config.shadow}`, transition: 'all 0.2s'
                            }}>
                                {loading ? <Loader2 className="spin" size={18} /> : <><Save size={18} /> Guardar</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx global>{`
                @keyframes modalSlideIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}