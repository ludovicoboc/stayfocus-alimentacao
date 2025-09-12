/**
 * SUP-6: Hook use-concursos migrado para abstração de banco de dados
 * Validação da arquitetura implementada
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useDatabase, useDatabaseCRUD } from "@/hooks/shared/use-database"
import { useAsyncState } from "@/hooks/shared/use-async-state"
import { useAuth } from "@/lib/auth-provider"
import type { 
  Concurso, 
  Questao, 
  QuestionOption, 
  SimulationResults,
  ConcursoInput,
  QuestaoInput 
} from "@/types/concursos"
import { 
  validateConcurso, 
  validateQuestao, 
  validateQuestionOptions, 
  validateSimulationResults, 
  validateData, 
  sanitizeString, 
  sanitizeDate, 
  sanitizeArray, 
  sanitizeNumber 
} from "@/utils/validations-migration"

export function useConcursosAbstracted() {
  const { user } = useAuth()
  
  // SUP-6: Usar abstração de banco de dados
  const db = useDatabase()
  const concursosCrud = useDatabaseCRUD<Concurso>('competitions')
  const questoesCrud = useDatabaseCRUD<Questao>('questions')
  
  // SUP-5: Estados async padronizados
  const concursosState = useAsyncState<Concurso[]>({
    initialData: [],
    onError: (error) => console.error("Erro em concursos:", error)
  })
  
  const questoesState = useAsyncState<Questao[]>({
    initialData: [],
    onError: (error) => console.error("Erro em questões:", error)
  })
  
  // Compatibilidade com API existente
  const concursos = concursosState.data || []
  const questoes = questoesState.data || []
  const loading = concursosState.loading || questoesState.loading
  const error = concursosState.error || questoesState.error

  // SUP-6: Fetch concursos usando abstração
  const fetchConcursos = useCallback(async () => {
    return await concursosState.execute(async () => {
      // Usar CRUD abstrato ao invés de query Supabase direta
      const concursos = await concursosCrud.findAll({
        orderBy: [{ column: 'created_at', ascending: false }]
      })
      
      return concursos
    })
  }, [concursosCrud, concursosState.execute])

  // SUP-6: Create concurso usando abstração
  const createConcurso = useCallback(async (novoConcurso: Omit<Concurso, "id" | "created_at" | "updated_at">) => {
    try {
      // SUP-4: Validar dados usando tipagem forte
      const validation = validateConcurso(novoConcurso as ConcursoInput)
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`)
      }

      // Sanitizar dados
      const dadosSanitizados = {
        title: sanitizeString(novoConcurso.title),
        organizer: sanitizeString(novoConcurso.organizer),
        exam_date: sanitizeDate(novoConcurso.exam_date),
        status: novoConcurso.status,
        description: novoConcurso.description ? sanitizeString(novoConcurso.description) : null,
        total_questions: sanitizeNumber(novoConcurso.total_questions || 0),
        duration_minutes: sanitizeNumber(novoConcurso.duration_minutes || 0),
        subjects: sanitizeArray(novoConcurso.subjects || [])
      }

      // SUP-6: Usar CRUD abstrato
      const novoConcursoSalvo = await concursosCrud.create(dadosSanitizados)
      
      if (novoConcursoSalvo) {
        // Atualizar estado local
        const concursosAtualizados = [novoConcursoSalvo, ...concursos]
        concursosState.setData(concursosAtualizados)
      }
      
      return novoConcursoSalvo
    } catch (error) {
      console.error("Erro ao criar concurso:", error)
      throw error
    }
  }, [concursosCrud, concursos, concursosState.setData])

  // SUP-6: Update concurso usando abstração
  const updateConcurso = useCallback(async (id: string, updates: Partial<Concurso>) => {
    try {
      // SUP-4: Validar dados parciais
      const validation = validateData(updates, validateConcurso)
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`)
      }

      // Sanitizar apenas campos fornecidos
      const updatesSanitizados: any = {}
      if (updates.title !== undefined) updatesSanitizados.title = sanitizeString(updates.title)
      if (updates.organizer !== undefined) updatesSanitizados.organizer = sanitizeString(updates.organizer)
      if (updates.exam_date !== undefined) updatesSanitizados.exam_date = sanitizeDate(updates.exam_date)
      if (updates.status !== undefined) updatesSanitizados.status = updates.status
      if (updates.description !== undefined) updatesSanitizados.description = updates.description ? sanitizeString(updates.description) : null
      if (updates.total_questions !== undefined) updatesSanitizados.total_questions = sanitizeNumber(updates.total_questions)
      if (updates.duration_minutes !== undefined) updatesSanitizados.duration_minutes = sanitizeNumber(updates.duration_minutes)
      if (updates.subjects !== undefined) updatesSanitizados.subjects = sanitizeArray(updates.subjects)

      // SUP-6: Usar CRUD abstrato
      const concursoAtualizado = await concursosCrud.updateById(id, updatesSanitizados)
      
      if (concursoAtualizado) {
        // Atualizar estado local
        const concursosAtualizados = concursos.map(concurso => 
          concurso.id === id ? { ...concurso, ...concursoAtualizado } : concurso
        )
        concursosState.setData(concursosAtualizados)
      }
      
      return concursoAtualizado
    } catch (error) {
      console.error("Erro ao atualizar concurso:", error)
      throw error
    }
  }, [concursosCrud, concursos, concursosState.setData])

  // SUP-6: Delete concurso usando abstração
  const deleteConcurso = useCallback(async (id: string) => {
    try {
      const sucesso = await concursosCrud.deleteById(id)
      
      if (sucesso) {
        // Atualizar estado local
        const concursosAtualizados = concursos.filter(concurso => concurso.id !== id)
        concursosState.setData(concursosAtualizados)
      }
      
      return sucesso
    } catch (error) {
      console.error("Erro ao deletar concurso:", error)
      throw error
    }
  }, [concursosCrud, concursos, concursosState.setData])

  // SUP-6: Fetch questões usando abstração
  const fetchQuestoesDoConcurso = useCallback(async (concursoId: string): Promise<Questao[]> => {
    try {
      // Usar database abstrato com filtros
      const questoes = await questoesCrud.findAll({
        filters: db.createFilter().eq('competition_id', concursoId).build(),
        orderBy: [{ column: 'order_number', ascending: true }]
      })
      
      return questoes
    } catch (error) {
      console.error("Erro ao buscar questões do concurso:", error)
      return []
    }
  }, [questoesCrud, db])

  // SUP-6: Create questão usando abstração
  const createQuestao = useCallback(async (novaQuestao: Omit<Questao, "id" | "created_at" | "updated_at">) => {
    try {
      // SUP-4: Validar dados usando tipagem forte
      const validation = validateQuestao(novaQuestao as QuestaoInput)
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`)
      }

      // Sanitizar dados
      const dadosSanitizados = {
        competition_id: novaQuestao.competition_id,
        question_text: sanitizeString(novaQuestao.question_text),
        question_type: novaQuestao.question_type,
        difficulty: novaQuestao.difficulty,
        subject: sanitizeString(novaQuestao.subject),
        options: sanitizeArray(novaQuestao.options || []),
        correct_answer: novaQuestao.correct_answer ? sanitizeString(novaQuestao.correct_answer) : null,
        explanation: novaQuestao.explanation ? sanitizeString(novaQuestao.explanation) : null,
        order_number: sanitizeNumber(novaQuestao.order_number || 1)
      }

      // SUP-6: Usar CRUD abstrato
      const novaQuestaoSalva = await questoesCrud.create(dadosSanitizados)
      
      if (novaQuestaoSalva) {
        // Atualizar estado local
        const questoesAtualizadas = [...questoes, novaQuestaoSalva]
        questoesState.setData(questoesAtualizadas)
      }
      
      return novaQuestaoSalva
    } catch (error) {
      console.error("Erro ao criar questão:", error)
      throw error
    }
  }, [questoesCrud, questoes, questoesState.setData])

  // SUP-6: Simulação usando abstração
  const executarSimulacao = useCallback(async (concursoId: string, respostas: Record<string, string>) => {
    try {
      // Buscar questões do concurso
      const questoesConcurso = await fetchQuestoesDoConcurso(concursoId)
      
      // Calcular resultado
      let acertos = 0
      const resultadoDetalhado = questoesConcurso.map(questao => {
        const respostaUsuario = respostas[questao.id]
        const acertou = respostaUsuario === questao.correct_answer
        if (acertou) acertos++
        
        return {
          questao_id: questao.id,
          resposta_usuario: respostaUsuario,
          resposta_correta: questao.correct_answer,
          acertou
        }
      })

      const resultado = {
        concurso_id: concursoId,
        total_questoes: questoesConcurso.length,
        acertos,
        porcentagem: questoesConcurso.length > 0 ? (acertos / questoesConcurso.length) * 100 : 0,
        detalhes: resultadoDetalhado,
        data_simulacao: new Date().toISOString()
      }

      // Salvar resultado usando abstração
      const resultadoSalvo = await db.insert('simulation_results', {
        ...resultado,
        user_id: user?.id
      })

      return resultado
    } catch (error) {
      console.error("Erro ao executar simulação:", error)
      throw error
    }
  }, [fetchQuestoesDoConcurso, db, user])

  // SUP-6: Estatísticas usando abstração
  const getEstatisticasConcurso = useCallback(async (concursoId: string) => {
    try {
      // Buscar simulações do concurso usando query builder
      const simulacoes = await db.select('simulation_results', {
        filters: db.createFilter()
          .eq('concurso_id', concursoId)
          .eq('user_id', user?.id)
          .build(),
        orderBy: [{ column: 'created_at', ascending: false }]
      })

      const dados = simulacoes.data || []

      if (dados.length === 0) {
        return {
          totalSimulacoes: 0,
          melhorPontuacao: 0,
          pontuacaoMedia: 0,
          progressoTempo: []
        }
      }

      const pontuacoes = dados.map((sim: any) => sim.porcentagem || 0)
      const melhorPontuacao = Math.max(...pontuacoes)
      const pontuacaoMedia = pontuacoes.reduce((a, b) => a + b, 0) / pontuacoes.length

      return {
        totalSimulacoes: dados.length,
        melhorPontuacao,
        pontuacaoMedia: Math.round(pontuacaoMedia * 100) / 100,
        progressoTempo: dados.map((sim: any) => ({
          data: sim.data_simulacao,
          pontuacao: sim.porcentagem
        }))
      }
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error)
      return {
        totalSimulacoes: 0,
        melhorPontuacao: 0,
        pontuacaoMedia: 0,
        progressoTempo: []
      }
    }
  }, [db, user])

  // SUP-6: Progresso usando abstração
  const calcularProgressoConcurso = useCallback(async (concursoId: string) => {
    try {
      // Buscar total de questões
      const concurso = concursos.find(c => c.id === concursoId)
      if (!concurso) return { progresso: 0, questoesRealizadas: 0, totalQuestoes: 0 }

      // Buscar questões respondidas usando filtros abstratos
      const respostasUsuario = await db.select('user_answers', {
        filters: db.createFilter()
          .eq('competition_id', concursoId)
          .eq('user_id', user?.id)
          .build()
      })

      const questoesRealizadas = respostasUsuario.data?.length || 0
      const totalQuestoes = concurso.total_questions || 0
      const progresso = totalQuestoes > 0 ? (questoesRealizadas / totalQuestoes) * 100 : 0

      return {
        progresso: Math.round(progresso * 100) / 100,
        questoesRealizadas,
        totalQuestoes
      }
    } catch (error) {
      console.error("Erro ao calcular progresso:", error)
      return { progresso: 0, questoesRealizadas: 0, totalQuestoes: 0 }
    }
  }, [concursos, db, user])

  // Carregar dados na inicialização
  useEffect(() => {
    if (db.isAuthenticated) {
      fetchConcursos()
    }
  }, [db.isAuthenticated, fetchConcursos])

  return {
    // Estado
    concursos,
    questoes,
    loading,
    error,
    
    // Ações CRUD para concursos
    createConcurso,
    updateConcurso,
    deleteConcurso,
    fetchConcursos,
    
    // Ações para questões
    createQuestao,
    fetchQuestoesDoConcurso,
    
    // Simulações
    executarSimulacao,
    getEstatisticasConcurso,
    calcularProgressoConcurso,
    
    // Utilitários
    refreshConcursos: fetchConcursos,
    isAuthenticated: db.isAuthenticated,
    
    // SUP-6: Acesso direto à abstração (se necessário)
    database: db,
    concursosCrud,
    questoesCrud
  }
}