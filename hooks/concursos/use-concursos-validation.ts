"use client";

import { useCallback } from "react";
import type { Concurso, Disciplina, Topico, Questao } from "@/types";
import { 
  validateConcurso, 
  validateQuestao, 
  validateQuestionOptions, 
  validateSimulationResults,
  sanitizeString, 
  sanitizeDate, 
  sanitizeArray, 
  sanitizeNumber 
} from "@/utils/validations-migration";

/**
 * Hook especializado para validação e sanitização de dados
 * Responsabilidade única: Validação e limpeza de dados
 */
export function useConcursosValidation() {

  // ==================== VALIDAÇÃO DE CONCURSOS ====================

  // Validar dados de concurso
  const validateConcursoData = useCallback((data: Partial<Concurso>) => {
    const result = validateConcurso(data);
    if (!result.isValid) {
      throw new Error(`Dados inválidos: ${result.errors.join(', ')}`);
    }
    return result;
  }, []);

  // Sanitizar dados de concurso
  const sanitizeConcursoData = useCallback((data: Partial<Concurso>): Partial<Concurso> => {
    return {
      ...data,
      title: data.title ? sanitizeString(data.title) : undefined,
      organizer: data.organizer ? sanitizeString(data.organizer) : undefined,
      registration_date: data.registration_date ? sanitizeDate(data.registration_date) : undefined,
      exam_date: data.exam_date ? sanitizeDate(data.exam_date) : undefined,
      edital_link: data.edital_link ? sanitizeString(data.edital_link) : undefined,
    };
  }, []);

  // Validar e sanitizar concurso
  const processeConcursoData = useCallback((data: Partial<Concurso>) => {
    const sanitized = sanitizeConcursoData(data);
    const validation = validateConcursoData(sanitized);
    return { data: sanitized, validation };
  }, [sanitizeConcursoData, validateConcursoData]);

  // ==================== VALIDAÇÃO DE DISCIPLINAS ====================

  // Validar dados de disciplina
  const validateDisciplinaData = useCallback((data: Partial<Disciplina>) => {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Nome da disciplina é obrigatório');
    }

    if (data.progress !== undefined) {
      if (typeof data.progress !== 'number' || data.progress < 0 || data.progress > 100) {
        errors.push('Progresso deve ser um número entre 0 e 100');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Sanitizar dados de disciplina
  const sanitizeDisciplinaData = useCallback((data: Partial<Disciplina>): Partial<Disciplina> => {
    return {
      ...data,
      name: data.name ? sanitizeString(data.name) : undefined,
      progress: data.progress !== undefined ? sanitizeNumber(data.progress) || undefined : undefined,
    };
  }, []);

  // Processar dados de disciplina
  const processDisciplinaData = useCallback((data: Partial<Disciplina>) => {
    const sanitized = sanitizeDisciplinaData(data);
    const validation = validateDisciplinaData(sanitized);
    
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    return { data: sanitized, validation };
  }, [sanitizeDisciplinaData, validateDisciplinaData]);

  // ==================== VALIDAÇÃO DE TÓPICOS ====================

  // Validar dados de tópico
  const validateTopicoData = useCallback((data: Partial<Topico>) => {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Nome do tópico é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Sanitizar dados de tópico
  const sanitizeTopicoData = useCallback((data: Partial<Topico>): Partial<Topico> => {
    return {
      ...data,
      name: data.name ? sanitizeString(data.name) : undefined,
      completed: data.completed !== undefined ? Boolean(data.completed) : undefined,
    };
  }, []);

  // Processar dados de tópico
  const processTopicoData = useCallback((data: Partial<Topico>) => {
    const sanitized = sanitizeTopicoData(data);
    const validation = validateTopicoData(sanitized);
    
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }
    
    return { data: sanitized, validation };
  }, [sanitizeTopicoData, validateTopicoData]);

  // ==================== VALIDAÇÃO DE QUESTÕES ====================

  // Validar dados de questão
  const validateQuestaoData = useCallback((data: Partial<Questao>) => {
    const result = validateQuestao(data);
    if (!result.isValid) {
      throw new Error(`Dados inválidos: ${result.errors.join(', ')}`);
    }
    return result;
  }, []);

  // Sanitizar dados de questão
  const sanitizeQuestaoData = useCallback((data: Partial<Questao>): Partial<Questao> => {
    return {
      ...data,
      question_text: data.question_text ? sanitizeString(data.question_text) : undefined,
      correct_answer: data.correct_answer ? sanitizeString(data.correct_answer) : undefined,
      explanation: data.explanation ? sanitizeString(data.explanation) : undefined,
      source: data.source ? sanitizeString(data.source) : undefined,
      tags: data.tags ? sanitizeArray(data.tags) : undefined,
      points: data.points !== undefined ? sanitizeNumber(data.points) || undefined : undefined,
      time_limit_seconds: data.time_limit_seconds !== undefined ? sanitizeNumber(data.time_limit_seconds) || undefined : undefined,
      year: data.year !== undefined ? sanitizeNumber(data.year) || undefined : undefined,
      usage_count: data.usage_count !== undefined ? sanitizeNumber(data.usage_count) || undefined : undefined,
    };
  }, []);

  // Processar dados de questão
  const processQuestaoData = useCallback((data: Partial<Questao>) => {
    const sanitized = sanitizeQuestaoData(data);
    const validation = validateQuestaoData(sanitized);
    return { data: sanitized, validation };
  }, [sanitizeQuestaoData, validateQuestaoData]);

  // ==================== VALIDAÇÃO DE OPÇÕES DE QUESTÃO ====================

  // Validar opções de questão
  const validateQuestionOptionsData = useCallback((options: any) => {
    const result = validateQuestionOptions(options);
    if (!result.isValid) {
      throw new Error(`Opções inválidas: ${result.errors.join(', ')}`);
    }
    return result;
  }, []);

  // ==================== VALIDAÇÃO DE RESULTADOS DE SIMULAÇÃO ====================

  // Validar resultados de simulação
  const validateSimulationResultsData = useCallback((results: any) => {
    const result = validateSimulationResults(results);
    if (!result.isValid) {
      throw new Error(`Resultados inválidos: ${result.errors.join(', ')}`);
    }
    return result;
  }, []);

  // ==================== VALIDAÇÕES COMPOSTAS ====================

  // Validar dados completos de concurso (com disciplinas e questões)
  const validateConcursoCompleto = useCallback((data: {
    concurso: Partial<Concurso>;
    disciplinas?: Partial<Disciplina>[];
    questoes?: Partial<Questao>[];
  }) => {
    const errors: string[] = [];

    // Validar concurso principal
    try {
      validateConcursoData(data.concurso);
    } catch (error) {
      errors.push(`Concurso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    // Validar disciplinas
    if (data.disciplinas) {
      data.disciplinas.forEach((disciplina, index) => {
        try {
          const validation = validateDisciplinaData(disciplina);
          if (!validation.isValid) {
            errors.push(`Disciplina ${index + 1}: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`Disciplina ${index + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      });
    }

    // Validar questões
    if (data.questoes) {
      data.questoes.forEach((questao, index) => {
        try {
          validateQuestaoData(questao);
        } catch (error) {
          errors.push(`Questão ${index + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [validateConcursoData, validateDisciplinaData, validateQuestaoData]);

  // ==================== UTILITÁRIOS DE VALIDAÇÃO ====================

  // Verificar se string é válida
  const isValidString = useCallback((value: any, minLength = 1): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength;
  }, []);

  // Verificar se número é válido
  const isValidNumber = useCallback((value: any, min?: number, max?: number): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }, []);

  // Verificar se data é válida
  const isValidDate = useCallback((value: any): boolean => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, []);

  // Verificar se array é válido
  const isValidArray = useCallback((value: any, minLength = 0): boolean => {
    return Array.isArray(value) && value.length >= minLength;
  }, []);

  return {
    // Validação de concursos
    validateConcursoData,
    sanitizeConcursoData,
    processeConcursoData,
    
    // Validação de disciplinas
    validateDisciplinaData,
    sanitizeDisciplinaData,
    processDisciplinaData,
    
    // Validação de tópicos
    validateTopicoData,
    sanitizeTopicoData,
    processTopicoData,
    
    // Validação de questões
    validateQuestaoData,
    sanitizeQuestaoData,
    processQuestaoData,
    
    // Validação de opções e resultados
    validateQuestionOptionsData,
    validateSimulationResultsData,
    
    // Validações compostas
    validateConcursoCompleto,
    
    // Utilitários
    isValidString,
    isValidNumber,
    isValidDate,
    isValidArray,
  };
}