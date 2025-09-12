"use client";

import { useConcursosContext } from "@/lib/concursos-context";
import type { SimuladoRuntime, SimuladoResultado, SimuladoStatus, SimuladoData } from "@/types";

/**
 * Hook para operações de simulados sem dependência circular
 * Substitui o hook original use-simulados.ts
 */
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
    resetSimulado,
    
    // Métodos adicionais para compatibilidade
    limparSimulado: resetSimulado,
    carregarHistorico: fetchHistorico
  };
}