"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { createDebouncedFunction } from "@/lib/request-debouncer";
import { optimizedAuthCache } from "@/lib/auth-cache";
import type { 
  Concurso, 
  Questao, 
  SimuladoRuntime as Simulado, 
  SimuladoData, 
  SimuladoResultado, 
  SimuladoStatus 
} from "@/types";
import { validateConcurso, sanitizeString, sanitizeDate } from "@/utils/validations-migration";
import { handleSupabaseCompetitionError } from "@/lib/error-handler";

// Types para o contexto
interface ConcursosContextType {
  // Estados de concursos
  concursos: Concurso[];
  concursosLoading: boolean;
  concursosError: string | null;
  
  // Estados de simulados
  simuladoAtual: Simulado | null;
  simuladoStatus: SimuladoStatus;
  simuladosHistorico: SimuladoResultado[];
  simuladosLoading: boolean;
  simuladosError: string | null;
  
  // Operações de concursos
  fetchConcursos: () => Promise<void>;
  createCompetition: (data: Partial<Concurso>) => Promise<Concurso>;
  updateCompetition: (id: string, updates: Partial<Concurso>) => Promise<void>;
  deleteCompetition: (id: string) => Promise<void>;
  getConcursoById: (id: string) => Concurso | null;
  
  // Operações de simulados
  gerarSimulado: (concursoId: string, numeroQuestoes: number) => Promise<boolean>;
  carregarSimulado: (data: SimuladoData, concursoId?: string) => Promise<boolean>;
  salvarResultado: (resultado: Partial<SimuladoResultado>) => Promise<void>;
  fetchSimuladosHistorico: () => Promise<void>;
  resetSimulado: () => void;
}

