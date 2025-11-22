import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Edit2, Trash, Plus } from 'lucide-react';

export default function StudentsView({ onEdit }) {
    const { data, remove } = useData();
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");

    const filteredData = data.students.filter(s => 
        (s.nombre.toLowerCase().includes(search.toLowerCase()) || s.matricula.includes(search)) &&
        (gradeFilter === "" || s.grado == gradeFilter)
    );

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="filters">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Buscar alumno..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select 
                        className="search-input" 
                        style={{ width: 'auto' }} 
                        value={gradeFilter} 
                        onChange={(e) => setGradeFilter(e.target.value)}
                    >
                        <option value="">Todos los Grados</option>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}°</option>)}
                    </select>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => onEdit('student', null)}>
                        <Plus size={18}/> Nuevo Alumno
                    </button>
                </div>
            </div>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Matrícula ↕</th>
                            <th>Nombre ↕</th>
                            <th>Email</th>
                            <th>Grado ↕</th>
                            <th>Grupo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(s => (
                            <tr key={s.id}>
                                <td>{s.matricula}</td>
                                <td><div style={{fontWeight:500, color:'var(--primary-dark)'}}>{s.nombre} {s.apellidoP}</div></td>
                                <td>{s.email}</td>
                                <td>{s.grado}°</td>
                                <td>{s.grupo}</td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => onEdit('student', s)}>
                                        <Edit2 size={18}/>
                                    </button>
                                    <button className="action-btn btn-delete" onClick={() => { if(confirm('¿Borrar?')) remove('students', s.id) }}>
                                        <Trash size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}