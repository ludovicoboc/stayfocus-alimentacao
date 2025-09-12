/**
 * SUP-6: Hook use-saude migrado para abstração de banco de dados
 * Expansão da validação SUP-6
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { useDatabase, useDatabaseCRUD } from "@/hooks/shared/use-database"
import { useAsyncState } from "@/hooks/shared/use-async-state"
import { useAuth } from "./use-auth"
import type { 
  Medicamento, 
  RegistroHumor, 
  MedicamentoTomado,
  EstatisticasSaude 
} from "@/types/saude"
import { 
  validateMedicamento, 
  validateRegistroHumor, 
  validateData, 
  sanitizeString, 
  sanitizeArray, 
  sanitizeDate 
} from "@/utils/validations-migration"

export function useSaudeAbstracted() {
  const { user } = useAuth()
  
  // SUP-6: Usar abstração de banco de dados
  const db = useDatabase()
  const medicamentosCrud = useDatabaseCRUD<Medicamento>('medications')
  const registrosHumorCrud = useDatabaseCRUD<RegistroHumor>('mood_records')
  const medicamentosTomadosCrud = useDatabaseCRUD<MedicamentoTomado>('medication_logs')
  
  // SUP-5: Estados async padronizados
  const medicamentosState = useAsyncState<Medicamento[]>({
    initialData: [],
    onError: (error) => console.error("Erro em medicamentos:", error)
  })
  
  const registrosHumorState = useAsyncState<RegistroHumor[]>({
    initialData: [],
    onError: (error) => console.error("Erro em registros humor:", error)
  })
  
  // Compatibilidade com API existente
  const medicamentos = medicamentosState.data || []
  const registrosHumor = registrosHumorState.data || []
  const loadingMedicamentos = medicamentosState.loading
  const loadingRegistrosHumor = registrosHumorState.loading
  
  // Estados não migrados ainda (mantidos para compatibilidade)
  const [medicamentosTomados, setMedicamentosTomados] = useState<MedicamentoTomado[]>([])

  // SUP-6: Fetch medicamentos usando abstração
  const fetchMedicamentos = useCallback(async () => {
    return await medicamentosState.execute(async () => {
      const medicamentos = await medicamentosCrud.findAll({
        orderBy: [{ column: 'created_at', ascending: false }]
      })
      return medicamentos
    })
  }, [medicamentosCrud, medicamentosState.execute])

  // SUP-6: Create medicamento usando abstração
  const createMedicamento = useCallback(async (novoMedicamento: Omit<Medicamento, "id" | "created_at" | "updated_at">) => {
    try {
      // SUP-4: Validar dados usando tipagem forte
      const validation = validateMedicamento(novoMedicamento)
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`)
      }

      // Sanitizar dados
      const dadosSanitizados = {
        name: sanitizeString(novoMedicamento.name),
        dosage: sanitizeString(novoMedicamento.dosage),
        frequency: sanitizeString(novoMedicamento.frequency),
        instructions: novoMedicamento.instructions ? sanitizeString(novoMedicamento.instructions) : null,
        active: novoMedicamento.active ?? true,
        times_per_day: novoMedicamento.times_per_day || 1,
        start_date: sanitizeDate(novoMedicamento.start_date),
        end_date: novoMedicamento.end_date ? sanitizeDate(novoMedicamento.end_date) : null
      }

      // SUP-6: Usar CRUD abstrato
      const novoMedicamentoSalvo = await medicamentosCrud.create(dadosSanitizados)
      
      if (novoMedicamentoSalvo) {
        // Atualizar estado local
        const medicamentosAtualizados = [novoMedicamentoSalvo, ...medicamentos]
        medicamentosState.setData(medicamentosAtualizados)
      }
      
      return novoMedicamentoSalvo
    } catch (error) {
      console.error("Erro ao criar medicamento:", error)
      throw error
    }
  }, [medicamentosCrud, medicamentos, medicamentosState.setData])

  // SUP-6: Update medicamento usando abstração
  const updateMedicamento = useCallback(async (id: string, updates: Partial<Medicamento>) => {
    try {
      // SUP-4: Validar dados parciais
      const validation = validateData(updates, validateMedicamento)
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`)
      }

      // Sanitizar apenas campos fornecidos
      const updatesSanitizados: any = {}
      if (updates.name !== undefined) updatesSanitizados.name = sanitizeString(updates.name)
      if (updates.dosage !== undefined) updatesSanitizados.dosage = sanitizeString(updates.dosage)
      if (updates.frequency !== undefined) updatesSanitizados.frequency = sanitizeString(updates.frequency)
      if (updates.instructions !== undefined) updatesSanitizados.instructions = updates.instructions ? sanitizeString(updates.instructions) : null
      if (updates.active !== undefined) updatesSanitizados.active = updates.active
      if (updates.times_per_day !== undefined) updatesSanitizados.times_per_day = updates.times_per_day
      if (updates.start_date !== undefined) updatesSanitizados.start_date = sanitizeDate(updates.start_date)
      if (updates.end_date !== undefined) updatesSanitizados.end_date = updates.end_date ? sanitizeDate(updates.end_date) : null

      // SUP-6: Usar CRUD abstrato
      const medicamentoAtualizado = await medicamentosCrud.updateById(id, updatesSanitizados)
      
      if (medicamentoAtualizado) {
        // Atualizar estado local
        const medicamentosAtualizados = medicamentos.map(medicamento => 
          medicamento.id === id ? { ...medicamento, ...medicamentoAtualizado } : medicamento
        )
        medicamentosState.setData(medicamentosAtualizados)
      }
      
      return medicamentoAtualizado
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error)
      throw error
    }
  }, [medicamentosCrud, medicamentos, medicamentosState.setData])

  // SUP-6: Delete medicamento usando abstração
  const deleteMedicamento = useCallback(async (id: string) => {
    try {
      const sucesso = await medicamentosCrud.deleteById(id)
      
      if (sucesso) {
        // Atualizar estado local
        const medicamentosAtualizados = medicamentos.filter(medicamento => medicamento.id !== id)
        medicamentosState.setData(medicamentosAtualizados)
      }
      
      return sucesso
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error)
      throw error
    }
  }, [medicamentosCrud, medicamentos, medicamentosState.setData])

  // SUP-6: Fetch registros de humor usando abstração
  const fetchRegistrosHumor = useCallback(async () => {
    return await registrosHumorState.execute(async () => {
      const registros = await registrosHumorCrud.findAll({
        orderBy: [{ column: 'date', ascending: false }],
        limit: 30 // Últimos 30 registros
      })
      return registros
    })
  }, [registrosHumorCrud, registrosHumorState.execute])

  // SUP-6: Create registro de humor usando abstração
  const createRegistroHumor = useCallback(async (novoRegistro: Omit<RegistroHumor, "id" | "created_at" | "updated_at">) => {
    try {
      // SUP-4: Validar dados usando tipagem forte
      const validation = validateRegistroHumor(novoRegistro)
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`)
      }

      // Sanitizar dados
      const dadosSanitizados = {
        date: sanitizeDate(novoRegistro.date),
        mood_level: novoRegistro.mood_level,
        energy_level: novoRegistro.energy_level,
        stress_level: novoRegistro.stress_level,
        sleep_quality: novoRegistro.sleep_quality,
        notes: novoRegistro.notes ? sanitizeString(novoRegistro.notes) : null,
        symptoms: sanitizeArray(novoRegistro.symptoms || []),
        triggers: sanitizeArray(novoRegistro.triggers || [])
      }

      // SUP-6: Usar CRUD abstrato
      const novoRegistroSalvo = await registrosHumorCrud.create(dadosSanitizados)
      
      if (novoRegistroSalvo) {
        // Atualizar estado local
        const registrosAtualizados = [novoRegistroSalvo, ...registrosHumor]
        registrosHumorState.setData(registrosAtualizados)
      }
      
      return novoRegistroSalvo
    } catch (error) {
      console.error("Erro ao criar registro de humor:", error)
      throw error
    }
  }, [registrosHumorCrud, registrosHumor, registrosHumorState.setData])

  // SUP-6: Marcar medicamento como tomado usando abstração
  const marcarMedicamentoTomado = useCallback(async (medicamentoId: string, dataHora?: string) => {
    try {
      const logMedicamento = await medicamentosTomadosCrud.create({
        medication_id: medicamentoId,
        taken_at: dataHora || new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      })
      
      if (logMedicamento) {
        // Atualizar estado local
        setMedicamentosTomados(prev => [logMedicamento, ...prev])
      }
      
      return logMedicamento
    } catch (error) {
      console.error("Erro ao marcar medicamento como tomado:", error)
      throw error
    }
  }, [medicamentosTomadosCrud])

  // SUP-6: Buscar medicamentos para hoje usando abstração
  const getMedicamentosParaHoje = useCallback(async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0]
      
      // Buscar medicamentos ativos
      const medicamentosAtivos = await medicamentosCrud.findAll({
        filters: db.createFilter()
          .eq('active', true)
          .build()
      })

      // Buscar logs de hoje
      const logsHoje = await db.select('medication_logs', {
        filters: db.createFilter()
          .eq('date', hoje)
          .build()
      })

      const medicamentosTomadosIds = new Set((logsHoje.data || []).map((log: any) => log.medication_id))

      // Marcar quais foram tomados
      const medicamentosComStatus = medicamentosAtivos.map(med => ({
        ...med,
        tomado_hoje: medicamentosTomadosIds.has(med.id),
        logs_hoje: (logsHoje.data || []).filter((log: any) => log.medication_id === med.id)
      }))

      return medicamentosComStatus
    } catch (error) {
      console.error("Erro ao buscar medicamentos para hoje:", error)
      return []
    }
  }, [medicamentosCrud, db])

  // SUP-6: Estatísticas de saúde usando abstração
  const getEstatisticasSaude = useCallback(async (dias: number = 30) => {
    try {
      const dataInicio = new Date()
      dataInicio.setDate(dataInicio.getDate() - dias)
      const dataInicioStr = dataInicio.toISOString().split('T')[0]
      const dataFimStr = new Date().toISOString().split('T')[0]

      // Buscar dados do período usando filtros abstratos
      const [registrosResult, medicamentosLogsResult] = await Promise.all([
        registrosHumorCrud.findAll({
          filters: db.createFilter()
            .gte('date', dataInicioStr)
            .lte('date', dataFimStr)
            .build()
        }),
        
        db.select('medication_logs', {
          filters: db.createFilter()
            .gte('date', dataInicioStr)
            .lte('date', dataFimStr)
            .build()
        })
      ])

      // Calcular estatísticas
      const registros = registrosResult
      const logs = medicamentosLogsResult.data || []

      const humorMedio = registros.length > 0 
        ? registros.reduce((acc, reg) => acc + reg.mood_level, 0) / registros.length 
        : 0

      const energiaMedio = registros.length > 0
        ? registros.reduce((acc, reg) => acc + reg.energy_level, 0) / registros.length
        : 0

      const stressMedio = registros.length > 0
        ? registros.reduce((acc, reg) => acc + reg.stress_level, 0) / registros.length
        : 0

      const qualidadeSonoMedio = registros.length > 0
        ? registros.reduce((acc, reg) => acc + reg.sleep_quality, 0) / registros.length
        : 0

      const diasComRegistro = registros.length
      const medicamentosTomados = logs.length
      const aderenciaMedicacao = medicamentosAtivos.length > 0 
        ? (medicamentosTomados / (medicamentosAtivos.length * dias)) * 100 
        : 0

      return {
        periodo: { inicio: dataInicioStr, fim: dataFimStr, dias },
        humor: {
          medio: Math.round(humorMedio * 100) / 100,
          registros: diasComRegistro
        },
        energia: {
          medio: Math.round(energiaMedio * 100) / 100
        },
        stress: {
          medio: Math.round(stressMedio * 100) / 100
        },
        sono: {
          qualidadeMedia: Math.round(qualidadeSonoMedio * 100) / 100
        },
        medicacao: {
          tomados: medicamentosTomados,
          aderencia: Math.round(aderenciaMedicacao * 100) / 100
        }
      }
    } catch (error) {
      console.error("Erro ao calcular estatísticas de saúde:", error)
      return {
        periodo: { inicio: '', fim: '', dias: 0 },
        humor: { medio: 0, registros: 0 },
        energia: { medio: 0 },
        stress: { medio: 0 },
        sono: { qualidadeMedia: 0 },
        medicacao: { tomados: 0, aderencia: 0 }
      }
    }
  }, [registrosHumorCrud, db, medicamentosAtivos])

  // Medicamentos ativos (memoizado)
  const medicamentosAtivos = useMemo(() => {
    return medicamentos.filter(med => med.active)
  }, [medicamentos])

  // Carregar dados na inicialização
  useEffect(() => {
    if (db.isAuthenticated) {
      fetchMedicamentos()
      fetchRegistrosHumor()
    }
  }, [db.isAuthenticated, fetchMedicamentos, fetchRegistrosHumor])

  return {
    // Estado
    medicamentos,
    registrosHumor,
    medicamentosTomados,
    medicamentosAtivos,
    loadingMedicamentos,
    loadingRegistrosHumor,
    
    // Ações CRUD para medicamentos
    createMedicamento,
    updateMedicamento,
    deleteMedicamento,
    fetchMedicamentos,
    
    // Ações para registros de humor
    createRegistroHumor,
    fetchRegistrosHumor,
    
    // Ações para medicamentos tomados
    marcarMedicamentoTomado,
    
    // Consultas especializadas
    getMedicamentosParaHoje,
    getEstatisticasSaude,
    
    // Utilitários
    refreshMedicamentos: fetchMedicamentos,
    refreshRegistrosHumor: fetchRegistrosHumor,
    isAuthenticated: db.isAuthenticated,
    
    // SUP-6: Acesso direto à abstração (se necessário)
    database: db,
    medicamentosCrud,
    registrosHumorCrud,
    medicamentosTomadosCrud
  }
}