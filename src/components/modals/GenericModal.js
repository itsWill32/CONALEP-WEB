"use client";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
                if (item) {
                    await updateStudent(item.alumno_id, formData);
                } else {
                    await addStudent(formData);
                }
            } else if (entity === 'teacher') {
                if (item) {
                    await updateTeacher(item.maestro_id, formData);
                } else {
                    await addTeacher(formData);
                }
            } else if (entity === 'class') {
                if (item) {
                    await updateClass(item.clase_id, formData);
                } else {
                    await addClass(formData);
                }
            } else if (entity === 'notification') {
                // Preparar datos de notificación
                const notifData = {
                    titulo: formData.titulo,
                    mensaje: formData.mensaje,
                    tipo_destinatario: formData.tipo_destinatario
                };

                // Agregar campos según tipo
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
        } catch (error) {
            console.error('Error en formulario:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay show">
            <div className="modal-container">
                <div className="modal-header-clean">
                    <h3>
                        {item ? 'Editar' : 'Nuevo'} {
                            entity === 'student' ? 'Alumno' :
                            entity === 'teacher' ? 'Maestro' :
                            entity === 'class' ? 'Clase' :
                            entity === 'notification' ? 'Notificación' :
                            entity
                        }
                    </h3>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </div>

                <div className="modal-body">
                    <form id="dynamic-form" onSubmit={handleSubmit}>
                        
                        {/* FORMULARIO DE ALUMNO */}
                        {entity === 'student' && (
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15}}>
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input 
                                        name="nombre" 
                                        value={formData.nombre || ''} 
                                        onChange={handleChange} 
                                        required 
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido Paterno *</label>
                                    <input 
                                        name="apellido_paterno" 
                                        value={formData.apellido_paterno || ''} 
                                        onChange={handleChange} 
                                        required 
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido Materno</label>
                                    <input 
                                        name="apellido_materno" 
                                        value={formData.apellido_materno || ''} 
                                        onChange={handleChange} 
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Matrícula *</label>
                                    <input 
                                        name="matricula" 
                                        value={formData.matricula || ''} 
                                        onChange={handleChange}
                                        required
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Grado *</label>
                                    <select 
                                        name="grado" 
                                        value={formData.grado || ''} 
                                        onChange={handleChange}
                                        required
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Grupo *</label>
                                    <select 
                                        name="grupo" 
                                        value={formData.grupo || ''} 
                                        onChange={handleChange}
                                        required
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {['A','B','C','D'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                    <label>Email Institucional *</label>
                                    <input 
                                        type="email"
                                        name="correo_institucional" 
                                        value={formData.correo_institucional || ''} 
                                        onChange={handleChange}
                                        required
                                        placeholder="nombre@alumno.conalep.edu.mx"
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha de Nacimiento</label>
                                    <input 
                                        type="date"
                                        name="fecha_nacimiento" 
                                        value={formData.fecha_nacimiento || ''} 
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CURP</label>
                                    <input 
                                        name="curp" 
                                        value={formData.curp || ''} 
                                        onChange={handleChange}
                                        maxLength={18}
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono de Contacto</label>
                                    <input 
                                        type="tel"
                                        name="telefono_contacto" 
                                        value={formData.telefono_contacto || ''} 
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                    <label>Dirección</label>
                                    <input 
                                        name="direccion" 
                                        value={formData.direccion || ''} 
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                            </div>
                        )}

                        {/* FORMULARIO DE MAESTRO */}
                        {entity === 'teacher' && (
                            <div style={{display: 'grid', gap: 15}}>
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input 
                                        name="nombre" 
                                        value={formData.nombre || ''} 
                                        onChange={handleChange} 
                                        required 
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido Paterno *</label>
                                    <input 
                                        name="apellido_paterno" 
                                        value={formData.apellido_paterno || ''} 
                                        onChange={handleChange} 
                                        required 
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Apellido Materno</label>
                                    <input 
                                        name="apellido_materno" 
                                        value={formData.apellido_materno || ''} 
                                        onChange={handleChange} 
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email de Login *</label>
                                    <input 
                                        type="email"
                                        name="correo_login" 
                                        value={formData.correo_login || ''} 
                                        onChange={handleChange}
                                        required
                                        placeholder="nombre@conalep.edu.mx"
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input 
                                        type="tel"
                                        name="telefono" 
                                        value={formData.telefono || ''} 
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                            </div>
                        )}

                        {/* FORMULARIO DE CLASE */}
                        {entity === 'class' && (
                            <div style={{display: 'grid', gap: 15}}>
                                <div className="form-group">
                                    <label>Nombre de la Clase *</label>
                                    <input 
                                        name="nombre_clase" 
                                        value={formData.nombre_clase || ''} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Ej: Matemáticas III"
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Código de Clase *</label>
                                    <input 
                                        name="codigo_clase" 
                                        value={formData.codigo_clase || ''} 
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: MAT-301"
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Maestro *</label>
                                    <select 
                                        name="maestro_id" 
                                        value={formData.maestro_id || ''} 
                                        onChange={handleChange}
                                        required
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    >
                                        <option value="">Seleccionar maestro...</option>
                                        {data.teachers.map(t => (
                                            <option key={t.maestro_id} value={t.maestro_id}>
                                                {t.nombre} {t.apellido_paterno} {t.apellido_materno}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* FORMULARIO DE NOTIFICACIÓN */}
                        {entity === 'notification' && (
                            <div style={{display: 'grid', gap: 15}}>
                                <div className="form-group">
                                    <label>Título *</label>
                                    <input 
                                        name="titulo" 
                                        value={formData.titulo || ''} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Ej: Suspensión de clases"
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tipo de Destinatario *</label>
                                    <select 
                                        name="tipo_destinatario" 
                                        value={formData.tipo_destinatario || 'Todos_Alumnos'} 
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                    >
                                        <option value="Todos_Alumnos">Todos los Alumnos</option>
                                        <option value="Grado_Completo">Grado Completo</option>
                                        <option value="Grupo_Especifico">Grupo Específico</option>
                                        <option value="Materia_Completa">Materia Completa</option>
                                        <option value="Multiples_Materias">Múltiples Materias</option>
                                        <option value="Alumno_Especifico">Alumno Específico</option>
                                        <option value="Multiples_Alumnos">Múltiples Alumnos</option>
                                    </select>
                                </div>

                                {/* Campos condicionales según tipo */}
                                {formData.tipo_destinatario === 'Grado_Completo' && (
                                    <div className="form-group">
                                        <label>Grado *</label>
                                        <select 
                                            name="grado" 
                                            value={formData.grado || ''} 
                                            onChange={handleChange}
                                            required
                                            style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                                        </select>
                                    </div>
                                )}

                                {formData.tipo_destinatario === 'Grupo_Especifico' && (
                                    <>
                                        <div className="form-group">
                                            <label>Grado *</label>
                                            <select 
                                                name="grado" 
                                                value={formData.grado || ''} 
                                                onChange={handleChange}
                                                required
                                                style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Grupo *</label>
                                            <select 
                                                name="grupo" 
                                                value={formData.grupo || ''} 
                                                onChange={handleChange}
                                                required
                                                style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {['A','B','C','D'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {formData.tipo_destinatario === 'Materia_Completa' && (
                                    <div className="form-group">
                                        <label>Materia *</label>
                                        <select 
                                            name="destinatarios" 
                                            value={formData.destinatarios?.[0] || ''} 
                                            onChange={(e) => setFormData(prev => ({...prev, destinatarios: [parseInt(e.target.value)]}))}
                                            required
                                            style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                        >
                                            <option value="">Seleccionar materia...</option>
                                            {data.classes.map(c => (
                                                <option key={c.clase_id} value={c.clase_id}>
                                                    {c.nombre_clase} ({c.codigo_clase})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.tipo_destinatario === 'Multiples_Materias' && (
                                    <div className="form-group">
                                        <label>Materias * (mantén Ctrl/Cmd para seleccionar múltiples)</label>
                                        <select 
                                            name="destinatarios" 
                                            value={formData.destinatarios || []} 
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions).map(o => parseInt(o.value));
                                                setFormData(prev => ({...prev, destinatarios: selected}));
                                            }}
                                            multiple
                                            required
                                            style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, minHeight: 120}}
                                        >
                                            {data.classes.map(c => (
                                                <option key={c.clase_id} value={c.clase_id}>
                                                    {c.nombre_clase} ({c.codigo_clase})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.tipo_destinatario === 'Alumno_Especifico' && (
                                    <div className="form-group">
                                        <label>Alumno *</label>
                                        <select 
                                            name="destinatarios" 
                                            value={formData.destinatarios?.[0] || ''} 
                                            onChange={(e) => setFormData(prev => ({...prev, destinatarios: [parseInt(e.target.value)]}))}
                                            required
                                            style={{width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8}}
                                        >
                                            <option value="">Seleccionar alumno...</option>
                                            {data.students.map(s => (
                                                <option key={s.alumno_id} value={s.alumno_id}>
                                                    {s.nombre} {s.apellido_paterno} - {s.matricula}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Mensaje *</label>
                                    <textarea 
                                        name="mensaje" 
                                        rows="5" 
                                        style={{width:'100%', padding:'10px', border: '1px solid #e2e8f0', borderRadius: 8, resize: 'vertical'}} 
                                        required 
                                        value={formData.mensaje || ''} 
                                        onChange={handleChange}
                                        placeholder="Escribe el mensaje de la notificación..."
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer" style={{border:'none', padding:0, marginTop:25}}>
                            <button 
                                type="button" 
                                className="btn btn-outline" 
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
