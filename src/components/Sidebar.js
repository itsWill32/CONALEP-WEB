"use client";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  Layers, 
  Bell, 
  UploadCloud, 
  LogOut,
  Calendar,
  Lock,
  Shield  // 👈 NUEVO: Agregar Shield
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordModal from './modals/ChangePasswordModal';

export default function Sidebar({ activeTab, setActiveTab, isOpen }) {
    const { user, logout } = useAuth();
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Alumnos', icon: Users },
        { id: 'teachers', label: 'Maestros', icon: UserCheck },
        { id: 'classes', label: 'Clases', icon: BookOpen },
        { id: 'enrollments', label: 'Inscripciones', icon: Layers },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'admins', label: 'Administradores', icon: Shield }, // 👈 NUEVO
        { id: 'endofyear', label: 'Fin de Curso', icon: Calendar },
        { id: 'import', label: 'Importar CSV', icon: UploadCloud, sep: true },
    ];

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <GraduationCap size={24} color="#fff" />
                    </div>
                    <div className="brand-info">
                        <span className="logo-text">CONALEP 022</span>
                        <span className="logo-subtitle">Chiapa de Corzo, Chiapas</span>
                    </div>
                </div>
                
                <ul className="nav-links">
                    {menuItems.map(item => (
                        <li 
                            key={item.id} 
                            className="nav-item" 
                            style={item.sep ? { 
                                marginTop: 20, 
                                borderTop: '1px solid rgba(255,255,255,0.1)', 
                                paddingTop: 10 
                            } : {}}
                        >
                            <a 
                                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                                title={item.label}
                                style={{cursor: 'pointer'}}
                            >
                                <item.icon size={20} />
                                <span className="link-text">{item.label}</span>
                            </a>
                        </li>
                    ))}

                    {/* Botón de Cambiar Contraseña */}
                    <li className="nav-item" style={{marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                        <a 
                            className="nav-link"
                            onClick={() => setChangePasswordModalOpen(true)}
                            title="Cambiar Contraseña"
                            style={{cursor: 'pointer'}}
                        >
                            <Lock size={20} />
                            <span className="link-text">Cambiar Contraseña</span>
                        </a>
                    </li>

                    {/* Botón de Logout */}
                    <li className="nav-item">
                        <a 
                            className="nav-link"
                            onClick={logout}
                            title="Cerrar Sesión"
                            style={{cursor: 'pointer', color: '#fca5a5'}}
                        >
                            <LogOut size={20} />
                            <span className="link-text">Cerrar Sesión</span>
                        </a>
                    </li>
                </ul>

                {user && (
                    <div className="user-profile">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`} 
                            alt={user.nombre} 
                            className="user-avatar-img" 
                        />
                        <div className="user-info">
                            <div className="user-name">{user.nombre}</div>
                            <div className="user-role">Administrador</div>
                        </div>
                    </div>
                )}
            </aside>

            <ChangePasswordModal
                isOpen={changePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
            />
        </>
    );
}
