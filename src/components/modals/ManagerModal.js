"use client";
import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Users, XCircle, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useGradosGrupos } from '@/hooks/useGradosGrupos';
import { inscripcionesService, alumnosService } from '@/services/api'; // ✅ AGREGAR alumnosService
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
  const [allStudents, setAllStudents] = useState([]); // ✅ AGREGAR estado propio
  const [loadingStudents, setLoadingStudents] = useState(false); // ✅ AGREGAR

  // Para autocomplete
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Para password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [inscripcionToDelete, setInscripcionToDelete] = useState(null);

  // ✅ AGREGAR: Cargar todos los estudiantes cuando se abre el modal
  useEffect(() => {
    if (isOpen && classItem) {
      loadEnrollments();
      loadAllStudents(); // ✅ Cargar estudiantes propios
    }
  }, [isOpen, classItem]);

  // ✅ AGREGAR: Función para cargar TODOS los estudiantes
  const loadAllStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await alumnosService.getAll({ limit: 10000 }); // Sin límite
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
      setAllStudents([]); // ✅ Limpiar estudiantes al cerrar
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
    if (
      !confirm(
        `¿Inscribir ${toAdd.length} alumnos del grupo ${selectedGrado}°${selectedGrupo}?`
      )
    ) {
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

  // Confirmación segura por contraseña
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

  return (
    <>
      <div className="modal-overlay show" onClick={onClose}>
        <div
          className="modal-container"
          style={{ maxWidth: "900px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <h3>{classItem.nombre_clase}</h3>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                {teacher
                  ? `${teacher.nombre} ${teacher.apellido_paterno}`
                  : "Sin Maestro"}{" "}
                • {classItem.codigo_clase}
              </p>
            </div>
            <button className="close-btn" onClick={onClose} disabled={submitting}>
              <X />
            </button>
          </div>

          <div className="modal-body">
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: "10px",
              }}
            >
              <button
                onClick={() => setActiveTab("individual")}
                disabled={submitting}
                style={{
                  padding: "10px 20px",
                  background:
                    activeTab === "individual" ? "var(--primary)" : "transparent",
                  color: activeTab === "individual" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "0.2s",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <UserPlus size={18} />
                Inscribir Individual
              </button>
              <button
                onClick={() => setActiveTab("group")}
                disabled={submitting}
                style={{
                  padding: "10px 20px",
                  background: activeTab === "group" ? "var(--primary)" : "transparent",
                  color: activeTab === "group" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "0.2s",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Users size={18} />
                Inscribir Grupo Completo
              </button>
            </div>
            {activeTab === "individual" && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "15px",
                    color: "var(--primary)",
                  }}
                >
                  Inscribir Alumno Individual
                </h4>
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <div style={{ position: "relative", marginBottom: "10px" }}>
                    <Search
                      size={20}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setSelectedStudent(null);
                        setShowDropdown(e.target.value.length >= 2);
                      }}
                      onFocus={() => search.length >= 2 && setShowDropdown(true)}
                      className="form-input"
                      style={{
                        width: "100%",
                        paddingLeft: "40px",
                        paddingRight: search ? "40px" : "12px",
                      }}
                      placeholder="Escribe nombre o matrícula del alumno (mínimo 2 caracteres)..."
                      disabled={submitting}
                    />
                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setSelectedStudent(null);
                          setShowDropdown(false);
                        }}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          padding: "4px",
                        }}
                        disabled={submitting}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {showDropdown && filteredStudents.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        maxHeight: "250px",
                        overflowY: "auto",
                        zIndex: 1000,
                        marginTop: "4px",
                      }}
                    >
                      {filteredStudents.map((s) => (
                        <div
                          key={s.alumno_id}
                          onClick={() => handleSelectStudent(s)}
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f5f9",
                            transition: "0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f8fafc")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "white")
                          }
                        >
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#334155",
                              marginBottom: "4px",
                            }}
                          >
                            {s.nombre} {s.apellido_paterno} {s.apellido_materno}
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#64748b",
                            }}
                          >
                            {s.matricula} • {s.grado}° {s.grupo}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showDropdown && search.length >= 2 && filteredStudents.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "16px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                        zIndex: 1000,
                        marginTop: "4px",
                      }}
                    >
                      No se encontraron alumnos
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddSingle}
                  disabled={!selectedStudent || submitting}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    justifyContent: "center",
                  }}
                >
                  {submitting ? "Inscribiendo..." : <><UserPlus size={18} /> Inscribir Alumno</>}
                </button>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    marginTop: "10px",
                    textAlign: "center"
                  }}
                >
                  {eligibleStudents.length} alumno(s) disponible(s) para inscribir
                </p>
              </div>
            )}

            {activeTab === "group" && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "20px",
                  background: "#fef3c7",
                  borderRadius: "12px",
                  border: "1px solid #fcd34d",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.95rem",
                    marginBottom: "15px",
                    color: "#92400e",
                  }}
                >
                  Inscribir Grupo Completo
                </h4>
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  <select
                    className="form-input"
                    value={selectedGrado}
                    onChange={(e) => {
                      setSelectedGrado(e.target.value);
                      setSelectedGrupo("");
                    }}
                    disabled={loading || submitting}
                    style={{ flex: "1" }}
                  >
                    <option value="">Seleccionar Grado</option>
                    {grados.map((g) => (
                      <option key={g} value={g}>
                        {g}° Grado
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-input"
                    value={selectedGrupo}
                    onChange={(e) => setSelectedGrupo(e.target.value)}
                    disabled={!selectedGrado || loading || submitting}
                    style={{ flex: "1" }}
                  >
                    <option value="">Seleccionar Grupo</option>
                    {gruposDisponibles.map((g) => (
                      <option key={g} value={g}>
                        Grupo {g}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddGroup}
                    disabled={!selectedGrado || !selectedGrupo || submitting}
                    style={{ minWidth: "150px" }}
                  >
                    {submitting ? "Inscribiendo..." : <><Users size={18} /> Inscribir Grupo</>}
                  </button>
                </div>
                {selectedGrado && selectedGrupo && (
                  <div
                    style={{
                      padding: "12px",
                      background: "white",
                      borderRadius: "8px",
                      border: "1px solid #fcd34d",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "#92400e",
                      }}
                    >
                      📋 <strong>
                        {
                          eligibleStudents.filter(
                            (s) =>
                              s.grado === parseInt(selectedGrado) &&
                              s.grupo === selectedGrupo
                          ).length
                        } alumnos
                      </strong>{" "}
                      del grupo {selectedGrado}°{selectedGrupo} serán inscritos
                    </p>
                  </div>
                )}
              </div>
            )}

            <h4 style={{ marginBottom: "15px", fontSize: "1rem" }}>
              Alumnos Inscritos ({enrollments.length})
            </h4>
            <div
              className="table-responsive"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            >
              {loadingEnrollments ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Cargando inscripciones...
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Alumno</th>
                      <th>Grado/Grupo</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                            color: "#94a3b8",
                          }}
                        >
                          No hay alumnos inscritos en esta clase
                        </td>
                      </tr>
                    ) : (
                      enrollments.map((e) => (
                        <tr key={e.inscripcion_id}>
                          <td>{e.matricula}</td>
                          <td>
                            {e.nombre} {e.apellido_paterno}
                          </td>
                          <td>
                            {e.grado}° {e.grupo}
                          </td>
                          <td>
                            <button
                              className="action-btn btn-delete"
                              onClick={() => {
                                setInscripcionToDelete(e.inscripcion_id);
                                setPasswordModalOpen(true);
                              }}
                              disabled={submitting}
                              title="Eliminar inscripción"
                            >
                              <XCircle size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
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
        message="Esta acción eliminará permanentemente la inscripción del alumno. Confirma tu contraseña para continuar."
      />
    </>
  );
}
