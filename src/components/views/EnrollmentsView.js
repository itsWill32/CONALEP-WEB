import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Book } from 'lucide-react';

export default function EnrollmentsView({ onManage }) {
    const { data } = useData();
    const [search, setSearch] = useState("");

    const filteredClasses = data.classes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="content-card" style={{background: 'transparent', boxShadow: 'none', padding: 0, border: 'none'}}>
            <div className="card-header">
                <h3 style={{color: 'var(--secondary)'}}>Gestión de Inscripciones por Clase</h3>
                 <div className="filters">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Filtrar materia..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="classes-grid" id="enrollments-grid">
                {filteredClasses.map(c => {
                    const enrolledCount = data.enrollments.filter(e => e.materiaId === c.id).length;
                    const percentage = Math.min(100, (enrolledCount / c.capacidad) * 100);
                    const teacher = data.teachers.find(t => t.id === c.maestroId);
                    
                    let colorClass = '';
                    if(percentage > 80) colorClass = 'warning';
                    if(percentage >= 100) colorClass = 'full';

                    return (
                        <div key={c.id} className="class-card-item" onClick={() => onManage(c)}>
                            <div className="class-header">
                                <div className="class-icon-wrapper"><Book size={24} /></div>
                                <div style={{textAlign:'right'}}><span style={{fontSize:'1.4rem', fontWeight:700, color:'var(--text-muted)', opacity:0.3}}>{c.grado}{c.grupo}</span></div>
                            </div>
                            <div className="class-title">{c.nombre}</div>
                            <div className="class-subtitle">{teacher ? teacher.nombre : 'Sin Maestro'}</div>
                            <div className="progress-container">
                                <div className="progress-bar"><div className={`progress-fill ${colorClass}`} style={{width: `${percentage}%`}}></div></div>
                                <div className="progress-text">
                                    <span>{enrolledCount} Alumnos</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}