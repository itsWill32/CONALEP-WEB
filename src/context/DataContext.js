"use client";
import { createContext, useContext, useState } from 'react';
import api from '@/lib/axios';
import { 
  alumnosService, 
  maestrosService, 
  clasesService, 
  inscripcionesService, 
  notificacionesService,
  dashboardService,
  endOfYearService 
} from '@/services/api';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    students: [],
    teachers: [],
    classes: [],
    enrollments: [],
    notifications: [],
    stats: null,
    pagination: {
      students: { page: 1, limit: 50, total: 0, pages: 0 },
      teachers: { page: 1, limit: 50, total: 0, pages: 0 },
      classes: { page: 1, limit: 50, total: 0, pages: 0 },
    }
  });

  const [loading, setLoading] = useState(false);

  // ==================== FETCH DATA ====================
  
  const fetchStudents = async (params = {}) => {
    setLoading(true);
    try {
      const response = await alumnosService.getAll(params);
      setData(prev => ({ 
        ...prev, 
        students: response.data,
        pagination: {
          ...prev.pagination,
          students: response.pagination || prev.pagination.students
        }
      }));
      return response;
    } catch (error) {
      toast.error('Error al cargar alumnos');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async (params = {}) => {
    setLoading(true);
    try {
      const response = await maestrosService.getAll(params);
      setData(prev => ({ ...prev, teachers: response.data }));
      return response;
    } catch (error) {
      toast.error('Error al cargar maestros');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async (params = {}) => {
    setLoading(true);
    try {
      const response = await clasesService.getAll(params);
      setData(prev => ({ ...prev, classes: response.data }));
      return response;
    } catch (error) {
      toast.error('Error al cargar clases');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (params = {}) => {
    setLoading(true);
    try {
      const response = await notificacionesService.getAll(params);
      setData(prev => ({ ...prev, notifications: response.data }));
      return response;
    } catch (error) {
      toast.error('Error al cargar notificaciones');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setData(prev => ({ ...prev, stats: response.data }));
      return response;
    } catch (error) {
      toast.error('Error al cargar estadísticas');
      console.error(error);
      throw error;
    }
  };

  const fetchEnrollmentsByClase = async (claseId) => {
    setLoading(true);
    try {
      const response = await inscripcionesService.getByClase(claseId);
      return response.data;
    } catch (error) {
      toast.error('Error al cargar inscripciones');
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==================== ALUMNOS ====================
  
  const addStudent = async (studentData) => {
    try {
      const response = await alumnosService.create(studentData);
      toast.success('Alumno creado exitosamente');
      await fetchStudents();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear alumno';
      toast.error(message);
      throw error;
    }
  };

  const updateStudent = async (id, studentData) => {
    try {
      const response = await alumnosService.update(id, studentData);
      toast.success('Alumno actualizado');
      await fetchStudents();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar alumno';
      toast.error(message);
      throw error;
    }
  };

  const deleteStudent = async (id, password) => {
    try {
      await alumnosService.delete(id, password);
      toast.success('Alumno eliminado');
      await fetchStudents();
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar alumno';
      toast.error(message);
      throw error;
    }
  };

  // ==================== MAESTROS ====================
  
  const addTeacher = async (teacherData) => {
    try {
      const response = await maestrosService.create(teacherData);
      toast.success('Maestro creado exitosamente');
      await fetchTeachers();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear maestro';
      toast.error(message);
      throw error;
    }
  };

  const updateTeacher = async (id, teacherData) => {
    try {
      const response = await maestrosService.update(id, teacherData);
      toast.success('Maestro actualizado');
      await fetchTeachers();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar maestro';
      toast.error(message);
      throw error;
    }
  };

  const deleteTeacher = async (id, password) => {
    try {
      await maestrosService.delete(id, password);
      toast.success('Maestro eliminado');
      await fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar maestro';
      toast.error(message);
      throw error;
    }
  };

  // ==================== CLASES ====================
  
  const addClass = async (classData) => {
    try {
      const response = await clasesService.create(classData);
      toast.success('Clase creada exitosamente');
      await fetchClasses();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear clase';
      toast.error(message);
      throw error;
    }
  };

  const updateClass = async (id, classData) => {
    try {
      const response = await clasesService.update(id, classData);
      toast.success('Clase actualizada');
      await fetchClasses();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al actualizar clase';
      toast.error(message);
      throw error;
    }
  };

  const deleteClass = async (id, password) => {
    try {
      await clasesService.delete(id, password);
      toast.success('Clase eliminada');
      await fetchClasses();
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar clase';
      toast.error(message);
      throw error;
    }
  };

  // ==================== INSCRIPCIONES ====================
  
  const addEnrollment = async (alumno_id, clase_id) => {
    try {
      const response = await inscripcionesService.create(alumno_id, clase_id);
      toast.success('Alumno inscrito exitosamente');
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al inscribir alumno';
      toast.error(message);
      throw error;
    }
  };

  const addMultipleEnrollments = async (alumno_ids, clase_id) => {
    try {
      const response = await inscripcionesService.createMultiple(alumno_ids, clase_id);
      toast.success(`${response.data.inscritos} alumnos inscritos`);
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al inscribir alumnos';
      toast.error(message);
      throw error;
    }
  };

  const addGrupoCompleto = async (grado, grupo, clase_id) => {
    try {
      const response = await inscripcionesService.createGrupoCompleto(grado, grupo, clase_id);
      toast.success(`Grupo ${grado}${grupo} inscrito exitosamente`);
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al inscribir grupo';
      toast.error(message);
      throw error;
    }
  };

  const deleteEnrollment = async (enrollmentId, password) => {
    try {
      await api.delete(`/admin/inscripciones/${enrollmentId}`, {
        data: { password }
      });
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }
  };

  // ==================== NOTIFICACIONES ====================
  
  const addNotification = async (notificationData) => {
    try {
      const response = await notificacionesService.create(notificationData);
      toast.success('Notificación creada y aprobada');
      await fetchNotifications();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al crear notificación';
      toast.error(message);
      throw error;
    }
  };

  const moderateNotification = async (id, accion) => {
    try {
      const response = await notificacionesService.moderar(id, accion);
      toast.success(`Notificación ${accion === 'aprobar' ? 'aprobada' : 'rechazada'}`);
      await fetchNotifications();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al moderar notificación';
      toast.error(message);
      throw error;
    }
  };

  const deleteNotification = async (id, password) => {
    try {
      await notificacionesService.delete(id, password);
      toast.success('Notificación eliminada');
      await fetchNotifications();
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar notificación';
      toast.error(message);
      throw error;
    }
  };

  const deleteRejectedNotifications = async (password) => {
    try {
      const response = await notificacionesService.deleteRechazadas(password);
      toast.success(`${response.data.eliminadas} notificaciones rechazadas eliminadas`);
      await fetchNotifications();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al limpiar notificaciones rechazadas';
      toast.error(message);
      throw error;
    }
  };

  const deleteOldNotifications = async (password) => {
    try {
      const response = await notificacionesService.deleteAntiguas(password);
      toast.success(`${response.data.eliminadas} notificaciones antiguas eliminadas`);
      await fetchNotifications();
      return response;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al limpiar notificaciones antiguas';
      toast.error(message);
      throw error;
    }
  };

  // ==================== MÉTODOS LEGACY (para compatibilidad) ====================
  
  const add = async (collection, item) => {
    switch(collection) {
      case 'students':
        return await addStudent(item);
      case 'teachers':
        return await addTeacher(item);
      case 'classes':
        return await addClass(item);
      case 'notifications':
        return await addNotification(item);
      default:
        throw new Error(`Collection ${collection} no soportada`);
    }
  };

  const update = async (collection, id, item) => {
    switch(collection) {
      case 'students':
        return await updateStudent(id, item);
      case 'teachers':
        return await updateTeacher(id, item);
      case 'classes':
        return await updateClass(id, item);
      default:
        throw new Error(`Collection ${collection} no soportada`);
    }
  };

  const remove = async (collection, id, password) => {
    switch(collection) {
      case 'students':
        return await deleteStudent(id, password);
      case 'teachers':
        return await deleteTeacher(id, password);
      case 'classes':
        return await deleteClass(id, password);
      case 'enrollments':
        return await deleteEnrollment(id, password);
      case 'notifications':
        return await deleteNotification(id, password);
      default:
        throw new Error(`Collection ${collection} no soportada`);
    }
  };
    // ==================== OPERACIONES DE FIN DE CURSO ====================
  
    const promoteAllStudents = async (password) => {
      try {
        const response = await endOfYearService.promoteAllStudents(password);
        toast.success(`${response.data.alumnos_actualizados} alumnos promovidos`);
        await fetchStudents();
        return response;
      } catch (error) {
        const message = error.response?.data?.error || 'Error al promover alumnos';
        toast.error(message);
        throw error;
      }
    };
  
    const demoteAllStudents = async (password) => {
      try {
        const response = await endOfYearService.demoteAllStudents(password);
        toast.success(`${response.data.alumnos_actualizados} alumnos degradados`);
        await fetchStudents();
        return response;
      } catch (error) {
        const message = error.response?.data?.error || 'Error al degradar alumnos';
        toast.error(message);
        throw error;
      }
    };
  
    const deleteAllEnrollments = async (password) => {
      try {
        const response = await endOfYearService.deleteAllEnrollments(password);
        toast.success(`${response.data.eliminadas} inscripciones eliminadas`);
        return response;
      } catch (error) {
        const message = error.response?.data?.error || 'Error al eliminar inscripciones';
        toast.error(message);
        throw error;
      }
    };
  
    const deleteAllAttendances = async (password) => {
      try {
        const response = await endOfYearService.deleteAllAttendances(password);
        toast.success(`${response.data.eliminadas} asistencias eliminadas`);
        return response;
      } catch (error) {
        const message = error.response?.data?.error || 'Error al eliminar asistencias';
        toast.error(message);
        throw error;
      }
    };
  
    const deleteGrupoCompleto = async (grado, grupo, password) => {
      try {
        const response = await endOfYearService.deleteGrupoCompleto(grado, grupo, password);
        toast.success(`Grupo ${grado}°${grupo} eliminado: ${response.data.alumnos_afectados} alumnos`);
        await fetchStudents();
        return response;
      } catch (error) {
        const message = error.response?.data?.error || 'Error al eliminar grupo';
        toast.error(message);
        throw error;
      }
    };
  

  return (
    <DataContext.Provider value={{
      data,
      loading,
      
      // Fetch methods
      fetchStudents,
      fetchTeachers,
      fetchClasses,
      fetchNotifications,
      fetchStats,
      fetchEnrollmentsByClase,
      
      // Student methods
      addStudent,
      updateStudent,
      deleteStudent,
      
      // Teacher methods
      addTeacher,
      updateTeacher,
      deleteTeacher,
      
      // Class methods
      addClass,
      updateClass,
      deleteClass,
      
      // Enrollment methods
      addEnrollment,
      addMultipleEnrollments,
      addGrupoCompleto,
      deleteEnrollment,
      
      // Notification methods
      addNotification,
      moderateNotification,
      deleteNotification,
      deleteRejectedNotifications,
      deleteOldNotifications,

      // End of year operations
      promoteAllStudents,
      demoteAllStudents,
      deleteAllEnrollments,
      deleteAllAttendances,
      deleteGrupoCompleto,
      
      // Legacy methods
      add,
      update,
      remove,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de DataProvider');
  }
  return context;
};
