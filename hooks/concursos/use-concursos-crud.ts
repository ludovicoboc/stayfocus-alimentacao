"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { withAuth } from "@/lib/auth-utils";
import type { Concurso, Disciplina, Topico, Questao } from "@/types";
import { handleSupabaseCompetitionError } from "@/lib/error-handler";

/**
 * Hook especializado para operações CRUD de concursos
 * Responsabilidade única: Operações de banco de dados
 */
export function useConcursosCRUD() {
  const { user } = useAuth();
  const supabase = createClient();

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
    async (competitionData: Partial<Concurso>) => {
      return await withAuth(async (authUser) => {
        const { data, error } = await supabase
          .from("competitions")
          .insert([
            {
              ...competitionData,
              user_id: authUser.id,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new Error(handleSupabaseError(error));
        }

        return data;
      });
    },
    [supabase, handleSupabaseError],
  );

  // Atualizar concurso
  const updateCompetition = useCallback(
    async (competitionId: string, updates: Partial<Concurso>) => {
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
    },
    [supabase, handleSupabaseError, validateCompetitionAccess],
  );

  // Deletar concurso
  const deleteCompetition = useCallback(
    async (competitionId: string) => {
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
    },
    [supabase, handleSupabaseError, validateCompetitionAccess],
  );

  // ==================== OPERAÇÕES DE DISCIPLINAS ====================

  // Adicionar disciplina
  const addSubject = useCallback(
    async (competitionId: string, subjectData: Partial<Disciplina>) => {
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
    },
    [supabase, handleSupabaseError, validateCompetitionAccess],
  );

  // Atualizar disciplina
  const updateSubject = useCallback(
    async (subjectId: string, updates: Partial<Disciplina>) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // Deletar disciplina
  const deleteSubject = useCallback(
    async (subjectId: string) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // ==================== OPERAÇÕES DE TÓPICOS ====================

  // Adicionar tópico
  const addTopic = useCallback(
    async (subjectId: string, topicData: Partial<Topico>) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // Atualizar tópico
  const updateTopic = useCallback(
    async (topicId: string, updates: Partial<Topico>) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // Deletar tópico
  const deleteTopic = useCallback(
    async (topicId: string) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // ==================== OPERAÇÕES DE QUESTÕES ====================

  // Adicionar questão
  const addQuestion = useCallback(
    async (competitionId: string, questionData: Partial<Questao>) => {
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
    },
    [supabase, handleSupabaseError, validateCompetitionAccess],
  );

  // Atualizar questão
  const updateQuestion = useCallback(
    async (questionId: string, updates: Partial<Questao>) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // Deletar questão
  const deleteQuestion = useCallback(
    async (questionId: string) => {
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
    },
    [supabase, handleSupabaseError],
  );

  // Buscar questões de um concurso
  const fetchQuestions = useCallback(
    async (competitionId: string) => {
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
    },
    [supabase, handleSupabaseError, validateCompetitionAccess],
  );

  return {
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
  };
}