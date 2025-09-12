"use client";

import { useConcursosContext } from "@/lib/concursos-context";
import type { Concurso } from "@/types";

/**
 * Hook para operações de concursos sem dependência circular
 * Substitui o hook original use-concursos.ts
 */
export function useConcursos() {
  const { 
    concursos, 
    concursosLoading: loading, 
    concursosError: error,
    fetchConcursos,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    getConcursoById
  } = useConcursosContext();

  return {
    concursos,
    loading,
    error,
    fetchConcursos,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    getConcursoById,
    
    // Métodos legados para compatibilidade
    adicionarConcurso: createCompetition,
    atualizarConcurso: updateCompetition,
    deletarConcurso: deleteCompetition,
    buscarConcursoPorId: getConcursoById
  };
}