"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { useAsyncState } from "@/hooks/shared/use-async-state";
import { useToast } from "@/hooks/use-toast";

/**
 * SUP-5: Exemplo de migração - useQuestions com estados async padronizados
 * Demonstra como migrar hooks existentes para o padrão consistente
 */

// Tipos para o hook
interface Question {
  id: string;
  competition_id: string;
  subject_id?: string;
  topic_id?: string;
  question_text: string;
  options?: any[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: 'facil' | 'medio' | 'dificil';
  question_type?: 'multiple_choice' | 'true_false' | 'essay' | 'short_answer';
  points?: number;
  time_limit_seconds?: number;
  tags?: string[];
  source?: string;
  year?: number;
  is_active?: boolean;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface QuestionFilters {
  subject_id?: string;
  topic_id?: string;
  difficulty?: string;
  question_type?: string;
  search?: string;
}

interface QuestionStats {
  total: number;
  byDifficulty: Record<string, number>;
  bySubject: Record<string, number>;
  byType: Record<string, number>;
}

export function useQuestions(competitionId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  // Estado async padronizado para questões
  const questionsState = useAsyncState<Question[]>({
    initialData: [],
    onError: (error) => {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      console.log(`Carregadas ${data?.length || 0} questões`);
    },
    retryCount: 2,
    retryDelay: 1000
  });

  // Estado async para estatísticas
  const statsState = useAsyncState<QuestionStats>({
    initialData: {
      total: 0,
      byDifficulty: {},
      bySubject: {},
      byType: {}
    }
  });

  // Carregar questões com filtros
  const loadQuestions = useCallback(
    async (filters?: QuestionFilters) => {
      if (!user || !competitionId) return;

      return await questionsState.execute(async () => {
        let query = supabase
          .from("competition_questions")
          .select(`
            *,
            competition_subjects (
              id,
              name
            ),
            competition_topics (
              id,
              name
            )
          `)
          .eq("competition_id", competitionId)
          .eq("is_active", true);

        // Aplicar filtros
        if (filters?.subject_id) {
          query = query.eq("subject_id", filters.subject_id);
        }

        if (filters?.topic_id) {
          query = query.eq("topic_id", filters.topic_id);
        }

        if (filters?.difficulty) {
          query = query.eq("difficulty", filters.difficulty);
        }

        if (filters?.question_type) {
          query = query.eq("question_type", filters.question_type);
        }

        if (filters?.search) {
          query = query.ilike("question_text", `%${filters.search}%`);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) {
          throw new Error(`Erro ao carregar questões: ${error.message}`);
        }

        return data || [];
      });
    },
    [user, competitionId, supabase, questionsState, toast]
  );

  // Criar questão
  const createQuestion = useCallback(
    async (questionData: Partial<Question>) => {
      if (!user || !competitionId) return null;

      return await questionsState.execute(async () => {
        const { data, error } = await supabase
          .from("competition_questions")
          .insert([
            {
              ...questionData,
              competition_id: competitionId,
              is_active: true,
              usage_count: 0,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new Error(`Erro ao criar questão: ${error.message}`);
        }

        // Adicionar à lista local
        if (questionsState.data) {
          questionsState.setData([data, ...questionsState.data]);
        }

        toast({
          title: "Sucesso",
          description: "Questão criada com sucesso!",
        });

        return data;
      });
    },
    [user, competitionId, supabase, questionsState, toast]
  );

  // Atualizar questão
  const updateQuestion = useCallback(
    async (questionId: string, updates: Partial<Question>) => {
      if (!user) return null;

      return await questionsState.execute(async () => {
        const { data, error } = await supabase
          .from("competition_questions")
          .update(updates)
          .eq("id", questionId)
          .select()
          .single();

        if (error) {
          throw new Error(`Erro ao atualizar questão: ${error.message}`);
        }

        // Atualizar na lista local
        if (questionsState.data) {
          const updatedQuestions = questionsState.data.map(q =>
            q.id === questionId ? { ...q, ...data } : q
          );
          questionsState.setData(updatedQuestions);
        }

        toast({
          title: "Sucesso",
          description: "Questão atualizada com sucesso!",
        });

        return data;
      });
    },
    [user, supabase, questionsState, toast]
  );

  // Deletar questão
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      if (!user) return false;

      return await questionsState.execute(async () => {
        const { error } = await supabase
          .from("competition_questions")
          .delete()
          .eq("id", questionId);

        if (error) {
          throw new Error(`Erro ao deletar questão: ${error.message}`);
        }

        // Remover da lista local
        if (questionsState.data) {
          const filteredQuestions = questionsState.data.filter(q => q.id !== questionId);
          questionsState.setData(filteredQuestions);
        }

        toast({
          title: "Sucesso",
          description: "Questão deletada com sucesso!",
        });

        return true;
      });
    },
    [user, supabase, questionsState, toast]
  );

  // Calcular estatísticas
  const calculateStats = useCallback(async () => {
    if (!questionsState.data) return;

    return await statsState.execute(async () => {
      const questions = questionsState.data!;
      
      const stats: QuestionStats = {
        total: questions.length,
        byDifficulty: {},
        bySubject: {},
        byType: {}
      };

      questions.forEach(question => {
        // Por dificuldade
        if (question.difficulty) {
          stats.byDifficulty[question.difficulty] = 
            (stats.byDifficulty[question.difficulty] || 0) + 1;
        }

        // Por disciplina
        if (question.subject_id) {
          stats.bySubject[question.subject_id] = 
            (stats.bySubject[question.subject_id] || 0) + 1;
        }

        // Por tipo
        if (question.question_type) {
          stats.byType[question.question_type] = 
            (stats.byType[question.question_type] || 0) + 1;
        }
      });

      return stats;
    });
  }, [questionsState.data, statsState]);

  // Buscar questão por ID
  const getQuestionById = useCallback((id: string): Question | null => {
    return questionsState.data?.find(q => q.id === id) || null;
  }, [questionsState.data]);

  // Filtrar questões localmente
  const filterQuestions = useCallback((filters: QuestionFilters): Question[] => {
    if (!questionsState.data) return [];

    return questionsState.data.filter(question => {
      if (filters.subject_id && question.subject_id !== filters.subject_id) return false;
      if (filters.topic_id && question.topic_id !== filters.topic_id) return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      if (filters.question_type && question.question_type !== filters.question_type) return false;
      if (filters.search && !question.question_text.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });
  }, [questionsState.data]);

  return {
    // Estados padronizados (AsyncState)
    questions: questionsState.data || [],
    loading: questionsState.loading,
    error: questionsState.error,
    isIdle: questionsState.isIdle,
    isLoading: questionsState.isLoading,
    isError: questionsState.isError,
    isSuccess: questionsState.isSuccess,

    // Estados de estatísticas
    stats: statsState.data,
    statsLoading: statsState.loading,
    statsError: statsState.error,

    // Operações
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    calculateStats,

    // Utilitários
    getQuestionById,
    filterQuestions,
    reset: () => {
      questionsState.reset();
      statsState.reset();
    },

    // Ações diretas do estado
    setQuestions: questionsState.setData,
    setLoading: questionsState.setLoading,
    setError: questionsState.setError,
  };
}