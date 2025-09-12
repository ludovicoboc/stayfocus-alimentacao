"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-provider";
import { createClient } from "@/lib/supabase";
import { createDebouncedFunction } from "@/lib/request-debouncer";
import type { Concurso } from "@/types";
import { handleSupabaseCompetitionError } from "@/lib/error-handler";

// Cache otimizado para concursos
const competitionsCache = new Map<string, { data: Concurso[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Hook especializado para gerenciamento de cache de concursos
 * Responsabilidade única: Cache e otimização de dados
 */
export function useConcursosCache() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const cacheKey = `competitions_${userId}`;

    // Verificar cache primeiro
    if (competitionsCache.has(cacheKey)) {
      const cached = competitionsCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

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

    // Atualizar cache
    competitionsCache.set(cacheKey, {
      data: competitions,
      timestamp: Date.now()
    });

    return competitions;
  }, [supabase]);

  // Buscar concursos com cache
  const fetchConcursos = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const competitions = await debouncedFetchConcursos(user.id);
      setConcursos(competitions);
    } catch (error) {
      console.error("Erro ao buscar concursos:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      setConcursos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, debouncedFetchConcursos]);

  // Invalidar cache
  const invalidateCache = useCallback((userId?: string) => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      const cacheKey = `competitions_${targetUserId}`;
      competitionsCache.delete(cacheKey);
    }
  }, [user?.id]);

  // Limpar todo o cache
  const clearCache = useCallback(() => {
    competitionsCache.clear();
  }, []);

  // Atualizar cache com novos dados
  const updateCache = useCallback((newData: Concurso[], userId?: string) => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      const cacheKey = `competitions_${targetUserId}`;
      competitionsCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now()
      });
      setConcursos(newData);
    }
  }, [user?.id]);

  // Adicionar item ao cache
  const addToCache = useCallback((newConcurso: Concurso) => {
    setConcursos(prev => [newConcurso, ...prev]);
    
    if (user?.id) {
      const cacheKey = `competitions_${user.id}`;
      const cached = competitionsCache.get(cacheKey);
      if (cached) {
        const updatedData = [newConcurso, ...cached.data];
        competitionsCache.set(cacheKey, {
          data: updatedData,
          timestamp: Date.now()
        });
      }
    }
  }, [user?.id]);

  // Atualizar item no cache
  const updateInCache = useCallback((competitionId: string, updates: Partial<Concurso>) => {
    setConcursos(prev => 
      prev.map(comp => 
        comp.id === competitionId ? { ...comp, ...updates } : comp
      )
    );
    
    if (user?.id) {
      const cacheKey = `competitions_${user.id}`;
      const cached = competitionsCache.get(cacheKey);
      if (cached) {
        const updatedData = cached.data.map(comp => 
          comp.id === competitionId ? { ...comp, ...updates } : comp
        );
        competitionsCache.set(cacheKey, {
          data: updatedData,
          timestamp: Date.now()
        });
      }
    }
  }, [user?.id]);

  // Remover item do cache
  const removeFromCache = useCallback((competitionId: string) => {
    setConcursos(prev => prev.filter(comp => comp.id !== competitionId));
    
    if (user?.id) {
      const cacheKey = `competitions_${user.id}`;
      const cached = competitionsCache.get(cacheKey);
      if (cached) {
        const updatedData = cached.data.filter(comp => comp.id !== competitionId);
        competitionsCache.set(cacheKey, {
          data: updatedData,
          timestamp: Date.now()
        });
      }
    }
  }, [user?.id]);

  // Buscar concurso por ID (cache first)
  const getConcursoById = useCallback((id: string): Concurso | null => {
    return concursos.find(c => c.id === id) || null;
  }, [concursos]);

  // Verificar se cache está válido
  const isCacheValid = useCallback((userId?: string): boolean => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return false;
    
    const cacheKey = `competitions_${targetUserId}`;
    const cached = competitionsCache.get(cacheKey);
    
    return cached ? (Date.now() - cached.timestamp < CACHE_DURATION) : false;
  }, [user?.id]);

  // Estatísticas do cache
  const getCacheStats = useCallback(() => {
    return {
      size: competitionsCache.size,
      keys: Array.from(competitionsCache.keys()),
      isValid: isCacheValid(),
      lastUpdate: user?.id ? competitionsCache.get(`competitions_${user.id}`)?.timestamp : null
    };
  }, [user?.id, isCacheValid]);

  return {
    // Estado
    concursos,
    loading,
    error,
    
    // Operações principais
    fetchConcursos,
    getConcursoById,
    
    // Gerenciamento de cache
    invalidateCache,
    clearCache,
    updateCache,
    addToCache,
    updateInCache,
    removeFromCache,
    
    // Utilitários
    isCacheValid,
    getCacheStats,
  };
}