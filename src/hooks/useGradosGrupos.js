"use client";
import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/api';

export const useGradosGrupos = () => {
  const [grados, setGrados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [gruposCombinados, setGruposCombinados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradosGrupos();
  }, []);

  const fetchGradosGrupos = async () => {
    try {
      const response = await dashboardService.getGradosYGrupos();
      setGrados(response.data.grados || []);
      setGrupos(response.data.grupos || []);
      
      // Crear combinaciones de grado-grupo para la lista
      const combinados = [];
      for (const grado of (response.data.grados || [])) {
        for (const grupo of (response.data.grupos || [])) {
          combinados.push({ grado, grupo });
        }
      }
      setGruposCombinados(combinados);
    } catch (error) {
      console.error('Error fetching grados y grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    grados, 
    grupos, 
    gruposCombinados,
    loading,
    refresh: fetchGradosGrupos 
  };
};
