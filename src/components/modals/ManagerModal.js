import { useState } from 'react';
import { X, UserPlus, Users, XCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function ManagerModal({ isOpen, onClose, classItem }) {
    const { data, add, remove } = useData();
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");

    if (!isOpen || !classItem) return null;

    const teacher = data.teachers.find(t => t.id === classItem.maestroId);
    const enrollments = data.enrollments.filter(e => e.materiaId === classItem.id);
    const currentStudentIds = enrollments.map(e => e.alumnoId);
    
    const eligibleStudents = data.students.filter(s => !currentStudentIds.includes(s.id));
    
    const groups = Array.from(new Set(data.students.map(s => `${s.grado}-${s.grupo}`))).sort();

    const handleAddSingle = () => {
        if(!selectedStudent) return;
        add('enrollments', { alumnoId: selectedStudent, materiaId: classItem.id, fecha: '2024-01-01' });
        setSelectedStudent("");
    };

    const handleAddBulk = () => {
        if(!selectedGroup) return;
        const [g, gr] = selectedGroup.split('-');
        const toAdd = data.students.filter(s => s.grado == g && s.grupo == gr && !currentStudentIds.includes(s.id));
        toAdd.forEach(s => add('enrollments', { alumnoId: s.id, materiaId: classItem.id, fecha: '2024-01-01' }));
        setSelectedGroup("");
    };

    return (
        <div className="modal-overlay show">
            <div className="modal-container" style={{maxWidth: 900}}>
                 <div className="modal-header-clean">
                    <div>
                        <h3>{classItem.nombre}</h3>
                        <p style={{color: 'var(--text-muted)', margin:0}}>{teacher ? teacher.nombre : 'Sin Maestro'} - {classItem.grado}{classItem.grupo}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X /></button>
                </div>

                <div className="modal-body">
                    <div className="manager-actions" style={{display:'flex', gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #eee', flexWrap:'wrap'}}>
                        <div style={{flex: 1, minWidth: 250}}>
                            <h4 style={{fontSize: '0.9rem', marginBottom: 8, color: 'var(--primary)'}}>Inscribir Alumno Individual</h4>
                            <div style={{display: 'flex', gap: 10}}>
                                <select className="search-input" style={{flex:1}} value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                                    <option value="">Seleccionar Alumno...</option>
                                    {eligibleStudents.map(s => <option key={s.id} value={s.id}>{s.nombre} {s.apellidoP}</option>)}
                                </select>
                                <button className="btn btn-primary btn-sm" onClick={handleAddSingle}><UserPlus size={18} /></button>
                            </div>
                        </div>
                        <div style={{flex: 1, minWidth: 250}}>
                            <h4 style={{fontSize: '0.9rem', marginBottom: 8, color: 'var(--accent)'}}>Inscribir Grupo Completo</h4>
                            <div style={{display: 'flex', gap: 10}}>
                                <select className="search-input" style={{flex:1}} value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                                    <option value="">Seleccionar Grado/Grupo</option>
                                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <button className="btn btn-secondary btn-sm" onClick={handleAddBulk}><Users size={18} /> Bulk</button>
                            </div>
                        </div>
                    </div>

                    <h4 style={{marginBottom: 15}}>Alumnos Inscritos ({enrollments.length})</h4>
                    <div className="table-responsive" style={{maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8}}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Matrícula</th>
                                    <th>Alumno</th>
                                    <th>Grado/Grupo</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map(e => {
                                    const s = data.students.find(st => st.id === e.alumnoId);
                                    if(!s) return null;
                                    return (
                                        <tr key={e.id}>
                                            <td>{s.matricula}</td>
                                            <td>{s.nombre} {s.apellidoP}</td>
                                            <td>{s.grado}° {s.grupo}</td>
                                            <td><button className="action-btn text-danger" onClick={() => remove('enrollments', e.id)}><XCircle size={18}/></button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}