import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Edit2, Trash, Plus } from 'lucide-react';

export default function TeachersView({ onEdit }) {
    const { data, remove } = useData();
    const [search, setSearch] = useState("");

    const filteredData = data.teachers.filter(t => t.nombre.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="filters">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Buscar maestro..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => onEdit('teacher', null)}>
                        <Plus size={18}/> Nuevo Maestro
                    </button>
                </div>
            </div>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(t => (
                            <tr key={t.id}>
                                <td><div style={{fontWeight:500, color:'var(--secondary)'}}>{t.nombre}</div></td>
                                <td>{t.email}</td>
                                <td>{t.telefono}</td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => onEdit('teacher', t)} title="Editar">
                                        <Edit2 size={18}/>
                                    </button>
                                    <button className="action-btn btn-delete" onClick={() => { if(confirm('¿Borrar?')) remove('teachers', t.id) }} title="Eliminar">
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