"use client";

import { useEffect, useCallback } from "react";
import { useConcursosCRUD } from "./use-concursos-crud-async";
import { useConcursosCache } from "./use-concursos-cache-async";
import { useConcursosValidation } from "./use-concursos-validation";
import { combineAsyncStates } from "@/hooks/shared/use-async-state";
import type { Concurso, Disciplina, Topico, Questao } from "@/types";

/**
 * SUP-5: Hook principal refatorado com estados async padronizados
 * Substitui use-concursos-refactored.ts com padrão consistente
 */
export function useConcursos() {
  // Hooks especializados com estados async padronizados
  const crud = useConcursosCRUD();
  const cache = useConcursosCache();
  const validation = useConcursosValidation();

  // Combinar estados async para visão unificada
  const combinedState = combineAsyncStates({
    cache: {
      data: cache.concursos,
      loading: cache.loading,
      error: cache.error,
      isIdle: cache.isIdle,
      isLoading: cache.isLoading,
      isError: cache.isError,
      isSuccess: cache.isSuccess
    },
    crud: {
      data: null,
      loading: crud.loading,
      error: crud.error,
      isIdle: crud.isIdle,
      isLoading: crud.isLoading,
      isError: crud.isError,
      isSuccess: crud.isSuccess
    }
  });

  // ==================== OPERAÇÕES PRINCIPAIS ====================

  // Buscar concursos (com cache)
  const fetchConcursos = useCallback(async () => {
    await cache.fetchConcursos();
  }, [cache.fetchConcursos]);

  // Criar concurso (com validação e cache)
  const createCompetition = useCallback(async (data: Partial<Concurso>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processeConcursoData(data);
    
    // Criar no banco
    const result = await crud.createCompetition(sanitizedData);
    
    // Garantir que temos um único concurso
    const newConcurso = Array.isArray(result) ? result[0] : result;
    
    if (newConcurso) {
      // Atualizar cache
      cache.addToCache(newConcurso);
    }
    
    return newConcurso;
  }, [crud.createCompetition, validation.processeConcursoData, cache.addToCache]);

  // Atualizar concurso (com validação e cache)
  const updateCompetition = useCallback(async (id: string, updates: Partial<Concurso>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processeConcursoData(updates);
    
    // Atualizar no banco
    const result = await crud.updateCompetition(id, sanitizedUpdates);
    
    // Garantir que temos um único concurso
    const updatedConcurso = Array.isArray(result) ? result[0] : result;
    
    if (updatedConcurso) {
      // Atualizar cache
      cache.updateInCache(id, updatedConcurso);
    }
    
    return updatedConcurso;
  }, [crud.updateCompetition, validation.processeConcursoData, cache.updateInCache]);

  // Deletar concurso (com cache)
  const deleteCompetition = useCallback(async (id: string) => {
    // Deletar do banco
    const success = await crud.deleteCompetition(id);
    
    if (success) {
      // Remover do cache
      cache.removeFromCache(id);
    }
    
    return success;
  }, [crud.deleteCompetition, cache.removeFromCache]);

  // ==================== OPERAÇÕES DE DISCIPLINAS ====================

  // Adicionar disciplina (com validação e cache)
  const addSubject = useCallback(async (competitionId: string, data: Partial<Disciplina>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processDisciplinaData(data);
    
    // Adicionar no banco
    const newDisciplina = await crud.addSubject(competitionId, sanitizedData);
    
    if (newDisciplina) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return newDisciplina;
  }, [crud.addSubject, validation.processDisciplinaData, cache.invalidateCache, cache.fetchConcursos]);

  // Atualizar disciplina (com validação e cache)
  const updateSubject = useCallback(async (id: string, updates: Partial<Disciplina>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processDisciplinaData(updates);
    
    // Atualizar no banco
    const updatedDisciplina = await crud.updateSubject(id, sanitizedUpdates);
    
    if (updatedDisciplina) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return updatedDisciplina;
  }, [crud.updateSubject, validation.processDisciplinaData, cache.invalidateCache, cache.fetchConcursos]);

  // Deletar disciplina (com cache)
  const deleteSubject = useCallback(async (id: string) => {
    // Deletar do banco
    const success = await crud.deleteSubject(id);
    
    if (success) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return success;
  }, [crud.deleteSubject, cache.invalidateCache, cache.fetchConcursos]);

  // ==================== OPERAÇÕES DE TÓPICOS ====================

  // Adicionar tópico (com validação e cache)
  const addTopic = useCallback(async (subjectId: string, data: Partial<Topico>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processTopicoData(data);
    
    // Adicionar no banco
    const newTopico = await crud.addTopic(subjectId, sanitizedData);
    
    if (newTopico) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return newTopico;
  }, [crud.addTopic, validation.processTopicoData, cache.invalidateCache, cache.fetchConcursos]);

  // Atualizar tópico (com validação e cache)
  const updateTopic = useCallback(async (id: string, updates: Partial<Topico>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processTopicoData(updates);
    
    // Atualizar no banco
    const updatedTopico = await crud.updateTopic(id, sanitizedUpdates);
    
    if (updatedTopico) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return updatedTopico;
  }, [crud.updateTopic, validation.processTopicoData, cache.invalidateCache, cache.fetchConcursos]);

  // Deletar tópico (com cache)
  const deleteTopic = useCallback(async (id: string) => {
    // Deletar do banco
    const success = await crud.deleteTopic(id);
    
    if (success) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return success;
  }, [crud.deleteTopic, cache.invalidateCache, cache.fetchConcursos]);

  // ==================== OPERAÇÕES DE QUESTÕES ====================

  // Adicionar questão (com validação e cache)
  const addQuestion = useCallback(async (competitionId: string, data: Partial<Questao>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processQuestaoData(data);
    
    // Adicionar no banco
    const newQuestao = await crud.addQuestion(competitionId, sanitizedData);
    
    if (newQuestao) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return newQuestao;
  }, [crud.addQuestion, validation.processQuestaoData, cache.invalidateCache, cache.fetchConcursos]);

  // Atualizar questão (com validação e cache)
  const updateQuestion = useCallback(async (id: string, updates: Partial<Questao>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processQuestaoData(updates);
    
    // Atualizar no banco
    const updatedQuestao = await crud.updateQuestion(id, sanitizedUpdates);
    
    if (updatedQuestao) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return updatedQuestao;
  }, [crud.updateQuestion, validation.processQuestaoData, cache.invalidateCache, cache.fetchConcursos]);

  // Deletar questão (com cache)
  const deleteQuestion = useCallback(async (id: string) => {
    // Deletar do banco
    const success = await crud.deleteQuestion(id);
    
    if (success) {
      // Invalidar cache para recarregar dados completos
      cache.invalidateCache();
      await cache.fetchConcursos();
    }
    
    return success;
  }, [crud.deleteQuestion, cache.invalidateCache, cache.fetchConcursos]);

  // Buscar questões de um concurso
  const fetchQuestions = useCallback(async (competitionId: string) => {
    return await crud.fetchQuestions(competitionId);
  }, [crud.fetchQuestions]);

  // ==================== UTILITÁRIOS ====================

  // Buscar concurso por ID
  const getConcursoById = useCallback((id: string) => {
    return cache.getConcursoById(id);
  }, [cache.getConcursoById]);

  // Invalidar cache
  const invalidateCache = useCallback(() => {
    cache.invalidateCache();
  }, [cache.invalidateCache]);

  // Estatísticas do cache
  const getCacheStats = useCallback(() => {
    return cache.getCacheStats();
  }, [cache.getCacheStats]);

  // ==================== FUNÇÕES ESPECÍFICAS ====================

  // Buscar concurso completo com dados relacionados
  const fetchConcursoCompleto = useCallback(async (id: string) => {
    const concurso = getConcursoById(id);
    if (!concurso) {
      // Se não está no cache, buscar do banco
      await fetchConcursos();
      return getConcursoById(id);
    }
    return concurso;
  }, [getConcursoById, fetchConcursos]);

  // Atualizar status de tópico completado
  const atualizarTopicoCompletado = useCallback(async (topicoId: string, completed: boolean): Promise<boolean> => {
    try {
      const result = await updateTopic(topicoId, { completed });
      return !!result;
    } catch (error) {
      console.error("Erro ao atualizar tópico:", error);
      return false;
    }
  }, [updateTopic]);

  // Buscar questões de um concurso
  const buscarQuestoesConcurso = useCallback(async (concursoId: string): Promise<Questao[]> => {
    try {
      const result = await crud.fetchQuestions(concursoId);
      // Garantir que o retorno é uma array de questões
      const questoes = Array.isArray(result) ? result as unknown as Questao[] : [];
      return questoes || [];
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      return [];
    }
  }, [crud.fetchQuestions]);

  // Calcular progresso de um concurso
  const calcularProgressoConcurso = useCallback((concurso: Concurso): number => {
    if (!concurso.disciplinas || concurso.disciplinas.length === 0) return 0;
    
    const totalTopicos = concurso.disciplinas.reduce((total, disciplina) => {
      return total + (disciplina.topicos?.length || 0);
    }, 0);
    
    if (totalTopicos === 0) return 0;
    
    const topicosCompletos = concurso.disciplinas.reduce((completos, disciplina) => {
      return completos + (disciplina.topicos?.filter(topico => topico.completed).length || 0);
    }, 0);
    
    return Math.round((topicosCompletos / totalTopicos) * 100);
  }, []);

  // Criar dados de teste (para desenvolvimento)
  const createTestData = useCallback(async (testId?: string) => {
    const testConcurso = {
      title: testId ? `Concurso de Teste ${testId}` : "Concurso de Teste",
      organizer: "Organizadora Teste",
      status: "planejado" as const,
      exam_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias no futuro
    };
    
    return await createCompetition(testConcurso);
  }, [createCompetition]);

  // ==================== FUNÇÕES LEGADAS PARA COMPATIBILIDADE ====================

  // Aliases para manter compatibilidade com código existente
  const adicionarConcurso = useCallback(async (data: Partial<Concurso>) => {
    try {
      const result = await createCompetition(data);
      return result; // Retorna diretamente o concurso criado
    } catch (error) {
      console.error("Erro ao adicionar concurso:", error);
      throw error; // Propaga o erro para o componente tratar
    }
  }, [createCompetition]);
  
  const atualizarConcurso = updateCompetition;
  const removerConcurso = deleteCompetition;
  const buscarConcursoPorId = getConcursoById;

  // ==================== EFEITOS ====================

  // Carregar concursos ao montar o componente
  useEffect(() => {
    fetchConcursos();
  }, [fetchConcursos]);

  // ==================== RETORNO DA API ====================

  return {
    // Estados padronizados (AsyncState combinado)
    concursos: cache.concursos,
    loading: combinedState.loading,
    error: combinedState.error,
    isIdle: combinedState.isIdle,
    isLoading: combinedState.isLoading,
    isError: combinedState.isError,
    isSuccess: combinedState.isSuccess,
    
    // Operações principais
    fetchConcursos,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    getConcursoById,
    
    // Operações de disciplinas
    addSubject,
    updateSubject,
    deleteSubject,
    
    // Operações de tópicos
    addTopic,
    updateTopic,
    deleteTopic,
    
    // Operações de questões
    addQuestion,
    updateQuestion,
    deleteQuestion,
    fetchQuestions,
    
    // Funções específicas
    fetchConcursoCompleto,
    atualizarTopicoCompletado,
    buscarQuestoesConcurso,
    calcularProgressoConcurso,
    createTestData,
    
    // Utilitários
    invalidateCache,
    getCacheStats,
    reset: () => {
      cache.reset();
      crud.reset();
    },
    
    // Validação (exposta para uso direto se necessário)
    validation,
    
    // Funções legadas para compatibilidade
    adicionarConcurso,
    atualizarConcurso,
    removerConcurso,
    buscarConcursoPorId,
  };
}