// Cache otimizado
const competitionsCache = new Map<string, { data: Concurso[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Context
const ConcursosContext = createContext<ConcursosContextType | null>(null);

// Provider
interface ConcursosProviderProps {
  children: ReactNode;
}

export function ConcursosProvider({ children }: ConcursosProviderProps) {
  const { user } = useAuth();
  const supabase = createClient();
  
  // Estados de concursos
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [concursosLoading, setConcursosLoading] = useState(false);
  const [concursosError, setConcursosError] = useState<string | null>(null);
  
  // Estados de simulados
  const [simuladoAtual, setSimuladoAtual] = useState<Simulado | null>(null);
  const [simuladoStatus, setSimuladoStatus] = useState<SimuladoStatus>("idle");
  const [simuladosHistorico, setSimuladosHistorico] = useState<SimuladoResultado[]>([]);
  const [simuladosLoading, setSimuladosLoading] = useState(false);
  const [simuladosError, setSimuladosError] = useState<string | null>(null);

  // Função debounced para fetch de concursos
  const debouncedFetchConcursos = createDebouncedFunction(
    "concursos_fetch",
    async (userId: string) => {
      return await performFetchConcursos(userId);
    },
    'API_CALL'
  );

  // Executa busca otimizada de concursos
  async function performFetchConcursos(userId: string): Promise<Concurso[]> {
    const cacheKey = `concursos_${userId}`;
    const cached = competitionsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from("competitions")
      .select(`
        id, user_id, title, organizer, registration_date, exam_date, 
        edital_link, status, created_at, updated_at,
        subjects (
          id, competition_id, name, progress, created_at, updated_at,
          topics (id, subject_id, name, completed, created_at, updated_at)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(handleSupabaseCompetitionError(error));
    }

    const competitions = (data || []).map((comp: any) => ({
      ...comp,
      disciplinas: comp.subjects?.map((subject: any) => ({
        ...subject,
        topicos: subject.topics || []
      })) || []
    }));

    // Atualizar cache
    competitionsCache.set(cacheKey, {
      data: competitions,
      timestamp: Date.now()
    });

    return competitions;
  }

  // Buscar concursos
  const fetchConcursos = useCallback(async () => {
    if (!user?.id) return;
    
    setConcursosLoading(true);
    setConcursosError(null);
    
    try {
      const competitions = await debouncedFetchConcursos(user.id);
      setConcursos(competitions);
    } catch (error) {
      console.error("Erro ao buscar concursos:", error);
      setConcursosError(error instanceof Error ? error.message : "Erro desconhecido");
      setConcursos([]);
    } finally {
      setConcursosLoading(false);
    }
  }, [user?.id, debouncedFetchConcursos]);

  // Criar concurso
  const createCompetition = useCallback(async (competitionData: Partial<Concurso>): Promise<Concurso> => {
    if (!user?.id) throw new Error("Usuário não autenticado");

    const sanitizedData = {
      ...competitionData,
      title: sanitizeString(competitionData.title || ""),
      organizer: sanitizeString(competitionData.organizer || ""),
      registration_date: competitionData.registration_date ? sanitizeDate(competitionData.registration_date) : null,
      exam_date: competitionData.exam_date ? sanitizeDate(competitionData.exam_date) : null,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from("competitions")
      .insert([sanitizedData])
      .select()
      .single();

    if (error) {
      throw new Error(handleSupabaseCompetitionError(error));
    }

    // Atualizar estado local
    setConcursos(prev => [data, ...prev]);
    
    // Invalidar cache
    competitionsCache.delete(`concursos_${user.id}`);
    
    return data;
  }, [user?.id, supabase]);

  // Atualizar concurso
  const updateCompetition = useCallback(async (competitionId: string, updates: Partial<Concurso>) => {
    if (!user?.id) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("competitions")
      .update(updates)
      .eq("id", competitionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(handleSupabaseCompetitionError(error));
    }

    // Atualizar estado local
    setConcursos(prev => 
      prev.map(comp => comp.id === competitionId ? { ...comp, ...data } : comp)
    );
    
    // Invalidar cache
    competitionsCache.delete(`concursos_${user.id}`);
  }, [user?.id, supabase]);

  // Deletar concurso
  const deleteCompetition = useCallback(async (competitionId: string) => {
    if (!user?.id) throw new Error("Usuário não autenticado");

    const { error } = await supabase
      .from("competitions")
      .delete()
      .eq("id", competitionId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(handleSupabaseCompetitionError(error));
    }

    // Atualizar estado local
    setConcursos(prev => prev.filter(comp => comp.id !== competitionId));
    
    // Invalidar cache
    competitionsCache.delete(`concursos_${user.id}`);
  }, [user?.id, supabase]);

  // Buscar concurso por ID
  const getConcursoById = useCallback((id: string): Concurso | null => {
    return concursos.find(c => c.id === id) || null;
  }, [concursos]);

  // Buscar histórico de simulados
  const fetchSimuladosHistorico = useCallback(async () => {
    if (!user?.id) return;

    setSimuladosLoading(true);
    setSimuladosError(null);

    try {
      const { data, error } = await supabase
        .from("simulation_history")
        .select("id, user_id, simulation_id, score, total_questions, percentage, time_taken_minutes, answers, completed_at, created_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setSimuladosHistorico(data || []);
    } catch (error) {
      console.error("Error fetching simulation history:", error);
      setSimuladosError(error instanceof Error ? error.message : "Erro ao buscar histórico");
    } finally {
      setSimuladosLoading(false);
    }
  }, [user?.id, supabase]);

  // Gerar simulado
  const gerarSimulado = useCallback(async (concursoId: string, numeroQuestoes: number): Promise<boolean> => {
    if (!user?.id) return false;

    setSimuladosLoading(true);
    setSimuladosError(null);

    try {
      // Buscar questões do concurso
      const { data: questoes, error } = await supabase
        .from("questions")
        .select("*")
        .eq("competition_id", concursoId)
        .limit(numeroQuestoes);

      if (error) throw error;

      if (!questoes || questoes.length === 0) {
        setSimuladosError("Nenhuma questão encontrada para este concurso.");
        return false;
      }

      if (questoes.length < numeroQuestoes) {
        setSimuladosError(`Apenas ${questoes.length} questões disponíveis para este concurso.`);
        return false;
      }

      // Buscar informações do concurso
      const concurso = getConcursoById(concursoId);
      if (!concurso) {
        setSimuladosError("Concurso não encontrado.");
        return false;
      }

      // Converter para formato de simulado
      const simuladoData: SimuladoData = {
        metadata: {
          titulo: `Simulado - ${concurso.title}`,
          concurso: concurso.title,
          ano: new Date().getFullYear(),
          totalQuestoes: questoes.length,
          autor: "StayFocus"
        },
        questoes: questoes.map((q: any) => ({
          id: q.id,
          enunciado: q.question_text,
          alternativas: q.options || [],
          gabarito: q.correct_answer,
          explicacao: q.explanation,
          disciplina: q.subject_id,
          topico: q.topic_id,
          dificuldade: q.difficulty,
          fonte: q.source,
          ano: q.year
        }))
      };

      return await carregarSimulado(simuladoData, concursoId);
    } catch (error) {
      console.error("Error generating simulation:", error);
      setSimuladosError("Erro ao gerar simulado. Tente novamente.");
      return false;
    } finally {
      setSimuladosLoading(false);
    }
  }, [user?.id, supabase, getConcursoById]);

  // Carregar simulado
  const carregarSimulado = useCallback(async (data: SimuladoData, concursoId?: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Salvar simulado no banco se tiver concursoId
      if (concursoId) {
        const { data: simuladoSalvo, error } = await supabase
          .from("simulations")
          .insert({
            user_id: user.id,
            competition_id: concursoId,
            title: data.metadata.titulo,
            description: `Simulado gerado automaticamente para ${data.metadata.concurso}`,
            questions: data.questoes.map(q => q.id),
            question_count: data.questoes.length,
            status: "active",
            is_favorite: false
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao salvar simulado:", error);
        }
      }

      // Configurar simulado atual
      setSimuladoAtual({
        id: Date.now().toString(),
        title: data.metadata.titulo,
        metadata: data.metadata,
        questions: data.questoes,
        user_answers: {},
        score: 0,
        total_questions: data.questoes.length,
        completed: false,
        started_at: new Date().toISOString()
      } as Simulado);

      setSimuladoStatus("loading");
      return true;
    } catch (error) {
      console.error("Error loading simulation:", error);
      setSimuladosError("Erro ao carregar simulado.");
      return false;
    }
  }, [user?.id, supabase]);

  // Salvar resultado
  const salvarResultado = useCallback(async (resultado: Partial<SimuladoResultado>) => {
    if (!user?.id || !simuladoAtual) return;

    try {
      const { error } = await supabase
        .from("simulation_history")
        .insert({
          user_id: user.id,
          simulation_id: simuladoAtual.id,
          score: resultado.score || 0,
          total_questions: resultado.total_questions || 0,
          percentage: resultado.percentage || 0,
          time_taken_minutes: resultado.time_taken_minutes,
          answers: resultado.answers || {},
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar histórico local
      await fetchSimuladosHistorico();
      
      setSimuladoStatus("results");
    } catch (error) {
      console.error("Error saving result:", error);
      setSimuladosError("Erro ao salvar resultado.");
    }
  }, [user?.id, simuladoAtual, supabase, fetchSimuladosHistorico]);

  // Reset simulado
  const resetSimulado = useCallback(() => {
    setSimuladoAtual(null);
    setSimuladoStatus("idle");
    setSimuladosError(null);
  }, []);

  // Efeitos
  useEffect(() => {
    if (user?.id) {
      fetchConcursos();
      fetchSimuladosHistorico();
    }
  }, [user?.id, fetchConcursos, fetchSimuladosHistorico]);

  // Valor do contexto
  const contextValue: ConcursosContextType = {
    // Estados de concursos
    concursos,
    concursosLoading,
    concursosError,
    
    // Estados de simulados
    simuladoAtual,
    simuladoStatus,
    simuladosHistorico,
    simuladosLoading,
    simuladosError,
    
    // Operações de concursos
    fetchConcursos,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    getConcursoById,
    
    // Operações de simulados
    gerarSimulado,
    carregarSimulado,
    salvarResultado,
    fetchSimuladosHistorico,
    resetSimulado
  };

  return (
    <ConcursosContext.Provider value={contextValue}>
      {children}
    </ConcursosContext.Provider>
  );
}

// Hook para usar o contexto
export function useConcursosContext() {
  const context = useContext(ConcursosContext);
  if (!context) {
    throw new Error("useConcursosContext deve ser usado dentro de ConcursosProvider");
  }
  return context;
}

// Hooks especializados para compatibilidade
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
    getConcursoById
  };
}

export function useSimulados() {
  const {
    simuladoAtual,
    simuladoStatus: status,
    simuladosHistorico: historico,
    simuladosLoading: loading,
    simuladosError: error,
    gerarSimulado,
    carregarSimulado,
    salvarResultado,
    fetchSimuladosHistorico: fetchHistorico,
    resetSimulado
  } = useConcursosContext();

  return {
    simuladoAtual,
    status,
    historico,
    loading,
    error,
    gerarSimulado,
    carregarSimulado,
    salvarResultado,
    fetchHistorico,
    resetSimulado
  };
}