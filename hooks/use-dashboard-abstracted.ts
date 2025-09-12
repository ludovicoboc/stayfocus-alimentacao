/**
 * SUP-6: Hook use-dashboard migrado para abstração de banco de dados
 * Expansão da validação SUP-6
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useDatabase, useDatabaseCRUD } from "@/hooks/shared/use-database"
import { useAsyncState } from "@/hooks/shared/use-async-state"
import { useAuth } from "@/lib/auth-provider"
import type { 
  AtividadePainelDia, 
  Prioridade, 
  Medicamento, 
  SessaoFocoDashboard,
  DashboardData,
  DashboardError 
} from "@/types/dashboard"
import { sanitizeString } from "@/utils/validations-migration"
import { getCurrentDateString } from "@/lib/utils"

export function useDashboardAbstracted(date?: string) {
  const { user } = useAuth()
  
  // SUP-6: Usar abstração de banco de dados
  const db = useDatabase()
  const atividadesCrud = useDatabaseCRUD<AtividadePainelDia>('daily_activities')
  const prioridadesCrud = useDatabaseCRUD<Prioridade>('priorities')
  const medicamentosCrud = useDatabaseCRUD<Medicamento>('medications')
  const sessoesFocoCrud = useDatabaseCRUD<SessaoFocoDashboard>('focus_sessions')
  
  // SUP-5: Estados async padronizados
  const dashboardState = useAsyncState<DashboardData>({
    initialData: {
      painelDia: [],
      prioridades: [],
      medicamentos: [],
      sessaoFoco: null,
      summary: undefined,
    },
    onError: (error) => {
      console.error("Erro no dashboard:", error);
    }
  })
  
  // Compatibilidade com API existente
  const dashboardData = dashboardState.data || {
    painelDia: [],
    prioridades: [],
    medicamentos: [],
    sessaoFoco: null,
    summary: undefined,
  }
  const loading = dashboardState.loading
  const error = dashboardState.error ? { message: dashboardState.error, type: 'loading' as const } : null

  // Data resolvida
  const resolvedDate = useMemo(() => {
    return date || getCurrentDateString()
  }, [date])

  // SUP-6: Fetch dashboard usando abstração
  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    return await dashboardState.execute(async () => {
      // Buscar todas as informações do dashboard em paralelo usando abstração
      const [atividadesResult, prioridadesResult, medicamentosResult, sessaoFocoResult] = await Promise.all([
        // Atividades do dia
        atividadesCrud.findAll({
          filters: db.createFilter()
            .eq('date', resolvedDate)
            .build(),
          orderBy: [{ column: 'created_at', ascending: false }],
          limit: 10
        }),
        
        // Prioridades ativas
        prioridadesCrud.findAll({
          filters: db.createFilter()
            .eq('status', 'active')
            .build(),
          orderBy: [{ column: 'priority_level', ascending: false }],
          limit: 5
        }),
        
        // Medicamentos do dia
        medicamentosCrud.findAll({
          filters: db.createFilter()
            .eq('active', true)
            .build(),
          orderBy: [{ column: 'time_to_take', ascending: true }]
        }),
        
        // Sessão de foco atual
        db.select<SessaoFocoDashboard>('focus_sessions', {
          filters: db.createFilter()
            .eq('date', resolvedDate)
            .eq('status', 'active')
            .build(),
          single: true
        })
      ])

      // Calcular resumo
      const summary = {
        atividadesCompletas: atividadesResult.filter(a => a.completed).length,
        totalAtividades: atividadesResult.length,
        prioridadesPendentes: prioridadesResult.filter(p => !p.completed).length,
        medicamentosTomados: medicamentosResult.filter(m => m.taken_today).length,
        totalMedicamentos: medicamentosResult.length,
        tempoFocoHoje: sessaoFocoResult.data?.duration_minutes || 0
      }

      return {
        painelDia: atividadesResult,
        prioridades: prioridadesResult,
        medicamentos: medicamentosResult,
        sessaoFoco: sessaoFocoResult.data,
        summary
      }
    })
  }, [user, resolvedDate, atividadesCrud, prioridadesCrud, medicamentosCrud, db, dashboardState.execute])

  // SUP-6: Criar atividade usando abstração
  const criarAtividadePainelDia = useCallback(async (atividade: Omit<AtividadePainelDia, "id" | "created_at" | "updated_at">) => {
    try {
      // Sanitizar dados
      const dadosSanitizados = {
        title: sanitizeString(atividade.title),
        description: atividade.description ? sanitizeString(atividade.description) : null,
        type: atividade.type,
        date: atividade.date || resolvedDate,
        completed: atividade.completed || false,
        priority: atividade.priority || 'medium'
      }

      // SUP-6: Usar CRUD abstrato
      const novaAtividade = await atividadesCrud.create(dadosSanitizados)
      
      if (novaAtividade) {
        // Atualizar estado local
        const novosDados = {
          ...dashboardData,
          painelDia: [novaAtividade, ...dashboardData.painelDia]
        }
        dashboardState.setData(novosDados)
      }
      
      return novaAtividade
    } catch (error) {
      console.error("Erro ao criar atividade:", error)
      throw error
    }
  }, [atividadesCrud, resolvedDate, dashboardData, dashboardState.setData])

  // SUP-6: Marcar atividade como completa usando abstração
  const marcarAtividadeCompleta = useCallback(async (id: string) => {
    try {
      const atividadeAtualizada = await atividadesCrud.updateById(id, {
        completed: true,
        completed_at: new Date().toISOString()
      })
      
      if (atividadeAtualizada) {
        // Atualizar estado local
        const novosDados = {
          ...dashboardData,
          painelDia: dashboardData.painelDia.map(atividade => 
            atividade.id === id ? { ...atividade, ...atividadeAtualizada } : atividade
          )
        }
        dashboardState.setData(novosDados)
      }
      
      return atividadeAtualizada
    } catch (error) {
      console.error("Erro ao marcar atividade como completa:", error)
      throw error
    }
  }, [atividadesCrud, dashboardData, dashboardState.setData])

  // SUP-6: Criar prioridade usando abstração
  const criarPrioridade = useCallback(async (prioridade: Omit<Prioridade, "id" | "created_at" | "updated_at">) => {
    try {
      // Sanitizar dados
      const dadosSanitizados = {
        title: sanitizeString(prioridade.title),
        description: prioridade.description ? sanitizeString(prioridade.description) : null,
        priority_level: prioridade.priority_level || 'medium',
        due_date: prioridade.due_date || null,
        status: prioridade.status || 'active',
        completed: prioridade.completed || false
      }

      // SUP-6: Usar CRUD abstrato
      const novaPrioridade = await prioridadesCrud.create(dadosSanitizados)
      
      if (novaPrioridade) {
        // Atualizar estado local
        const novosDados = {
          ...dashboardData,
          prioridades: [novaPrioridade, ...dashboardData.prioridades]
        }
        dashboardState.setData(novosDados)
      }
      
      return novaPrioridade
    } catch (error) {
      console.error("Erro ao criar prioridade:", error)
      throw error
    }
  }, [prioridadesCrud, dashboardData, dashboardState.setData])

  // SUP-6: Marcar medicamento como tomado usando abstração
  const marcarMedicamentoTomado = useCallback(async (id: string) => {
    try {
      const medicamentoAtualizado = await medicamentosCrud.updateById(id, {
        taken_today: true,
        last_taken_at: new Date().toISOString()
      })
      
      if (medicamentoAtualizado) {
        // Atualizar estado local
        const novosDados = {
          ...dashboardData,
          medicamentos: dashboardData.medicamentos.map(medicamento => 
            medicamento.id === id ? { ...medicamento, ...medicamentoAtualizado } : medicamento
          )
        }
        dashboardState.setData(novosDados)
      }
      
      return medicamentoAtualizado
    } catch (error) {
      console.error("Erro ao marcar medicamento como tomado:", error)
      throw error
    }
  }, [medicamentosCrud, dashboardData, dashboardState.setData])

  // SUP-6: Iniciar sessão de foco usando abstração
  const iniciarSessaoFoco = useCallback(async (duracao: number, tipo: string = 'pomodoro') => {
    try {
      // Encerrar sessão ativa se existir
      if (dashboardData.sessaoFoco) {
        await sessoesFocoCrud.updateById(dashboardData.sessaoFoco.id, {
          status: 'completed',
          ended_at: new Date().toISOString()
        })
      }

      // Criar nova sessão
      const novaSessao = await sessoesFocoCrud.create({
        date: resolvedDate,
        duration_minutes: duracao,
        type: tipo,
        status: 'active',
        started_at: new Date().toISOString()
      })
      
      if (novaSessao) {
        // Atualizar estado local
        const novosDados = {
          ...dashboardData,
          sessaoFoco: novaSessao
        }
        dashboardState.setData(novosDados)
      }
      
      return novaSessao
    } catch (error) {
      console.error("Erro ao iniciar sessão de foco:", error)
      throw error
    }
  }, [sessoesFocoCrud, dashboardData, resolvedDate, dashboardState.setData])

  // SUP-6: Finalizar sessão de foco usando abstração
  const finalizarSessaoFoco = useCallback(async () => {
    try {
      if (!dashboardData.sessaoFoco) return null

      const sessaoAtualizada = await sessoesFocoCrud.updateById(dashboardData.sessaoFoco.id, {
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      
      if (sessaoAtualizada) {
        // Atualizar estado local
        const novosDados = {
          ...dashboardData,
          sessaoFoco: null
        }
        dashboardState.setData(novosDados)
      }
      
      return sessaoAtualizada
    } catch (error) {
      console.error("Erro ao finalizar sessão de foco:", error)
      throw error
    }
  }, [sessoesFocoCrud, dashboardData, dashboardState.setData])

  // SUP-6: Buscar estatísticas usando abstração
  const getEstatisticasPeriodo = useCallback(async (dataInicio: string, dataFim: string) => {
    try {
      // Buscar dados do período usando filtros abstratos
      const [atividadesResult, sessoesFocoResult, medicamentosResult] = await Promise.all([
        atividadesCrud.findAll({
          filters: db.createFilter()
            .gte('date', dataInicio)
            .lte('date', dataFim)
            .build()
        }),
        
        sessoesFocoCrud.findAll({
          filters: db.createFilter()
            .gte('date', dataInicio)
            .lte('date', dataFim)
            .eq('status', 'completed')
            .build()
        }),
        
        db.select('medication_logs', {
          filters: db.createFilter()
            .gte('date', dataInicio)
            .lte('date', dataFim)
            .build()
        })
      ])

      // Calcular estatísticas
      const totalAtividades = atividadesResult.length
      const atividadesCompletas = atividadesResult.filter(a => a.completed).length
      const totalTempoFoco = sessoesFocoResult.reduce((total, sessao) => total + (sessao.duration_minutes || 0), 0)
      const medicamentosTomados = medicamentosResult.data?.length || 0

      return {
        periodo: { inicio: dataInicio, fim: dataFim },
        atividades: {
          total: totalAtividades,
          completas: atividadesCompletas,
          percentualCompletas: totalAtividades > 0 ? (atividadesCompletas / totalAtividades) * 100 : 0
        },
        foco: {
          totalMinutos: totalTempoFoco,
          totalHoras: Math.round(totalTempoFoco / 60 * 100) / 100,
          sessoes: sessoesFocoResult.length
        },
        saude: {
          medicamentosTomados
        }
      }
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error)
      return {
        periodo: { inicio: dataInicio, fim: dataFim },
        atividades: { total: 0, completas: 0, percentualCompletas: 0 },
        foco: { totalMinutos: 0, totalHoras: 0, sessoes: 0 },
        saude: { medicamentosTomados: 0 }
      }
    }
  }, [atividadesCrud, sessoesFocoCrud, db])

  // Carregar dados na inicialização
  useEffect(() => {
    if (db.isAuthenticated) {
      fetchDashboardData()
    }
  }, [db.isAuthenticated, resolvedDate, fetchDashboardData])

  return {
    // Estado
    dashboardData,
    loading,
    error,
    
    // Ações para atividades
    criarAtividadePainelDia,
    marcarAtividadeCompleta,
    
    // Ações para prioridades
    criarPrioridade,
    
    // Ações para medicamentos
    marcarMedicamentoTomado,
    
    // Ações para sessões de foco
    iniciarSessaoFoco,
    finalizarSessaoFoco,
    
    // Consultas
    fetchDashboardData,
    getEstatisticasPeriodo,
    
    // Utilitários
    refreshDashboard: fetchDashboardData,
    isAuthenticated: db.isAuthenticated,
    resolvedDate,
    
    // SUP-6: Acesso direto à abstração (se necessário)
    database: db,
    atividadesCrud,
    prioridadesCrud,
    medicamentosCrud,
    sessoesFocoCrud
  }
}