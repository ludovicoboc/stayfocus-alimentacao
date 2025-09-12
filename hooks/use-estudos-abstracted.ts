/**
 * SUP-6: Exemplo de hook migrado para usar abstração de banco de dados
 * Hook use-estudos refatorado sem dependência direta do Supabase
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDatabase, useDatabaseCRUD } from "@/hooks/shared/use-database";
import { useAsyncState } from "@/hooks/shared/use-async-state";
import type { SessaoEstudo } from "@/types/estudos";
import { validateSessaoEstudo, validateData, sanitizeString, sanitizeNumber } from "@/utils/validations-migration";

export function useEstudosAbstracted() {
  // SUP-6: Usar abstração de banco de dados ao invés do Supabase direto
  const db = useDatabase();
  const crud = useDatabaseCRUD<SessaoEstudo>('study_sessions');
  
  // SUP-5: Estados async padronizados
  const sessoesState = useAsyncState<SessaoEstudo[]>({
    initialData: [],
    onError: (error) => {
      console.error("Erro em useEstudos:", error);
    }
  });
  
  // Compatibilidade com API existente
  const sessoes = sessoesState.data || [];
  const loading = sessoesState.loading;

  // SUP-6: Fetch usando abstração
  const fetchSessoes = async () => {
    return await sessoesState.execute(async () => {
      // Usar CRUD abstrato ao invés de query Supabase direta
      const sessoes = await crud.findAll({
        orderBy: [{ column: 'created_at', ascending: false }]
      });
      
      return sessoes;
    });
  };

  // SUP-6: Create usando abstração  
  const createSessao = async (novaSessao: Omit<SessaoEstudo, "id" | "created_at" | "updated_at">) => {
    try {
      // Validar dados antes de enviar
      const validation = validateSessaoEstudo(novaSessao);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
      }

      // Sanitizar dados
      const dadosSanitizados = {
        materia: sanitizeString(novaSessao.materia),
        assunto: sanitizeString(novaSessao.assunto),
        duracao_minutos: sanitizeNumber(novaSessao.duracao_minutos),
        dificuldade: novaSessao.dificuldade,
        notas: novaSessao.notas ? sanitizeString(novaSessao.notas) : null,
        concurso_id: novaSessao.concurso_id
      };

      // Usar CRUD abstrato
      const novaSessaoSalva = await crud.create(dadosSanitizados);
      
      if (novaSessaoSalva) {
        // Atualizar estado local
        const sessoesAtualizadas = [novaSessaoSalva, ...sessoes];
        sessoesState.setData(sessoesAtualizadas);
      }
      
      return novaSessaoSalva;
    } catch (error) {
      console.error("Erro ao criar sessão de estudo:", error);
      throw error;
    }
  };

  // SUP-6: Update usando abstração
  const updateSessao = async (id: string, updates: Partial<SessaoEstudo>) => {
    try {
      // Validar dados parciais
      const validation = validateData(updates, validateSessaoEstudo);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
      }

      // Sanitizar apenas campos fornecidos
      const updatesSanitizados: any = {};
      if (updates.materia !== undefined) updatesSanitizados.materia = sanitizeString(updates.materia);
      if (updates.assunto !== undefined) updatesSanitizados.assunto = sanitizeString(updates.assunto);
      if (updates.duracao_minutos !== undefined) updatesSanitizados.duracao_minutos = sanitizeNumber(updates.duracao_minutos);
      if (updates.dificuldade !== undefined) updatesSanitizados.dificuldade = updates.dificuldade;
      if (updates.notas !== undefined) updatesSanitizados.notas = updates.notas ? sanitizeString(updates.notas) : null;

      // Usar CRUD abstrato
      const sessaoAtualizada = await crud.updateById(id, updatesSanitizados);
      
      if (sessaoAtualizada) {
        // Atualizar estado local
        const sessoesAtualizadas = sessoes.map(sessao => 
          sessao.id === id ? { ...sessao, ...sessaoAtualizada } : sessao
        );
        sessoesState.setData(sessoesAtualizadas);
      }
      
      return sessaoAtualizada;
    } catch (error) {
      console.error("Erro ao atualizar sessão de estudo:", error);
      throw error;
    }
  };

  // SUP-6: Delete usando abstração
  const deleteSessao = async (id: string) => {
    try {
      const sucesso = await crud.deleteById(id);
      
      if (sucesso) {
        // Atualizar estado local
        const sessoesAtualizadas = sessoes.filter(sessao => sessao.id !== id);
        sessoesState.setData(sessoesAtualizadas);
      }
      
      return sucesso;
    } catch (error) {
      console.error("Erro ao deletar sessão de estudo:", error);
      throw error;
    }
  };

  // SUP-6: Buscar sessões por concurso usando abstração
  const fetchSessoesPorConcurso = async (concursoId: string): Promise<SessaoEstudo[]> => {
    try {
      // Usar database abstrato com filtros
      const sessoes = await crud.findAll({
        filters: db.createFilter().eq('concurso_id', concursoId).build(),
        orderBy: [{ column: 'created_at', ascending: false }]
      });
      
      return sessoes;
    } catch (error) {
      console.error("Erro ao buscar sessões por concurso:", error);
      return [];
    }
  };

  // SUP-6: Estatísticas usando abstração
  const getEstatisticas = async () => {
    try {
      // Usar query builder abstrato para queries mais complexas
      const query = db.createQuery()
        .table('study_sessions')
        .select(['duracao_minutos', 'dificuldade', 'materia'])
        .where(db.createFilter().eq('user_id', db.user?.id).build())
        .build();

      const result = await db.select<SessaoEstudo[]>('study_sessions', {
        columns: ['duracao_minutos', 'dificuldade', 'materia'],
        filters: db.createFilter().eq('user_id', db.user?.id).build()
      });

      const sessoes = result.data || [];

      // Calcular estatísticas
      const totalSessoes = sessoes.length;
      const tempoTotalMinutos = sessoes.reduce((total, sessao) => total + (sessao.duracao_minutos || 0), 0);
      const materiasFavoritas = sessoes.reduce((acc: Record<string, number>, sessao) => {
        acc[sessao.materia] = (acc[sessao.materia] || 0) + 1;
        return acc;
      }, {});

      return {
        totalSessoes,
        tempoTotalMinutos,
        tempoTotalHoras: Math.round(tempoTotalMinutos / 60 * 100) / 100,
        materiaFavorita: Object.entries(materiasFavoritas)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || null,
        materiasEstudadas: Object.keys(materiasFavoritas).length
      };
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
      return {
        totalSessoes: 0,
        tempoTotalMinutos: 0,
        tempoTotalHoras: 0,
        materiaFavorita: null,
        materiasEstudadas: 0
      };
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    if (db.isAuthenticated) {
      fetchSessoes();
    }
  }, [db.isAuthenticated]);

  return {
    // Estado
    sessoes,
    loading,
    
    // Ações CRUD
    createSessao,
    updateSessao,
    deleteSessao,
    fetchSessoes,
    
    // Consultas especializadas
    fetchSessoesPorConcurso,
    getEstatisticas,
    
    // Utilitários
    refreshSessoes: fetchSessoes,
    isAuthenticated: db.isAuthenticated,
    
    // SUP-6: Acesso direto à abstração de banco (se necessário)
    database: db,
    crud
  };
}

/**
 * Comparação SUP-6: ANTES vs DEPOIS
 * 
 * ANTES (acoplado ao Supabase):
 * ```typescript
 * const supabase = createClient();
 * const { data, error } = await supabase
 *   .from("study_sessions")
 *   .select("*")
 *   .eq("user_id", user?.id)
 *   .order("created_at", { ascending: false });
 * ```
 * 
 * DEPOIS (abstração de banco):
 * ```typescript
 * const db = useDatabase();
 * const sessoes = await crud.findAll({
 *   orderBy: [{ column: 'created_at', ascending: false }]
 * });
 * ```
 * 
 * BENEFÍCIOS:
 * ✅ Vendor lock-in eliminado
 * ✅ Testes mais simples (mock da interface)
 * ✅ Possibilidade de trocar banco de dados
 * ✅ Validação e sanitização centralizadas
 * ✅ Error handling padronizado
 * ✅ Type safety melhorado
 */