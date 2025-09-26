/**
 * SUP-6: Hook use-financas migrado para abstração de banco de dados
 * Expansão da validação SUP-6 - Quarto hook migrado
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDatabase, useDatabaseCRUD } from "@/hooks/shared/use-database";
import { useAsyncState } from "@/hooks/shared/use-async-state";
import { useAuth } from "@/lib/auth-provider";
import type {
  CategoriaGasto,
  Despesa,
  EnvelopeVirtual,
  PagamentoAgendado,
  GastosPorCategoria,
  EstatisticasFinanceiras
} from "@/types/financas";
import {
  validateDespesa,
  validateData,
  sanitizeString,
  sanitizeNumber,
  sanitizeDate,
} from "@/utils/validations-migration";

export function useFinancasAbstracted() {
  const { user } = useAuth();
  
  // SUP-6: Usar abstração de banco de dados
  const db = useDatabase();
  const categoriasCrud = useDatabaseCRUD<CategoriaGasto>('expense_categories');
  const despesasCrud = useDatabaseCRUD<Despesa>('expenses');
  const envelopesCrud = useDatabaseCRUD<EnvelopeVirtual>('virtual_envelopes');
  const pagamentosCrud = useDatabaseCRUD<PagamentoAgendado>('scheduled_payments');
  
  // SUP-5: Estados async padronizados
  const categoriasState = useAsyncState<CategoriaGasto[]>({
    initialData: [],
    onError: (error) => console.error("Erro em categorias:", error)
  });
  
  const despesasState = useAsyncState<Despesa[]>({
    initialData: [],
    onError: (error) => console.error("Erro em despesas:", error)
  });
  
  const envelopesState = useAsyncState<EnvelopeVirtual[]>({
    initialData: [],
    onError: (error) => console.error("Erro em envelopes:", error)
  });
  
  // Compatibilidade com API existente
  const categorias = categoriasState.data || [];
  const despesas = despesasState.data || [];
  const envelopes = envelopesState.data || [];
  const loading = categoriasState.loading || despesasState.loading || envelopesState.loading;
  
  // Estados não migrados ainda (mantidos para compatibilidade)
  const [pagamentos, setPagamentos] = useState<PagamentoAgendado[]>([]);

  // SUP-6: Fetch categorias usando abstração
  const fetchCategorias = useCallback(async () => {
    return await categoriasState.execute(async () => {
      const categorias = await categoriasCrud.findAll({
        orderBy: [{ column: 'name', ascending: true }]
      });
      return categorias;
    });
  }, [categoriasCrud, categoriasState.execute]);

  // SUP-6: Create categoria usando abstração
  const createCategoria = useCallback(async (novaCategoria: Omit<CategoriaGasto, "id" | "created_at" | "updated_at">) => {
    try {
      // Sanitizar dados
      const dadosSanitizados = {
        name: sanitizeString(novaCategoria.name),
        description: novaCategoria.description ? sanitizeString(novaCategoria.description) : null,
        color: sanitizeString(novaCategoria.color || '#6366f1'),
        budget_limit: sanitizeNumber(novaCategoria.budget_limit || 0),
        active: novaCategoria.active ?? true
      };

      // SUP-6: Usar CRUD abstrato
      const novaCategoriaSalva = await categoriasCrud.create(dadosSanitizados);
      
      if (novaCategoriaSalva) {
        // Atualizar estado local
        const categoriasAtualizadas = [...categorias, novaCategoriaSalva];
        categoriasState.setData(categoriasAtualizadas);
      }
      
      return novaCategoriaSalva;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  }, [categoriasCrud, categorias, categoriasState.setData]);

  // SUP-6: Fetch despesas usando abstração
  const fetchDespesas = useCallback(async (mes?: string) => {
    return await despesasState.execute(async () => {
      let filters = db.createFilter();
      
      if (mes) {
        // Filtrar por mês específico
        const [ano, mesNum] = mes.split('-');
        const dataInicio = `${ano}-${mesNum}-01`;
        const dataFim = `${ano}-${mesNum}-31`;
        filters = filters.gte('date', dataInicio).lte('date', dataFim);
      }

      const despesas = await despesasCrud.findAll({
        filters: filters.build(),
        orderBy: [{ column: 'date', ascending: false }]
      });
      
      return despesas;
    });
  }, [despesasCrud, despesasState.execute, db]);

  // SUP-6: Create despesa usando abstração
  const createDespesa = useCallback(async (novaDespesa: Omit<Despesa, "id" | "created_at" | "updated_at">) => {
    try {
      // SUP-4: Validar dados usando tipagem forte
      const validation = validateDespesa(novaDespesa);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
      }

      // Sanitizar dados
      const dadosSanitizados = {
        description: sanitizeString(novaDespesa.description),
        amount: sanitizeNumber(novaDespesa.amount),
        category_id: novaDespesa.category_id,
        date: sanitizeDate(novaDespesa.date),
        payment_method: sanitizeString(novaDespesa.payment_method || 'money'),
        notes: novaDespesa.notes ? sanitizeString(novaDespesa.notes) : null,
        envelope_id: novaDespesa.envelope_id || null,
        recurring: novaDespesa.recurring ?? false,
        recurring_frequency: novaDespesa.recurring_frequency || null
      };

      // SUP-6: Usar CRUD abstrato
      const novaDespesaSalva = await despesasCrud.create(dadosSanitizados);
      
      if (novaDespesaSalva) {
        // Atualizar estado local
        const despesasAtualizadas = [novaDespesaSalva, ...despesas];
        despesasState.setData(despesasAtualizadas);
        
        // Atualizar envelope se aplicável
        if (novaDespesaSalva.envelope_id) {
          await atualizarSaldoEnvelope(novaDespesaSalva.envelope_id);
        }
      }
      
      return novaDespesaSalva;
    } catch (error) {
      console.error("Erro ao criar despesa:", error);
      throw error;
    }
  }, [despesasCrud, despesas, despesasState.setData]);

  // SUP-6: Update despesa usando abstração
  const updateDespesa = useCallback(async (id: string, updates: Partial<Despesa>) => {
    try {
      // SUP-4: Validar dados parciais
      const validation = validateData(updates, validateDespesa);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
      }

      // Sanitizar apenas campos fornecidos
      const updatesSanitizados: any = {};
      if (updates.description !== undefined) updatesSanitizados.description = sanitizeString(updates.description);
      if (updates.amount !== undefined) updatesSanitizados.amount = sanitizeNumber(updates.amount);
      if (updates.category_id !== undefined) updatesSanitizados.category_id = updates.category_id;
      if (updates.date !== undefined) updatesSanitizados.date = sanitizeDate(updates.date);
      if (updates.payment_method !== undefined) updatesSanitizados.payment_method = sanitizeString(updates.payment_method);
      if (updates.notes !== undefined) updatesSanitizados.notes = updates.notes ? sanitizeString(updates.notes) : null;
      if (updates.envelope_id !== undefined) updatesSanitizados.envelope_id = updates.envelope_id;

      // SUP-6: Usar CRUD abstrato
      const despesaAtualizada = await despesasCrud.updateById(id, updatesSanitizados);
      
      if (despesaAtualizada) {
        // Atualizar estado local
        const despesasAtualizadas = despesas.map(despesa => 
          despesa.id === id ? { ...despesa, ...despesaAtualizada } : despesa
        );
        despesasState.setData(despesasAtualizadas);
      }
      
      return despesaAtualizada;
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      throw error;
    }
  }, [despesasCrud, despesas, despesasState.setData]);

  // SUP-6: Delete despesa usando abstração
  const deleteDespesa = useCallback(async (id: string) => {
    try {
      const sucesso = await despesasCrud.deleteById(id);
      
      if (sucesso) {
        // Atualizar estado local
        const despesasAtualizadas = despesas.filter(despesa => despesa.id !== id);
        despesasState.setData(despesasAtualizadas);
      }
      
      return sucesso;
    } catch (error) {
      console.error("Erro ao deletar despesa:", error);
      throw error;
    }
  }, [despesasCrud, despesas, despesasState.setData]);

  // SUP-6: Fetch envelopes usando abstração
  const fetchEnvelopes = useCallback(async () => {
    return await envelopesState.execute(async () => {
      const envelopes = await envelopesCrud.findAll({
        orderBy: [{ column: 'name', ascending: true }]
      });
      return envelopes;
    });
  }, [envelopesCrud, envelopesState.execute]);

  // SUP-6: Create envelope usando abstração
  const createEnvelope = useCallback(async (novoEnvelope: Omit<EnvelopeVirtual, "id" | "created_at" | "updated_at">) => {
    try {
      // Sanitizar dados
      const dadosSanitizados = {
        name: sanitizeString(novoEnvelope.name),
        description: novoEnvelope.description ? sanitizeString(novoEnvelope.description) : null,
        target_amount: sanitizeNumber(novoEnvelope.target_amount),
        current_amount: sanitizeNumber(novoEnvelope.current_amount || 0),
        color: sanitizeString(novoEnvelope.color || '#10b981'),
        active: novoEnvelope.active ?? true
      };

      // SUP-6: Usar CRUD abstrato
      const novoEnvelopeSalvo = await envelopesCrud.create(dadosSanitizados);
      
      if (novoEnvelopeSalvo) {
        // Atualizar estado local
        const envelopesAtualizados = [...envelopes, novoEnvelopeSalvo];
        envelopesState.setData(envelopesAtualizados);
      }
      
      return novoEnvelopeSalvo;
    } catch (error) {
      console.error("Erro ao criar envelope:", error);
      throw error;
    }
  }, [envelopesCrud, envelopes, envelopesState.setData]);

  // SUP-6: Atualizar saldo de envelope usando abstração
  const atualizarSaldoEnvelope = useCallback(async (envelopeId: string) => {
    try {
      // Buscar total de despesas do envelope
      const despesasEnvelope = await db.select('expenses', {
        filters: db.createFilter().eq('envelope_id', envelopeId).build()
      });

      const totalGasto = (despesasEnvelope.data || [])
        .reduce((total: number, despesa: any) => total + (despesa.amount || 0), 0);

      // Buscar envelope atual
      const envelope = envelopes.find(e => e.id === envelopeId);
      if (!envelope) return;

      const saldoAtual = envelope.target_amount - totalGasto;

      // Atualizar envelope
      const envelopeAtualizado = await envelopesCrud.updateById(envelopeId, {
        current_amount: Math.max(0, saldoAtual)
      });

      if (envelopeAtualizado) {
        // Atualizar estado local
        const envelopesAtualizados = envelopes.map(env => 
          env.id === envelopeId ? { ...env, ...envelopeAtualizado } : env
        );
        envelopesState.setData(envelopesAtualizados);
      }

      return envelopeAtualizado;
    } catch (error) {
      console.error("Erro ao atualizar saldo do envelope:", error);
      throw error;
    }
  }, [db, envelopes, envelopesCrud, envelopesState.setData]);

  // SUP-6: Estatísticas financeiras usando abstração
  const getEstatisticasFinanceiras = useCallback(async (mes?: string) => {
    try {
      let filters = db.createFilter();
      
      if (mes) {
        // Filtrar por mês específico
        const [ano, mesNum] = mes.split('-');
        const dataInicio = `${ano}-${mesNum}-01`;
        const dataFim = `${ano}-${mesNum}-31`;
        filters = filters.gte('date', dataInicio).lte('date', dataFim);
      }

      // Buscar despesas do período
      const despesasPeriodo = await despesasCrud.findAll({
        filters: filters.build()
      });

      // Buscar categorias com orçamento
      const categoriasComOrcamento = await categoriasCrud.findAll({
        filters: db.createFilter().gt('budget_limit', 0).build()
      });

      // Calcular estatísticas
      const totalGasto = despesasPeriodo.reduce((total, despesa) => total + despesa.amount, 0);
      const totalOrcamento = categoriasComOrcamento.reduce((total, cat) => total + cat.budget_limit, 0);

      // Gastos por categoria
      const gastosPorCategoria = despesasPeriodo.reduce((acc: Record<string, number>, despesa) => {
        acc[despesa.category_id] = (acc[despesa.category_id] || 0) + despesa.amount;
        return acc;
      }, {});

      // Categoria com maior gasto
      const [categoriaIdMaiorGasto] = Object.entries(gastosPorCategoria)
        .sort(([,a], [,b]) => b - a)[0] || [null, 0];

      const categoriaMaiorGasto = categorias.find(cat => cat.id === categoriaIdMaiorGasto);

      // Porcentagem do orçamento usado
      const porcentagemOrcamentoUsado = totalOrcamento > 0 ? (totalGasto / totalOrcamento) * 100 : 0;

      return {
        totalGasto,
        totalOrcamento,
        categoriaComMaiorGasto: categoriaMaiorGasto?.name || null,
        porcentagemOrcamentoUsado: Math.round(porcentagemOrcamentoUsado * 100) / 100,
        gastosPorCategoria: Object.entries(gastosPorCategoria).map(([catId, valor]) => ({
          categoria: categorias.find(cat => cat.id === catId)?.name || 'Desconhecida',
          valor: valor as number
        })),
        despesasCount: despesasPeriodo.length
      };
    } catch (error) {
      console.error("Erro ao calcular estatísticas financeiras:", error);
      return {
        totalGasto: 0,
        totalOrcamento: 0,
        categoriaComMaiorGasto: null,
        porcentagemOrcamentoUsado: 0,
        gastosPorCategoria: [],
        despesasCount: 0
      };
    }
  }, [db, despesasCrud, categoriasCrud, categorias]);

  // SUP-6: Gastos por período usando abstração
  const getGastosPorPeriodo = useCallback(async (dataInicio: string, dataFim: string) => {
    try {
      const despesasPeriodo = await despesasCrud.findAll({
        filters: db.createFilter()
          .gte('date', dataInicio)
          .lte('date', dataFim)
          .build(),
        orderBy: [{ column: 'date', ascending: true }]
      });

      // Agrupar por dia
      const gastosPorDia = despesasPeriodo.reduce((acc: Record<string, number>, despesa) => {
        const dia = despesa.date.split('T')[0];
        acc[dia] = (acc[dia] || 0) + despesa.amount;
        return acc;
      }, {});

      return {
        periodo: { inicio: dataInicio, fim: dataFim },
        totalGasto: despesasPeriodo.reduce((total, despesa) => total + despesa.amount, 0),
        gastosPorDia: Object.entries(gastosPorDia).map(([dia, valor]) => ({
          dia,
          valor: valor as number
        })),
        despesasCount: despesasPeriodo.length
      };
    } catch (error) {
      console.error("Erro ao buscar gastos por período:", error);
      return {
        periodo: { inicio: dataInicio, fim: dataFim },
        totalGasto: 0,
        gastosPorDia: [],
        despesasCount: 0
      };
    }
  }, [despesasCrud, db]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (db.isAuthenticated) {
      fetchCategorias();
      fetchDespesas();
      fetchEnvelopes();
    }
  }, [db.isAuthenticated, fetchCategorias, fetchDespesas, fetchEnvelopes]);

  return {
    // Estado
    categorias,
    despesas,
    envelopes,
    pagamentos,
    loading,
    
    // Ações CRUD para categorias
    createCategoria,
    fetchCategorias,
    
    // Ações CRUD para despesas
    createDespesa,
    updateDespesa,
    deleteDespesa,
    fetchDespesas,
    
    // Ações para envelopes
    createEnvelope,
    fetchEnvelopes,
    atualizarSaldoEnvelope,
    
    // Consultas especializadas
    getEstatisticasFinanceiras,
    getGastosPorPeriodo,
    
    // Utilitários
    refreshCategorias: fetchCategorias,
    refreshDespesas: fetchDespesas,
    refreshEnvelopes: fetchEnvelopes,
    isAuthenticated: db.isAuthenticated,
    
    // SUP-6: Acesso direto à abstração (se necessário)
    database: db,
    categoriasCrud,
    despesasCrud,
    envelopesCrud,
    pagamentosCrud
  };
}