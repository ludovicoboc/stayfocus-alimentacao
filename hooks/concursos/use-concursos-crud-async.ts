"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-utils";
import { useAsyncCRUD } from "@/hooks/shared/use-async-state";
import type { Concurso, Disciplina, Topico, Questao } from "@/types";
import { handleSupabaseCompetitionError } from "@/lib/error-handler";

/**
 * SUP-5: Hook CRUD refatorado com estados async padronizados
 * Substitui use-concursos-crud.ts com padrão consistente
 */
export function useConcursosCRUD() {
  const { user } = useAuth();
  const supabase = createClient();

  // Hook padronizado para operações CRUD
  const asyncCRUD = useAsyncCRUD<Concurso>({
    onError: (error) => {
      console.error("Erro em operação CRUD:", error);
    },
    retryCount: 2,
    retryDelay: 1000
  });

  // Função auxiliar para tratamento de erros
  const handleSupabaseError = useCallback((error: any) => {
    return handleSupabaseCompetitionError(error);
  }, []);

  // Validar acesso ao concurso
  const validateCompetitionAccess = useCallback(async (competitionId: string) => {
    if (!user?.id) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("competitions")
      .select("id")
      .eq("id", competitionId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      throw new Error("Concurso não encontrado ou acesso negado");
    }

    return data;
  }, [user?.id, supabase]);

  // ==================== OPERAÇÕES DE CONCURSOS ====================

  // Criar concurso
  const createCompetition = useCallback(
    async (competitionData: Partial<Concurso>): Promise<Concurso[]> => {
      const result = await asyncCRUD.execute(async () => {
        const authResult = await withAuth(async (authUser) => {
          const { data, error } = await supabase
            .from("competitions")
            .insert([
              {
                ...competitionData,
                user_id: authUser.id,
              },
            ])
            .select();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data || [];
        });
        
        return authResult;
      });
      
      return Array.isArray(result) ? result : [];
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // Atualizar concurso
  const updateCompetition = useCallback(
    async (competitionId: string, updates: Partial<Concurso>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          // Validar propriedade primeiro
          await validateCompetitionAccess(competitionId);

          const { data, error } = await supabase
            .from("competitions")
            .update(updates)
            .eq("id", competitionId)
            .eq("user_id", authUser.id)
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, validateCompetitionAccess, asyncCRUD],
  );

  // Deletar concurso
  const deleteCompetition = useCallback(
    async (competitionId: string) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          // Validar propriedade primeiro
          await validateCompetitionAccess(competitionId);

          const { error } = await supabase
            .from("competitions")
            .delete()
            .eq("id", competitionId)
            .eq("user_id", authUser.id);

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return true;
        });
      });
    },
    [supabase, handleSupabaseError, validateCompetitionAccess, asyncCRUD],
  );

  // ==================== OPERAÇÕES DE DISCIPLINAS ====================

  // Adicionar disciplina
  const addSubject = useCallback(
    async (competitionId: string, subjectData: Partial<Disciplina>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          // Validar propriedade do concurso
          await validateCompetitionAccess(competitionId);

          const { data, error } = await supabase
            .from("competition_subjects")
            .insert([
              {
                competition_id: competitionId,
                ...subjectData,
              },
            ])
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, validateCompetitionAccess, asyncCRUD],
  );

  // Atualizar disciplina
  const updateSubject = useCallback(
    async (subjectId: string, updates: Partial<Disciplina>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { data, error } = await supabase
            .from("competition_subjects")
            .update(updates)
            .eq("id", subjectId)
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // Deletar disciplina
  const deleteSubject = useCallback(
    async (subjectId: string) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { error } = await supabase
            .from("competition_subjects")
            .delete()
            .eq("id", subjectId);

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return true;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // ==================== OPERAÇÕES DE TÓPICOS ====================

  // Adicionar tópico
  const addTopic = useCallback(
    async (subjectId: string, topicData: Partial<Topico>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { data, error } = await supabase
            .from("competition_topics")
            .insert([
              {
                subject_id: subjectId,
                ...topicData,
              },
            ])
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // Atualizar tópico
  const updateTopic = useCallback(
    async (topicId: string, updates: Partial<Topico>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { data, error } = await supabase
            .from("competition_topics")
            .update(updates)
            .eq("id", topicId)
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // Deletar tópico
  const deleteTopic = useCallback(
    async (topicId: string) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { error } = await supabase
            .from("competition_topics")
            .delete()
            .eq("id", topicId);

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return true;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // ==================== OPERAÇÕES DE QUESTÕES ====================

  // Buscar questões de um concurso
  const fetchQuestions = useCallback(
    async (competitionId: string) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          // Validar propriedade do concurso
          await validateCompetitionAccess(competitionId);

          const { data, error } = await supabase
            .from("competition_questions")
            .select("*")
            .eq("competition_id", competitionId)
            .order("created_at", { ascending: false });

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data || [];
        });
      });
    },
    [supabase, handleSupabaseError, validateCompetitionAccess, asyncCRUD],
  );

  // Adicionar questão
  const addQuestion = useCallback(
    async (competitionId: string, questionData: Partial<Questao>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          // Validar propriedade do concurso
          await validateCompetitionAccess(competitionId);

          const { data, error } = await supabase
            .from("competition_questions")
            .insert([
              {
                competition_id: competitionId,
                ...questionData,
              },
            ])
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, validateCompetitionAccess, asyncCRUD],
  );

  // Atualizar questão
  const updateQuestion = useCallback(
    async (questionId: string, updates: Partial<Questao>) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { data, error } = await supabase
            .from("competition_questions")
            .update(updates)
            .eq("id", questionId)
            .select()
            .single();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return data;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  // Deletar questão
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      return await asyncCRUD.execute(async () => {
        return await withAuth(async (authUser) => {
          const { error } = await supabase
            .from("competition_questions")
            .delete()
            .eq("id", questionId);

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          return true;
        });
      });
    },
    [supabase, handleSupabaseError, asyncCRUD],
  );

  return {
    // Estados padronizados (AsyncState)
    data: asyncCRUD.data,
    loading: asyncCRUD.loading,
    error: asyncCRUD.error,
    isIdle: asyncCRUD.isIdle,
    isLoading: asyncCRUD.isLoading,
    isError: asyncCRUD.isError,
    isSuccess: asyncCRUD.isSuccess,
    
    // Operações de concursos
    createCompetition,
    updateCompetition,
    deleteCompetition,
    
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
    validateCompetitionAccess,
    reset: asyncCRUD.reset,
  };
}