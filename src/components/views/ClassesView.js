import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Edit2, Trash, Plus } from 'lucide-react';

export default function ClassesView({ onEdit }) {
    const { data, remove } = useData();
    const [search, setSearch] = useState("");

    const filteredData = data.classes.filter(c => 
        c.nombre.toLowerCase().includes(search.toLowerCase()) || c.codigo.toLowerCase().includes(search.toLowerCase())
    );

    return (
         <div className="content-card">
            <div className="card-header">
                 <div className="filters">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Buscar materia..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary" onClick={() => onEdit('class', null)}>
                    <Plus size={18}/> Nueva Clase
                </button>
            </div>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th style={{width: '15%'}}>CÓDIGO</th>
                            <th style={{width: '25%'}}>NOMBRE</th>
                            <th style={{width: '25%'}}>MAESTRO</th>
                            <th style={{width: '15%'}}>ALUMNOS</th>
                            <th style={{width: '20%', textAlign: 'right'}}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(c => {
                            const teacher = data.teachers.find(t => t.id === c.maestroId);
                            const studentCount = data.enrollments.filter(e => e.materiaId === c.id).length;
                            return (
                                <tr key={c.id}>
                                    <td style={{fontWeight:600, color:'var(--text-muted)'}}>{c.codigo}</td>
                                    <td><div style={{fontWeight:600, color:'var(--secondary)'}}>{c.nombre} {c.grado}{c.grupo}</div></td>
                                    <td>{teacher ? teacher.nombre : <span style={{color:'#999'}}>Sin Asignar</span>}</td>
                                    <td><span style={{background:'#f1f5f9', padding:'5px 12px', borderRadius:'20px', fontWeight:600}}>{studentCount}</span></td>
                                    <td style={{textAlign: 'right'}}>
                                        <button className="action-btn btn-edit" onClick={() => onEdit('class', c)}><Edit2 size={18}/></button>
                                        <button className="action-btn btn-delete" onClick={() => { if(confirm('¿Borrar?')) remove('classes', c.id) }}><Trash size={18}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}