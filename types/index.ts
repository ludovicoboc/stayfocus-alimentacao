/**
 * Tipos consolidados para o módulo de concursos
 * SUP-2: Consolidar Tipos Duplicados
 * 
 * Este arquivo centraliza todos os tipos relacionados a concursos,
 * eliminando duplicações e fornecendo uma API consistente.
 */

// Re-export todos os tipos base
export * from './base'

// ============================================================================
// TIPOS ESPECÍFICOS POR CONTEXTO
// ============================================================================

import type {
  BaseEntity,
  UserEntity,
  ConcursoStatus,
  DifficultyLevel,
  QuestionType,
  SimulationStatus,
  SimuladoStatus,
  Topico,
  Disciplina,
  Concurso,
  QuestionOption,
  Questao,
  SimuladoQuestao,
  SimuladoAlternativas,
  SimuladoResultado,
  SimulationResults,
  SimuladoResposta,
  SimuladoMetadata,
  SimuladoData,
  SimuladoDatabase,
  SimuladoRuntime,
  ConcursoFormData,
  ConcursoJsonImport
} from './base'

// ============================================================================
// CONTEXTOS ESPECÍFICOS
// ============================================================================

// Para uso em hooks de concursos (CRUD operations)
export interface ConcursoContext {
  concursos: Concurso[]
  loading: boolean
  error: string | null
  fetchConcursos: () => Promise<void>
  createCompetition: (data: Partial<Concurso>) => Promise<Concurso>
  updateCompetition: (id: string, updates: Partial<Concurso>) => Promise<void>
  deleteCompetition: (id: string) => Promise<void>
  getConcursoById: (id: string) => Concurso | null
}

// Para uso em hooks de simulados
export interface SimuladoContext {
  simuladoAtual: SimuladoRuntime | null
  status: SimuladoStatus
  historico: SimuladoResultado[]
  loading: boolean
  error: string | null
  gerarSimulado: (concursoId: string, numeroQuestoes: number) => Promise<boolean>
  carregarSimulado: (data: SimuladoData, concursoId?: string) => Promise<boolean>
  salvarResultado: (resultado: Partial<SimuladoResultado>) => Promise<void>
  fetchHistorico: () => Promise<void>
  resetSimulado: () => void
}

// ============================================================================
// TIPOS DE VALIDAÇÃO
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface ConcursoValidationInput {
  title: unknown
  organizer: unknown
  status: unknown
  registration_date?: unknown
  exam_date?: unknown
  edital_link?: unknown
}

export interface QuestaoValidationInput {
  question_text: unknown
  options?: unknown
  correct_answer?: unknown
  difficulty?: unknown
  question_type?: unknown
}

// ============================================================================
// TIPOS DE ESTATÍSTICAS
// ============================================================================

export interface PerformanceMetrics {
  averageScore: number
  totalSimulations: number
  improvementRate: number
  strongSubjects: string[]
  weakSubjects: string[]
  timeEfficiency: number
}

export interface SubjectAnalysis {
  subject: string
  averageScore: number
  totalQuestions: number
  correctAnswers: number
  improvementTrend: number
}

export interface TimeAnalysis {
  averageTimePerQuestion: number
  fastestCompletion: number
  slowestCompletion: number
  timeEfficiencyTrend: number
}

export interface StreakAnalysis {
  currentStreak: number
  longestStreak: number
  streakType: 'improvement' | 'decline' | 'stable'
}

export interface PredictiveInsights {
  predictedNextScore: number
  recommendedStudyAreas: string[]
  estimatedImprovementTime: number
  confidenceLevel: number
}

export interface PerformanceTrend {
  period: string
  averageScore: number
  totalSimulations: number
  improvement: number
}

// ============================================================================
// TIPOS DE OPERAÇÕES
// ============================================================================

export interface CreateSimulationHistoryInput {
  simulation_id?: string
  score: number
  total_questions: number
  percentage: number
  answers: Record<string, string>
  time_taken_minutes?: number
}

export interface UpdateSimulationHistoryInput {
  id: string
  score?: number
  percentage?: number
  answers?: Record<string, string>
  time_taken_minutes?: number
  completed_at?: string
}

export interface SimulationHistoryQueryOptions {
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
  minScore?: number
  maxScore?: number
  simulationId?: string
}

// ============================================================================
// MAPEAMENTO DE COMPATIBILIDADE
// ============================================================================

// Para manter compatibilidade com código existente que usa tipos específicos
export type {
  // Tipos principais (mantidos para compatibilidade)
  Concurso,
  Disciplina,
  Topico,
  Questao,
  QuestionOption,
  
  // Simulados (tipos unificados)
  SimuladoDatabase as SimuladoBD,
  SimuladoRuntime as SimuladoExecucao,
  SimuladoData,
  SimuladoQuestao,
  SimuladoMetadata,
  SimuladoResultado,
  SimulationResults,
  
  // Status e enums
  ConcursoStatus,
  SimuladoStatus,
  DifficultyLevel,
  QuestionType,
  SimulationStatus,
  
  // Formulários
  ConcursoFormData,
  ConcursoJsonImport
}

// ============================================================================
// GUARDS DE TIPO
// ============================================================================

export function isSimuladoDatabase(simulado: any): simulado is SimuladoDatabase {
  return simulado && typeof simulado.questions === 'object' && Array.isArray(simulado.questions)
}

export function isSimuladoRuntime(simulado: any): simulado is SimuladoRuntime {
  return simulado && typeof simulado.questions === 'object' && !Array.isArray(simulado.questions)
}

export function isValidConcurso(obj: any): obj is Concurso {
  return obj && typeof obj.title === 'string' && typeof obj.organizer === 'string'
}

export function isValidQuestao(obj: any): obj is Questao {
  return obj && typeof obj.question_text === 'string'
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

export function simuladoRuntimeToDatabase(runtime: SimuladoRuntime): Partial<SimuladoDatabase> {
  return {
    id: runtime.id,
    user_id: runtime.user_id,
    competition_id: runtime.competition_id || undefined,
    title: runtime.title,
    description: `Simulado: ${runtime.metadata.titulo}`,
    questions: runtime.questions.map(q => q.id.toString()),
    question_count: runtime.total_questions,
    status: runtime.completed ? 'completed' : 'active',
    is_favorite: false,
    results: {
      score: runtime.score,
      total: runtime.total_questions,
      total_questions: runtime.total_questions,
      percentage: (runtime.score / runtime.total_questions) * 100,
      answers: runtime.user_answers,
      completed_at: runtime.completed_at || undefined
    },
    created_at: runtime.created_at,
    updated_at: runtime.updated_at
  }
}

export function simuladoDatabaseToRuntime(database: SimuladoDatabase, questoes: SimuladoQuestao[]): SimuladoRuntime {
  return {
    id: database.id,
    user_id: database.user_id,
    competition_id: database.competition_id || null,
    title: database.title,
    metadata: {
      titulo: database.title,
      totalQuestoes: database.question_count || questoes.length,
      autor: 'Sistema'
    },
    questions: questoes,
    user_answers: database.results?.answers || {},
    score: database.results?.score || 0,
    total_questions: database.question_count || questoes.length,
    completed: database.status === 'completed',
    started_at: database.created_at,
    completed_at: database.results?.completed_at || null,
    created_at: database.created_at,
    updated_at: database.updated_at
  }
}