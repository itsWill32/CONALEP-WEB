import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Edit2, Trash, Plus } from 'lucide-react';

export default function NotificationsView({ onEdit, onViewDetail }) {
    const { data, remove } = useData();
    const [filterStatus, setFilterStatus] = useState("");

    const filteredData = filterStatus 
        ? data.notifications.filter(n => n.estado === filterStatus)
        : data.notifications;

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="filters">
                    <select 
                        className="search-input"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Rechazada">Rechazada</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={() => onEdit('notification', null)}>
                    <Plus size={18} /> Crear Notificación
                </button>
            </div>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Destinatarios</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th style={{textAlign:'right'}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(n => (
                            <tr key={n.id}>
                                <td onClick={() => onViewDetail(n)} style={{cursor:'pointer'}}><strong>{n.titulo}</strong></td>
                                <td>{n.destinatarios}</td>
                                <td>{n.fecha}</td>
                                <td><span className={`status-badge status-${n.estado.toLowerCase()}`}>{n.estado}</span></td>
                                <td style={{textAlign:'right'}}>
                                    <button className="action-btn btn-edit" onClick={() => onEdit('notification', n)}><Edit2 size={18}/></button>
                                    <button className="action-btn btn-delete" onClick={() => { if(confirm('¿Borrar?')) remove('notifications', n.id) }}><Trash size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}