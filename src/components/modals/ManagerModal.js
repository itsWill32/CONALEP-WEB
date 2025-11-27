"use client";
import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Users, XCircle, Search, GraduationCap, School, Loader2, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';
import { inscripcionesService, alumnosService } from '@/services/api';
import toast from 'react-hot-toast';
import PasswordConfirmModal from './PasswordConfirmModal';

export default function ManagerModal({ isOpen, onClose, classItem, onSuccess }) {
  const { data } = useData();
  const { grados, loading } = useGradosGrupos();

  const [activeTab, setActiveTab] = useState("individual");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Para autocomplete
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Para password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [inscripcionToDelete, setInscripcionToDelete] = useState(null);

  useEffect(() => {
    if (isOpen && classItem) {
      loadEnrollments();
      loadAllStudents();
    }
  }, [isOpen, classItem]);

  const loadAllStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await alumnosService.getAll({ limit: 10000 });
      setAllStudents(response.data || []);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Error al cargar alumnos");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedGrado("");
      setSelectedGrupo("");
      setSelectedStudent(null);
      setSearch("");
      setShowDropdown(false);
      setActiveTab("individual");
      setAllStudents([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const response = await inscripcionesService.getByClase(classItem.clase_id);
      setEnrollments(response.data || []);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      toast.error("Error al cargar inscripciones");
    } finally {
      setLoadingEnrollments(false);
    }
  };

  if (!isOpen || !classItem) return null;

  const teacher = data.teachers?.find((t) => t.maestro_id === classItem.maestro_id);
  const currentStudentIds = enrollments.map((e) => e.alumno_id);
  const eligibleStudents = allStudents.filter((s) => !currentStudentIds.includes(s.alumno_id));

  const gruposDisponibles = selectedGrado
    ? [...new Set(eligibleStudents.filter((s) => s.grado === parseInt(selectedGrado)).map((s) => s.grupo))].sort()
    : [];

  const filteredStudents =
    search.length >= 2
      ? eligibleStudents
          .filter(
            (s) =>
              `${s.nombre} ${s.apellido_paterno} ${s.apellido_materno || ""}`
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              s.matricula.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 10)
      : [];

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearch(
      `${student.matricula} - ${student.nombre} ${student.apellido_paterno} (${student.grado}°${student.grupo})`
    );
    setShowDropdown(false);
  };

  const handleAddSingle = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await inscripcionesService.create(selectedStudent.alumno_id, classItem.clase_id);
      toast.success("Alumno inscrito exitosamente");
      await loadEnrollments();
      setSelectedStudent(null);
      setSearch("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.error || "Error al inscribir alumno");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddGroup = async () => {
    if (!selectedGrado || !selectedGrupo) {
      toast.error("Selecciona grado y grupo");
      return;
    }
    const toAdd = eligibleStudents.filter(
      (s) => s.grado === parseInt(selectedGrado) && s.grupo === selectedGrupo
    );
    if (toAdd.length === 0) {
      toast.error("No hay alumnos disponibles en ese grupo");
      return;
    }
    if (!confirm(`¿Inscribir ${toAdd.length} alumnos del grupo ${selectedGrado}°${selectedGrupo}?`)) {
      return;
    }
    setSubmitting(true);
    try {
      await inscripcionesService.createGrupoCompleto(
        parseInt(selectedGrado),
        selectedGrupo,
        classItem.clase_id
      );
      toast.success(`${toAdd.length} alumnos inscritos exitosamente`);
      await loadEnrollments();
      setSelectedGrado("");
      setSelectedGrupo("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.error || "Error al inscribir grupo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (password) => {
    if (!inscripcionToDelete) return;
    try {
      await inscripcionesService.delete(inscripcionToDelete, password);
      toast.success("Inscripción eliminada");
      await loadEnrollments();
      if (onSuccess) onSuccess();
      setPasswordModalOpen(false);
      setInscripcionToDelete(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.error || "Error al eliminar inscripción");
      throw error;
    }
  };

  // Estilos comunes
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: '#334155',
    backgroundColor: '#f8fafc',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <>
      <div className="modal-overlay show" onClick={onClose} style={{
        zIndex: 9999,
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%', maxWidth: "850px",
            maxHeight: '90vh',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', flexDirection: 'column',
            animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          {/* --- HEADER --- */}
          <div className="modal-header" style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                padding: '12px',
                borderRadius: '14px',
                boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.2)',
                color: 'white'
              }}>
                <GraduationCap size={28} strokeWidth={2} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  {classItem.nombre_clase}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 500 }}>{classItem.codigo_clase}</span> • 
                  {teacher ? `${teacher.nombre} ${teacher.apellido_paterno}` : "Sin Maestro Asignado"}
                </p>
              </div>
            </div>
            <button onClick={onClose} disabled={submitting} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '50%', color: '#94a3b8', transition: '0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* --- BODY --- */}
          <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            
            {/* TABS DE NAVEGACIÓN */}
            <div style={{
              display: "flex",
              padding: "4px",
              backgroundColor: "#f1f5f9",
              borderRadius: "16px",
              marginBottom: "30px",
              gap: "4px"
            }}>
              <button
                onClick={() => setActiveTab("individual")}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  background: activeTab === "individual" ? "white" : "transparent",
                  color: activeTab === "individual" ? "#0284c7" : "#64748b",
                  border: "none",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  display: "flex", alignItems: "center", justifyContent: 'center', gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === "individual" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none"
                }}
              >
                <UserPlus size={18} /> Inscribir Individual
              </button>
              <button
                onClick={() => setActiveTab("group")}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "10px 20px",
                  background: activeTab === "group" ? "white" : "transparent",
                  color: activeTab === "group" ? "#0284c7" : "#64748b",
                  border: "none",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  display: "flex", alignItems: "center", justifyContent: 'center', gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === "group" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none"
                }}
              >
                <Users size={18} /> Inscribir Grupo Completo
              </button>
            </div>

            {/* --- CONTENIDO DE TABS --- */}
            
            {/* TAB INDIVIDUAL */}
            {activeTab === "individual" && (
              <div style={{ marginBottom: "32px", animation: 'fadeIn 0.3s ease' }}>
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                    Buscar Alumno
                  </label>
                  <div style={{ position: "relative" }}>
                    <Search size={20} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setSelectedStudent(null);
                        setShowDropdown(e.target.value.length >= 2);
                      }}
                      // onFocus COMBINADO AQUÍ:
                      onFocus={(e) => {
                        if (search.length >= 2) setShowDropdown(true); // Lógica dropdown
                        e.target.style.borderColor = '#3b82f6'; // Estilos focus
                        e.target.style.backgroundColor = '#fff';
                      }}
                      placeholder="Escribe nombre o matrícula (min. 2 caracteres)..."
                      disabled={submitting}
                      style={{...inputStyle, paddingLeft: '42px'}}
                      onBlur={(e) => { 
                        e.target.style.borderColor = '#e2e8f0'; 
                        e.target.style.backgroundColor = '#f8fafc'; 
                      }}
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch(""); setSelectedStudent(null); setShowDropdown(false);
                        }}
                        style={{
                          position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px"
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown de Resultados */}
                  {showDropdown && filteredStudents.length > 0 && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0,
                      background: "white", border: "1px solid #e2e8f0", borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", maxHeight: "280px", overflowY: "auto",
                      zIndex: 100, marginTop: "6px", padding: '6px'
                    }}>
                      {filteredStudents.map((s) => (
                        <div
                          key={s.alumno_id}
                          onClick={() => handleSelectStudent(s)}
                          style={{
                            padding: "12px", cursor: "pointer", borderRadius: '8px',
                            transition: "0.2s", display: 'flex', alignItems: 'center', gap: '12px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                        >
                          <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '50%', color: '#0369a1' }}>
                            <School size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: '0.95rem' }}>
                              {s.nombre} {s.apellido_paterno} {s.apellido_materno}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              {s.matricula} • {s.grado}° {s.grupo}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón de Acción Principal */}
                  <button
                    onClick={handleAddSingle}
                    disabled={!selectedStudent || submitting}
                    style={{
                      width: "100%", marginTop: "16px",
                      padding: '12px', borderRadius: '12px', border: 'none',
                      background: !selectedStudent || submitting ? '#e2e8f0' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: !selectedStudent || submitting ? '#94a3b8' : 'white',
                      fontWeight: 600, cursor: !selectedStudent || submitting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: !selectedStudent || submitting ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {submitting ? <Loader2 className="spin" size={20} /> : <><UserPlus size={20} /> Inscribir Alumno</>}
                  </button>
                </div>
              </div>
            )}

            {/* TAB GRUPO */}
            {activeTab === "group" && (
              <div style={{ marginBottom: "32px", animation: 'fadeIn 0.3s ease' }}>
                <div style={{ 
                  padding: "24px", background: "#fffbeb", borderRadius: "16px", border: "1px solid #fcd34d",
                  boxShadow: "0 4px 6px -1px rgba(251, 191, 36, 0.1)"
                }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: "1rem", color: "#b45309", display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} /> Selección Masiva de Grupo
                  </h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#92400e' }}>Grado</label>
                      <select
                        value={selectedGrado}
                        onChange={(e) => { setSelectedGrado(e.target.value); setSelectedGrupo(""); }}
                        disabled={loading || submitting}
                        style={{ ...inputStyle, borderColor: '#fcd34d', background: 'white' }}
                      >
                        <option value="">Seleccionar...</option>
                        {grados.map((g) => <option key={g} value={g}>{g}° Grado</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#92400e' }}>Grupo</label>
                      <select
                        value={selectedGrupo}
                        onChange={(e) => setSelectedGrupo(e.target.value)}
                        disabled={!selectedGrado || loading || submitting}
                        style={{ ...inputStyle, borderColor: '#fcd34d', background: 'white' }}
                      >
                        <option value="">Seleccionar...</option>
                        {gruposDisponibles.map((g) => <option key={g} value={g}>Grupo {g}</option>)}
                      </select>
                    </div>
                  </div>

                  {selectedGrado && selectedGrupo && (
                    <div style={{ 
                      padding: "12px 16px", background: "rgba(255, 255, 255, 0.6)", borderRadius: "10px", 
                      marginBottom: "16px", border: "1px dashed #d97706", display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                      <CheckCircle2 size={20} color="#d97706" />
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "#92400e" }}>
                        Se inscribirán <strong>{eligibleStudents.filter(s => s.grado === parseInt(selectedGrado) && s.grupo === selectedGrupo).length} alumnos</strong> del grupo {selectedGrado}°{selectedGrupo}.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleAddGroup}
                    disabled={!selectedGrado || !selectedGrupo || submitting}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                      background: !selectedGrado || !selectedGrupo || submitting ? '#fcd34d' : '#d97706',
                      color: 'white', fontWeight: 600, cursor: !selectedGrado || !selectedGrupo ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)', transition: 'all 0.2s'
                    }}
                  >
                    {submitting ? <Loader2 className="spin" size={20} /> : <><Users size={20} /> Confirmar Inscripción Masiva</>}
                  </button>
                </div>
              </div>
            )}

            {/* --- LISTA DE INSCRITOS --- */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: '#1e293b' }}>
                  Alumnos Inscritos
                </h4>
                <span style={{ 
                  background: '#f1f5f9', color: '#64748b', padding: '4px 10px', 
                  borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 
                }}>
                  {enrollments.length}
                </span>
              </div>

              <div style={{
                maxHeight: "350px", overflowY: "auto", border: "1px solid #e2e8f0", 
                borderRadius: "16px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
              }}>
                {loadingEnrollments ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Loader2 className="spin" size={32} color="#cbd5e1" />
                    <p>Cargando lista...</p>
                  </div>
                ) : enrollments.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    <div style={{ background: '#f8fafc', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Users size={30} color="#cbd5e1" />
                    </div>
                    No hay alumnos inscritos en esta clase aún.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                      <tr>
                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Matrícula</th>
                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Alumno</th>
                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Grado/Grupo</th>
                        <th style={{ padding: '14px 20px', textAlign: 'right', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e, index) => (
                        <tr key={e.inscripcion_id} style={{ borderBottom: index !== enrollments.length - 1 ? '1px solid #f1f5f9' : 'none', background: 'white' }}>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontFamily: 'monospace' }}>{e.matricula}</td>
                          <td style={{ padding: '14px 20px', fontWeight: 500, color: '#334155' }}>{e.nombre} {e.apellido_paterno}</td>
                          <td style={{ padding: '14px 20px', color: '#64748b' }}>
                            <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                              {e.grado}° {e.grupo}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setInscripcionToDelete(e.inscripcion_id);
                                setPasswordModalOpen(true);
                              }}
                              disabled={submitting}
                              title="Eliminar inscripción"
                              style={{
                                background: 'transparent', border: '1px solid #fee2e2', borderRadius: '8px',
                                padding: '8px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                            >
                              <XCircle size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PasswordConfirmModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setInscripcionToDelete(null);
        }}
        onConfirm={handleRemove}
        title="Eliminar Inscripción"
        message="Esta acción eliminará permanentemente la inscripción del alumno de esta clase. Se requiere autorización."
      />

      <style jsx global>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        /* Scrollbar personalizado para las listas */
        div::-webkit-scrollbar { width: 6px; }
        div::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        div::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        div::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}