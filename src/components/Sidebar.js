import { GraduationCap, LayoutDashboard, Users, UserCheck, BookOpen, Layers, Bell, UploadCloud } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Alumnos', icon: Users },
        { id: 'teachers', label: 'Maestros', icon: UserCheck },
        { id: 'classes', label: 'Clases', icon: BookOpen },
        { id: 'enrollments', label: 'Inscripciones', icon: Layers },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'import', label: 'Importar CSV', icon: UploadCloud, sep: true },
    ];

    return (
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
                    <li key={item.id} className="nav-item" style={item.sep ? { marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 } : {}}>
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
            </ul>

            <div className="user-profile">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="user-avatar-img" />
                <div className="user-info">
                    <div className="user-name">Admin</div>
                    <div className="user-role">Principal</div>
                </div>
            </div>
        </aside>
    );
}