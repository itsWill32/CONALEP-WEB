"use client";
import { useState } from 'react';
import { Users, UserCheck, Book, TrendingUp, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useData } from '@/context/DataContext';
import StudentsView from '@/components/views/StudentsView';
import TeachersView from '@/components/views/TeachersView';
import ClassesView from '@/components/views/ClassesView';
import EnrollmentsView from '@/components/views/EnrollmentsView';
import NotificationsView from '@/components/views/NotificationsView';
import ImportView from '@/components/views/ImportView';
import GenericModal from '@/components/modals/GenericModal';
import ManagerModal from '@/components/modals/ManagerModal';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalEntity, setModalEntity] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    
    const [managerOpen, setManagerOpen] = useState(false);
    const [managerClass, setManagerClass] = useState(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    const { data, update } = useData();

    const openGenericModal = (entity, item) => {
        setModalEntity(entity);
        setEditingItem(item);
        setModalOpen(true);
    };

    const openManager = (classItem) => {
        setManagerClass(classItem);
        setManagerOpen(true);
    };

    const openDetail = (item) => {
        setDetailItem(item);
        setDetailOpen(true);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'students': return <StudentsView onEdit={openGenericModal} />;
            case 'teachers': return <TeachersView onEdit={openGenericModal} />;
            case 'classes': return <ClassesView onEdit={openGenericModal} />;
            case 'enrollments': return <EnrollmentsView onManage={openManager} />;
            case 'notifications': return <NotificationsView onEdit={openGenericModal} onViewDetail={openDetail} />;
            case 'import': return <ImportView />;
            case 'dashboard': 
            default:
                return (
                    <div id="dashboard-section" className="section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-info"><h3>{data.students.length}</h3><p>Alumnos</p></div>
                                <div className="stat-icon"><Users /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info"><h3>{data.teachers.length}</h3><p>Maestros</p></div>
                                <div className="stat-icon"><UserCheck /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info"><h3>{data.classes.length}</h3><p>Clases Totales</p></div>
                                <div className="stat-icon"><Book /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info"><h3>{data.enrollments.length}</h3><p>Inscripciones</p></div>
                                <div className="stat-icon"><TrendingUp /></div>
                            </div>
                        </div>

                        <div className="grid-section">
                            <div className="content-card">
                                <div className="card-header"><h4>Población Estudiantil</h4></div>
                                <div style={{height: 250, background: '#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa'}}>
                                    Gráfica de Alumnos
                                </div>
                            </div>
                            <div className="content-card">
                                <div className="card-header"><h4>Accesos Rápidos</h4></div>
                                <div style={{display:'grid', gap:10}}>
                                    <button className="btn btn-outline" style={{justifyContent:'flex-start'}} onClick={() => setActiveTab('import')}>
                                        Importar Base de Datos
                                    </button>
                                    <button className="btn btn-outline" style={{justifyContent:'flex-start'}} onClick={() => setActiveTab('enrollments')}>
                                        Gestionar Inscripciones
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{display:'flex'}}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={true} />
            
            <main className="main-content">
                <header style={{justifyContent: 'center', position: 'relative'}}> 
                    <h2 id="page-title" style={{textAlign: 'center', width: '100%'}}>
                        {activeTab === 'dashboard' ? 'Dashboard General' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                </header>

                {renderContent()}
            </main>

            <GenericModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)}
                entity={modalEntity}
                item={editingItem}
            />

            <ManagerModal 
                isOpen={managerOpen}
                onClose={() => setManagerOpen(false)}
                classItem={managerClass}
            />

            {detailOpen && detailItem && (
                <div className="modal-overlay show">
                    <div className="modal-container">
                        <div className="modal-header-clean">
                            <h3>{detailItem.titulo}</h3>
                            <button className="close-btn" onClick={() => setDetailOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{background:'#f8fafc', padding:20, borderRadius:12, marginBottom:20, border:'1px solid #eee'}}>
                                <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:10, fontSize:'0.9rem'}}>
                                    <div><strong>Para:</strong> {detailItem.destinatarios}</div>
                                    <div><strong>Fecha:</strong> {detailItem.fecha}</div>
                                    <div><strong>Estado:</strong> {detailItem.estado}</div>
                                </div>
                            </div>
                            <div style={{lineHeight:1.8, color:'#333', fontSize:'1rem'}}>{detailItem.mensaje}</div>
                            {detailItem.estado === 'Pendiente' && (
                                <div style={{marginTop:30, textAlign:'right', borderTop:'1px solid #eee', paddingTop:20}}>
                                    <button className="btn btn-primary" onClick={() => {
                                        update('notifications', detailItem.id, {estado: 'Aprobada'});
                                        setDetailOpen(false);
                                    }}>Aprobar y Publicar</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}