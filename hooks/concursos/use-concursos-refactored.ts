"use client";

import { useEffect, useCallback } from "react";
import { useConcursosCRUD } from "./use-concursos-crud";
import { useConcursosCache } from "./use-concursos-cache";
import { useConcursosValidation } from "./use-concursos-validation";
import type { Concurso, Disciplina, Topico, Questao } from "@/types";

/**
 * Hook principal refatorado para concursos
 * Combina hooks especializados mantendo API compatível
 * 
 * Responsabilidades distribuídas:
 * - CRUD: useConcursosCRUD
 * - Cache: useConcursosCache  
 * - Validação: useConcursosValidation
 */
export function useConcursos() {
  // Hooks especializados
  const crud = useConcursosCRUD();
  const cache = useConcursosCache();
  const validation = useConcursosValidation();

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
    const newConcurso = await crud.createCompetition(sanitizedData);
    
    // Atualizar cache
    cache.addToCache(newConcurso);
    
    return newConcurso;
  }, [crud.createCompetition, validation.processeConcursoData, cache.addToCache]);

  // Atualizar concurso (com validação e cache)
  const updateCompetition = useCallback(async (id: string, updates: Partial<Concurso>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processeConcursoData(updates);
    
    // Atualizar no banco
    const updatedConcurso = await crud.updateCompetition(id, sanitizedUpdates);
    
    // Atualizar cache
    cache.updateInCache(id, updatedConcurso);
    
    return updatedConcurso;
  }, [crud.updateCompetition, validation.processeConcursoData, cache.updateInCache]);

  // Deletar concurso (com cache)
  const deleteCompetition = useCallback(async (id: string) => {
    // Deletar do banco
    await crud.deleteCompetition(id);
    
    // Remover do cache
    cache.removeFromCache(id);
    
    return true;
  }, [crud.deleteCompetition, cache.removeFromCache]);

  // ==================== OPERAÇÕES DE DISCIPLINAS ====================

  // Adicionar disciplina (com validação e cache)
  const addSubject = useCallback(async (competitionId: string, data: Partial<Disciplina>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processDisciplinaData(data);
    
    // Adicionar no banco
    const newDisciplina = await crud.addSubject(competitionId, sanitizedData);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return newDisciplina;
  }, [crud.addSubject, validation.processDisciplinaData, cache.invalidateCache, cache.fetchConcursos]);

  // Atualizar disciplina (com validação e cache)
  const updateSubject = useCallback(async (id: string, updates: Partial<Disciplina>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processDisciplinaData(updates);
    
    // Atualizar no banco
    const updatedDisciplina = await crud.updateSubject(id, sanitizedUpdates);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return updatedDisciplina;
  }, [crud.updateSubject, validation.processDisciplinaData, cache.invalidateCache, cache.fetchConcursos]);

  // Deletar disciplina (com cache)
  const deleteSubject = useCallback(async (id: string) => {
    // Deletar do banco
    await crud.deleteSubject(id);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return true;
  }, [crud.deleteSubject, cache.invalidateCache, cache.fetchConcursos]);

  // ==================== OPERAÇÕES DE TÓPICOS ====================

  // Adicionar tópico (com validação e cache)
  const addTopic = useCallback(async (subjectId: string, data: Partial<Topico>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processTopicoData(data);
    
    // Adicionar no banco
    const newTopico = await crud.addTopic(subjectId, sanitizedData);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return newTopico;
  }, [crud.addTopic, validation.processTopicoData, cache.invalidateCache, cache.fetchConcursos]);

  // Atualizar tópico (com validação e cache)
  const updateTopic = useCallback(async (id: string, updates: Partial<Topico>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processTopicoData(updates);
    
    // Atualizar no banco
    const updatedTopico = await crud.updateTopic(id, sanitizedUpdates);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return updatedTopico;
  }, [crud.updateTopic, validation.processTopicoData, cache.invalidateCache, cache.fetchConcursos]);

  // Deletar tópico (com cache)
  const deleteTopic = useCallback(async (id: string) => {
    // Deletar do banco
    await crud.deleteTopic(id);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return true;
  }, [crud.deleteTopic, cache.invalidateCache, cache.fetchConcursos]);

  // ==================== OPERAÇÕES DE QUESTÕES ====================

  // Adicionar questão (com validação e cache)
  const addQuestion = useCallback(async (competitionId: string, data: Partial<Questao>) => {
    // Validar e sanitizar dados
    const { data: sanitizedData } = validation.processQuestaoData(data);
    
    // Adicionar no banco
    const newQuestao = await crud.addQuestion(competitionId, sanitizedData);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return newQuestao;
  }, [crud.addQuestion, validation.processQuestaoData, cache.invalidateCache, cache.fetchConcursos]);

  // Atualizar questão (com validação e cache)
  const updateQuestion = useCallback(async (id: string, updates: Partial<Questao>) => {
    // Validar e sanitizar dados
    const { data: sanitizedUpdates } = validation.processQuestaoData(updates);
    
    // Atualizar no banco
    const updatedQuestao = await crud.updateQuestion(id, sanitizedUpdates);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return updatedQuestao;
  }, [crud.updateQuestion, validation.processQuestaoData, cache.invalidateCache, cache.fetchConcursos]);

  // Deletar questão (com cache)
  const deleteQuestion = useCallback(async (id: string) => {
    // Deletar do banco
    await crud.deleteQuestion(id);
    
    // Invalidar cache para recarregar dados completos
    cache.invalidateCache();
    await cache.fetchConcursos();
    
    return true;
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

  // ==================== FUNÇÕES LEGADAS PARA COMPATIBILIDADE ====================

  // ==================== FUNÇÕES ESPECÍFICAS FALTANTES ====================

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
      await updateTopic(topicoId, { completed });
      return true;
    } catch (error) {
      console.error("Erro ao atualizar tópico:", error);
      return false;
    }
  }, [updateTopic]);

  // Buscar questões de um concurso
  const buscarQuestoesConcurso = useCallback(async (concursoId: string): Promise<Questao[]> => {
    try {
      const questoes = await fetchQuestions(concursoId);
      return questoes || [];
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      return [];
    }
  }, [fetchQuestions]);

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
    // Estado (do cache)
    concursos: cache.concursos,
    loading: cache.loading,
    error: cache.error,
    
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
    
    // Utilitários
    invalidateCache,
    getCacheStats,
    
    // Validação (exposta para uso direto se necessário)
    validation,
    
    // Funções específicas
    fetchConcursoCompleto,
    atualizarTopicoCompletado,
    buscarQuestoesConcurso,
    calcularProgressoConcurso,
    createTestData,
    
    // Funções legadas para compatibilidade
    adicionarConcurso,
    atualizarConcurso,
    removerConcurso,
    buscarConcursoPorId,
  };
}