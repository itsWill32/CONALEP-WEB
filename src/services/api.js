import api from '@/lib/axios';

// ==================== AUTENTICACIÓN ====================
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/admin/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/admin/profile');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/admin/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

// ==================== DASHBOARD ====================
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getGradosYGrupos: async () => {
    const response = await api.get('/admin/grados-grupos');
    return response.data;
  }
};

// ==================== ALUMNOS ====================
export const alumnosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/alumnos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/alumnos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/alumnos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/alumnos/${id}`, data);
    return response.data;
  },

  delete: async (id, password) => {
    const response = await api.delete(`/admin/alumnos/${id}`, { 
      data: { password } 
    });
    return response.data;
  },

  previewCSV: async (data) => {
    const response = await api.post('/admin/alumnos/csv/preview', { data });
    return response.data;
  },

  importCSV: async (data, ignorar_duplicados = false) => {
    const response = await api.post('/admin/alumnos/csv/import', { data, ignorar_duplicados });
    return response.data;
  },

  incrementarGrado: async (grado, grupo, todos = false, password) => {
    const response = await api.post('/admin/alumnos/incrementar-grado', { 
      grado, 
      grupo, 
      todos,
      password 
    });
    return response.data;
  }
};

// ==================== MAESTROS ====================
export const maestrosService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/maestros', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/maestros/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/maestros', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/maestros/${id}`, data);
    return response.data;
  },

  delete: async (id, password) => {
    const response = await api.delete(`/admin/maestros/${id}`, { 
      data: { password } 
    });
    return response.data;
  },

  previewCSV: async (data) => {
    const response = await api.post('/admin/maestros/csv/preview', { data });
    return response.data;
  },

  importCSV: async (data, ignorar_duplicados = false) => {
    const response = await api.post('/admin/maestros/csv/import', { data, ignorar_duplicados });
    return response.data;
  }
};

// ==================== CLASES ====================
export const clasesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/clases', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/clases/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/admin/clases', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/admin/clases/${id}`, data);
    return response.data;
  },

  delete: async (id, password) => {
    const response = await api.delete(`/admin/clases/${id}`, { 
      data: { password } 
    });
    return response.data;
  },

  previewCSV: async (data) => {
    const response = await api.post('/admin/clases/csv/preview', { data });
    return response.data;
  },

  importCSV: async (data, ignorar_duplicados = false) => {
    const response = await api.post('/admin/clases/csv/import', { data, ignorar_duplicados });
    return response.data;
  }
};

// ==================== INSCRIPCIONES ====================
export const inscripcionesService = {
  getByClase: async (claseId) => {
    const response = await api.get(`/admin/inscripciones/clase/${claseId}`);
    return response.data;
  },

  create: async (alumno_id, clase_id) => {
    const response = await api.post('/admin/inscripciones', { alumno_id, clase_id });
    return response.data;
  },

  createMultiple: async (alumno_ids, clase_id) => {
    const response = await api.post('/admin/inscripciones/multiples', { alumno_ids, clase_id });
    return response.data;
  },

  createGrupoCompleto: async (grado, grupo, clase_id) => {
    const response = await api.post('/admin/inscripciones/grupo-completo', { grado, grupo, clase_id });
    return response.data;
  },

  delete: async (id, password) => {
    const response = await api.delete(`/admin/inscripciones/${id}`, { 
      data: { password } 
    });
    return response.data;
  }
};

// ==================== NOTIFICACIONES (CONSOLIDADO) ====================
export const notificacionesService = {
  // Listar todas
  getAll: async (params = {}) => {
    const response = await api.get('/notificaciones/admin/todas', { params });
    return response.data;
  },

  // Ver una específica
  getById: async (id) => {
    const response = await api.get(`/notificaciones/admin/${id}`);
    return response.data;
  },

  // Ver pendientes de aprobación
  getPendientes: async () => {
    const response = await api.get('/notificaciones/admin/pendientes');
    return response.data;
  },

  // Crear notificación (admin)
  create: async (data) => {
    const response = await api.post('/notificaciones/admin/crear', data);
    return response.data;
  },

  // Moderar (aprobar/rechazar)
  moderar: async (id, accion) => {
    const response = await api.post(`/notificaciones/admin/moderar/${id}`, { accion });
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/notificaciones/admin/${id}`, data);
    return response.data;
  },

  // Eliminar una
  delete: async (id, password) => {
    const response = await api.delete(`/notificaciones/admin/${id}`, { 
      data: { password } 
    });
    return response.data;
  },

  // Limpiar rechazadas
  deleteRechazadas: async (password) => {
    const response = await api.delete('/notificaciones/admin/limpiar/rechazadas', { 
      data: { password } 
    });
    return response.data;
  },

  // Limpiar antiguas
  deleteAntiguas: async (password) => {
    const response = await api.delete('/notificaciones/admin/limpiar/antiguas', { 
      data: { password } 
    });
    return response.data;
  }
};

// ==================== FIN DE AÑO ====================
export const endOfYearService = {
  promoteAllStudents: async (password) => {
    const response = await api.post('/admin/alumnos/incrementar-grado', { 
      todos: true,
      password 
    });
    return response.data;
  },

  demoteAllStudents: async (password) => {
    const response = await api.post('/admin/alumnos/decrementar-grado', { 
      todos: true,
      password 
    });
    return response.data;
  },

  deleteAllEnrollments: async (password) => {
    const response = await api.delete('/admin/inscripciones/todas', {
      data: { password }
    });
    return response.data;
  },

  deleteAllAttendances: async (password) => {
    const response = await api.delete('/admin/asistencias/todas', {
      data: { password }
    });
    return response.data;
  },

  deleteGrupoCompleto: async (grado, grupo, password) => {
    const response = await api.delete(`/admin/clases/grupo/${grado}/${grupo}`, {
      data: { password }
    });
    return response.data;
  }
};

// SERVICIOS DE ADMININS
export const adminAuthService = {
  // Recuperación de contraseña
  forgotPassword: (email) => api.post('/auth/admin/forgot-password', { email }),
  verifyResetCode: (email, codigo) => api.post('/auth/admin/verify-reset-code', { email, codigo }),
  resetPassword: (email, codigo, newPassword) => api.post('/auth/admin/reset-password', { email, codigo, newPassword }),
  
  // Gestión de admins
  getAll: () => api.get('/auth/admin/list'),
  create: (data) => api.post('/auth/admin/register', data),
  delete: (id) => api.delete(`/auth/admin/${id}`),
  
  // Perfil y cambio de contraseña
  getProfile: () => api.get('/auth/admin/profile'),
  changePassword: (currentPassword, newPassword) => api.post('/auth/admin/change-password', { currentPassword, newPassword }),
};