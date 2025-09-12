"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { createDebouncedFunction } from "@/lib/request-debouncer";
import { useAsyncCache } from "@/hooks/shared/use-async-state";
import type { Concurso } from "@/types";
import { handleSupabaseCompetitionError } from "@/lib/error-handler";

/**
 * SUP-5: Hook de cache refatorado com estados async padronizados
 * Substitui use-concursos-cache.ts com padrão consistente
 */
export function useConcursosCache() {
  const { user } = useAuth();
  const supabase = createClient();

  // Hook padronizado para cache com TTL de 5 minutos
  const asyncCache = useAsyncCache<Concurso[]>(`concursos_${user?.id}`, {
    ttl: 5 * 60 * 1000, // 5 minutos
    invalidateOnFocus: true,
    initialData: [],
    onError: (error) => {
      console.error("Erro ao buscar concursos:", error);
    }
  });

  // Função debounced para fetch de concursos
  const debouncedFetchConcursos = createDebouncedFunction(
    "concursos_fetch",
    async (userId: string) => {
      return await performFetchConcursos(userId);
    },
    'API_CALL'
  );

  /**
   * Executa busca otimizada de concursos com cache
   */
  const performFetchConcursos = useCallback(async (userId: string): Promise<Concurso[]> => {
    const { data, error } = await supabase
      .from("competitions")
      .select(`
        *,
        competition_subjects!inner (
          *,
          competition_topics (*)
        ),
        competition_questions (
          id,
          question_text,
          difficulty,
          subject_id,
          topic_id,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(handleSupabaseCompetitionError(error));
    }

    // Transformar dados para estrutura esperada
    const competitions = (data || []).map((comp: any) => ({
      ...comp,
      disciplinas: comp.competition_subjects?.map((subject: any) => ({
        ...subject,
        topicos: subject.competition_topics || []
      })) || [],
      questoes: comp.competition_questions || []
    }));

    return competitions;
  }, [supabase]);

  // Buscar concursos com cache
  const fetchConcursos = useCallback(async () => {
    if (!user?.id) return;
    
    return await asyncCache.fetchWithCache(async () => {
      return await debouncedFetchConcursos(user.id);
    });
  }, [user?.id, asyncCache, debouncedFetchConcursos]);

  // Buscar concurso por ID (cache first)
  const getConcursoById = useCallback((id: string): Concurso | null => {
    const concursos = asyncCache.data || [];
    return concursos.find(c => c.id === id) || null;
  }, [asyncCache.data]);

  // Adicionar item ao cache
  const addToCache = useCallback((newConcurso: Concurso) => {
    const currentData = asyncCache.data || [];
    const updatedData = [newConcurso, ...currentData];
    asyncCache.setData(updatedData);
  }, [asyncCache]);

  // Atualizar item no cache
  const updateInCache = useCallback((competitionId: string, updates: Partial<Concurso>) => {
    const currentData = asyncCache.data || [];
    const updatedData = currentData.map(comp => 
      comp.id === competitionId ? { ...comp, ...updates } : comp
    );
    asyncCache.setData(updatedData);
  }, [asyncCache]);

  // Remover item do cache
  const removeFromCache = useCallback((competitionId: string) => {
    const currentData = asyncCache.data || [];
    const filteredData = currentData.filter(comp => comp.id !== competitionId);
    asyncCache.setData(filteredData);
  }, [asyncCache]);

  // Atualizar cache com novos dados
  const updateCache = useCallback((newData: Concurso[]) => {
    asyncCache.setData(newData);
  }, [asyncCache]);

  // Estatísticas do cache
  const getCacheStats = useCallback(() => {
    return {
      size: asyncCache.data?.length || 0,
      isValid: asyncCache.isCacheValid(),
      lastUpdate: Date.now(), // Simplificado
      hasData: (asyncCache.data?.length || 0) > 0
    };
  }, [asyncCache]);

  return {
    // Estados padronizados (AsyncState)
    concursos: asyncCache.data || [],
    loading: asyncCache.loading,
    error: asyncCache.error,
    isIdle: asyncCache.isIdle,
    isLoading: asyncCache.isLoading,
    isError: asyncCache.isError,
    isSuccess: asyncCache.isSuccess,
    
    // Operações principais
    fetchConcursos,
    getConcursoById,
    
    // Gerenciamento de cache
    invalidateCache: asyncCache.invalidateCache,
    clearCache: asyncCache.clearAllCache,
    updateCache,
    addToCache,
    updateInCache,
    removeFromCache,
    
    // Utilitários
    isCacheValid: asyncCache.isCacheValid,
    getCacheStats,
    reset: asyncCache.reset,
  };
}