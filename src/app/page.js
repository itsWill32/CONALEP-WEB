"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, Book, TrendingUp, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import StudentsView from '@/components/views/StudentsView';
import TeachersView from '@/components/views/TeachersView';
import ClassesView from '@/components/views/ClassesView';
import EnrollmentsView from '@/components/views/EnrollmentsView';
import NotificationsView from '@/components/views/NotificationsView';
import ImportView from '@/components/views/ImportView';
import EndOfYearView from '@/components/views/EndOfYearView';
import EditStudentModal from '@/components/modals/EditStudentModal';
import EditTeacherModal from '@/components/modals/EditTeacherModal';
import EditClassModal from '@/components/modals/EditClassModal';
import ManagerModal from '@/components/modals/ManagerModal';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEntity, setModalEntity] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [managerOpen, setManagerOpen] = useState(false);
    const [managerClass, setManagerClass] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const { data, fetchStats, loading } = useData();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (activeTab === 'dashboard' && user && !authLoading) {
            fetchStats();
        }
    }, [activeTab, user, authLoading]);

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

    const handleModalSuccess = () => {
        setModalOpen(false);
        setModalEntity(null);
        setEditingItem(null);
        setRefreshKey(prev => prev + 1);
    };

    if (authLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-body)'
            }}>
                <div style={{textAlign: 'center'}}>
                    <div className="spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p style={{color: 'var(--text-muted)'}}>Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'students': 
                return <StudentsView key={refreshKey} onEdit={openGenericModal} />;
            case 'teachers': 
                return <TeachersView key={refreshKey} onEdit={openGenericModal} />;
            case 'classes': 
                return <ClassesView key={refreshKey} onEdit={openGenericModal} />;
            case 'enrollments': 
                return <EnrollmentsView key={refreshKey} onManage={openManager} />;
            case 'notifications': 
                return <NotificationsView onEdit={openGenericModal} onViewDetail={openDetail} />;
            case 'import': 
                return <ImportView />;
            case 'endofyear': 
                return <EndOfYearView />;    
            case 'dashboard': 
            default:
                return (
                    <div id="dashboard-section" className="section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>{data.stats?.alumnos?.total || 0}</h3>
                                    <p>Alumnos</p>
                                </div>
                                <div className="stat-icon"><Users /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>{data.stats?.maestros?.total || 0}</h3>
                                    <p>Maestros</p>
                                </div>
                                <div className="stat-icon"><UserCheck /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>{data.stats?.clases?.total || 0}</h3>
                                    <p>Clases Totales</p>
                                </div>
                                <div className="stat-icon"><Book /></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <h3>{data.stats?.notificaciones_pendientes || 0}</h3>
                                    <p>Notif. Pendientes</p>
                                </div>
                                <div className="stat-icon"><TrendingUp /></div>
                            </div>
                        </div>

                        <div className="grid-section" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px'}}>
                            <div className="content-card">
                                <div className="card-header"><h4>Distribución de Alumnos</h4></div>
                                {data.stats?.distribucion_alumnos && data.stats.distribucion_alumnos.length > 0 ? (
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Grado</th>
                                                    <th>Grupo</th>
                                                    <th>Alumnos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.stats.distribucion_alumnos.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.grado}°</td>
                                                        <td>{item.grupo}</td>
                                                        <td><strong>{item.total}</strong></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                                        <p>No hay datos de distribución</p>
                                    </div>
                                )}
                            </div>

                            <div className="content-card">
                                <div className="card-header"><h4>Accesos Rápidos</h4></div>
                                <div style={{display:'grid', gap:10}}>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{justifyContent:'flex-start', textAlign: 'left'}} 
                                        onClick={() => setActiveTab('import')}
                                    >
                                        📥 Importar Base de Datos
                                    </button>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{justifyContent:'flex-start', textAlign: 'left'}} 
                                        onClick={() => setActiveTab('enrollments')}
                                    >
                                        📋 Gestionar Inscripciones
                                    </button>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{justifyContent:'flex-start', textAlign: 'left'}} 
                                        onClick={() => setActiveTab('notifications')}
                                    >
                                        🔔 Ver Notificaciones
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
                        {activeTab === 'dashboard' ? 'Dashboard General' : 
                         activeTab === 'students' ? 'Gestión de Alumnos' :
                         activeTab === 'teachers' ? 'Gestión de Maestros' :
                         activeTab === 'classes' ? 'Gestión de Clases' :
                         activeTab === 'enrollments' ? 'Inscripciones' :
                         activeTab === 'notifications' ? 'Notificaciones' :
                         activeTab === 'import' ? 'Importar Datos' :
                         activeTab === 'endofyear' ? 'Fin de Curso' :
                         activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                </header>

                {renderContent()}
            </main>

            {/* ✅ REEMPLAZA GenericModal CON LOS 3 MODALES ESPECÍFICOS */}
            <EditStudentModal
                isOpen={modalOpen && modalEntity === 'students'}
                onClose={() => setModalOpen(false)}
                student={editingItem}
                onSuccess={handleModalSuccess}
            />

            <EditTeacherModal
                isOpen={modalOpen && modalEntity === 'teachers'}
                onClose={() => setModalOpen(false)}
                teacher={editingItem}
                onSuccess={handleModalSuccess}
            />

            <EditClassModal
                isOpen={modalOpen && modalEntity === 'classes'}
                onClose={() => setModalOpen(false)}
                classItem={editingItem}
                onSuccess={handleModalSuccess}
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
                            <button className="close-btn" onClick={() => setDetailOpen(false)}>
                                <X />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                background:'#f8fafc', 
                                padding:20, 
                                borderRadius:12, 
                                marginBottom:20, 
                                border:'1px solid #eee'
                            }}>
                                <div style={{
                                    display:'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap:10, 
                                    fontSize:'0.9rem'
                                }}>
                                    <div><strong>Para:</strong> {detailItem.destinatarios || detailItem.tipo_destinatario}</div>
                                    <div><strong>Fecha:</strong> {detailItem.fecha_creacion}</div>
                                    <div><strong>Estado:</strong> 
                                        <span style={{
                                            marginLeft: 8,
                                            padding: '4px 12px',
                                            borderRadius: 6,
                                            fontSize: '0.85rem',
                                            background: detailItem.status === 'Aprobada' ? '#d1fae5' :
                                                       detailItem.status === 'Pendiente' ? '#fef3c7' : '#fee2e2',
                                            color: detailItem.status === 'Aprobada' ? '#065f46' :
                                                   detailItem.status === 'Pendiente' ? '#92400e' : '#991b1b'
                                        }}>
                                            {detailItem.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{lineHeight:1.8, color:'#333', fontSize:'1rem'}}>
                                {detailItem.mensaje}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
