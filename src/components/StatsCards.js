"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, Book, TrendingUp, X, PieChart, MousePointerClick, Upload, ClipboardList, Bell } from 'lucide-react';
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
    
    // Estado para controlar qué modal específico abrir
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEntity, setModalEntity] = useState(null); // 'students', 'teachers', 'classes'
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

    // Función unificada para abrir el modal correcto según la entidad
    const openEditModal = (entity, item) => {
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
        setRefreshKey(prev => prev + 1); // Forzar recarga de la vista actual
    };

    // --- ESTILOS DE DASHBOARD ---
    const statCardStyle = {
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease',
        cursor: 'default'
    };

    const statIconBoxStyle = (color, bg) => ({
        background: bg,
        color: color,
        padding: '12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    const quickAccessBtnStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        color: '#475569',
        fontSize: '0.95rem',
        fontWeight: 600
    };

    if (authLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'var(--bg-body)'
            }}>
                <div style={{textAlign: 'center'}}>
                    <Loader2 className="spin" size={40} color="#3b82f6" style={{marginBottom: 16}} />
                    <p style={{color: 'var(--text-muted)'}}>Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const renderContent = () => {
        switch(activeTab) {
            case 'students': return <StudentsView key={refreshKey} onEdit={openEditModal} />;
            case 'teachers': return <TeachersView key={refreshKey} onEdit={openEditModal} />;
            case 'classes': return <ClassesView key={refreshKey} onEdit={openEditModal} />;
            case 'enrollments': return <EnrollmentsView key={refreshKey} onManage={openManager} />;
            case 'notifications': return <NotificationsView onViewDetail={openDetail} />;
            case 'import': return <ImportView />;
            case 'endofyear': return <EndOfYearView />;    
            case 'dashboard': 
            default:
                return (
                    <div id="dashboard-section" className="section">
                        {/* Grid de Estadísticas (KPIs) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            
                            <div style={statCardStyle} className="hover-scale">
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Total Alumnos</p>
                                    <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>{data.stats?.alumnos?.total || 0}</h3>
                                </div>
                                <div style={statIconBoxStyle('#3b82f6', '#eff6ff')}>
                                    <Users size={24} />
                                </div>
                            </div>

                            <div style={statCardStyle} className="hover-scale">
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Total Maestros</p>
                                    <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>{data.stats?.maestros?.total || 0}</h3>
                                </div>
                                <div style={statIconBoxStyle('#8b5cf6', '#f3e8ff')}>
                                    <UserCheck size={24} />
                                </div>
                            </div>

                            <div style={statCardStyle} className="hover-scale">
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Clases Activas</p>
                                    <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>{data.stats?.clases?.total || 0}</h3>
                                </div>
                                <div style={statIconBoxStyle('#10b981', '#ecfdf5')}>
                                    <Book size={24} />
                                </div>
                            </div>

                            <div style={statCardStyle} className="hover-scale">
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Notificaciones</p>
                                    <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>{data.stats?.notificaciones_pendientes || 0}</h3>
                                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Pendientes</span>
                                </div>
                                <div style={statIconBoxStyle('#f59e0b', '#fffbeb')}>
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
                            
                            {/* Tarjeta: Distribución de Alumnos */}
                            <div className="content-card" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PieChart size={20} color="#64748b" />
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Distribución por Grupo</h4>
                                </div>
                                {data.stats?.distribucion_alumnos && data.stats.distribucion_alumnos.length > 0 ? (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                                                <tr>
                                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Grado</th>
                                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Grupo</th>
                                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.stats.distribucion_alumnos.map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 24px', color: '#334155', fontWeight: 500 }}>{item.grado}° Semestre</td>
                                                        <td style={{ padding: '12px 24px', color: '#64748b' }}>Grupo "{item.grupo}"</td>
                                                        <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                                                            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                                                                {item.total}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        <p>No hay datos de distribución disponibles</p>
                                    </div>
                                )}
                            </div>

                            {/* Tarjeta: Accesos Rápidos */}
                            <div className="content-card" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <MousePointerClick size={20} color="#64748b" />
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Accesos Rápidos</h4>
                                </div>
                                <div style={{ padding: '24px', display: 'grid', gap: '12px' }}>
                                    <button 
                                        style={quickAccessBtnStyle} 
                                        onClick={() => setActiveTab('import')}
                                        className="hover-card"
                                    >
                                        <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px', color: '#16a34a' }}><Upload size={20} /></div>
                                        Importar Base de Datos
                                    </button>
                                    <button 
                                        style={quickAccessBtnStyle} 
                                        onClick={() => setActiveTab('enrollments')}
                                        className="hover-card"
                                    >
                                        <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '8px', color: '#0284c7' }}><ClipboardList size={20} /></div>
                                        Gestionar Inscripciones
                                    </button>
                                    <button 
                                        style={quickAccessBtnStyle} 
                                        onClick={() => setActiveTab('notifications')}
                                        className="hover-card"
                                    >
                                        <div style={{ background: '#fff7ed', padding: '8px', borderRadius: '8px', color: '#ea580c' }}><Bell size={20} /></div>
                                        Ver Notificaciones
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
            
            <main className="main-content" style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                <header style={{ marginBottom: '30px' }}> 
                    <h2 id="page-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                        {activeTab === 'dashboard' ? 'Panel de Control' : 
                         activeTab === 'students' ? 'Gestión de Alumnos' :
                         activeTab === 'teachers' ? 'Gestión de Maestros' :
                         activeTab === 'classes' ? 'Gestión de Clases' :
                         activeTab === 'enrollments' ? 'Inscripciones' :
                         activeTab === 'notifications' ? 'Notificaciones' :
                         activeTab === 'import' ? 'Importar Datos' :
                         activeTab === 'endofyear' ? 'Cierre de Ciclo Escolar' :
                         activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.95rem' }}>
                        {activeTab === 'dashboard' ? 'Bienvenido al sistema de gestión escolar' : 'Administra la información de tu institución'}
                    </p>
                </header>

                {renderContent()}
            </main>

            {/* --- MODALES --- */}
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
                onSuccess={() => setRefreshKey(prev => prev + 1)}
            />
            {detailOpen && detailItem && (
                <div className="modal-overlay show" onClick={() => setDetailOpen(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header-clean">
                            <h3>{detailItem.titulo}</h3>
                            <button className="close-btn" onClick={() => setDetailOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background:'#f8fafc', padding:20, borderRadius:12, marginBottom:20, border:'1px solid #eee' }}>
                                <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:10, fontSize:'0.9rem' }}>
                                    <div><strong>Para:</strong> {detailItem.destinatarios || detailItem.tipo_destinatario}</div>
                                    <div><strong>Fecha:</strong> {detailItem.fecha_creacion?.split('T')[0]}</div>
                                    <div><strong>Estado:</strong> 
                                        <span style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 6, fontSize: '0.85rem',
                                            background: detailItem.status === 'Aprobada' ? '#d1fae5' : detailItem.status === 'Pendiente' ? '#fef3c7' : '#fee2e2',
                                            color: detailItem.status === 'Aprobada' ? '#065f46' : detailItem.status === 'Pendiente' ? '#92400e' : '#991b1b'
                                        }}>{detailItem.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ lineHeight:1.8, color:'#333', fontSize:'1rem', whiteSpace: 'pre-wrap' }}>{detailItem.mensaje}</div>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .hover-scale:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
                .hover-card:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateX(4px); }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}