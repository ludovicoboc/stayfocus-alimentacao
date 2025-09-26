/**
 * Tipos base consolidados para o módulo de concursos
 * Elimina duplicações entre concursos.ts e simulados.ts
 * SUP-2: Consolidar Tipos Duplicados
 */

// ============================================================================
// TIPOS BASE COMPARTILHADOS
// ============================================================================

export type ConcursoStatus = "planejado" | "inscrito" | "estudando" | "realizado" | "aguardando_resultado"

export type DifficultyLevel = "facil" | "medio" | "dificil"

export type QuestionType = "multiple_choice" | "true_false" | "essay" | "short_answer"

export type SimulationStatus = "draft" | "active" | "completed" | "archived"

export type SimuladoStatus = "idle" | "loading" | "reviewing" | "results" | "em_andamento" | "finalizado"

// ============================================================================
// INTERFACES BASE
// ============================================================================

export interface BaseEntity {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface UserEntity extends BaseEntity {
  user_id?: string
}

// ============================================================================
// CONCURSOS E ESTRUTURA HIERÁRQUICA
// ============================================================================

export interface Topico extends BaseEntity {
  subject_id?: string
  name: string
  completed?: boolean
}

export interface Disciplina extends BaseEntity {
  competition_id?: string
  name: string
  progress?: number
  topicos?: Topico[]
}

export interface Concurso extends UserEntity {
  title: string
  organizer: string
  registration_date?: string | null
  exam_date?: string | null
  edital_link?: string | null
  status: ConcursoStatus
  disciplinas?: Disciplina[]
}

// ============================================================================
// QUESTÕES
// ============================================================================

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

export interface BaseQuestao extends UserEntity {
  competition_id?: string
  subject_id?: string
  topic_id?: string | null
  question_text: string
  correct_answer?: string
  explanation?: string
  difficulty?: DifficultyLevel
  question_type?: QuestionType
  points?: number
  time_limit_seconds?: number
  tags?: string[]
  source?: string
  year?: number
  is_active?: boolean
  usage_count?: number
  is_ai_generated?: boolean
}

// Questão para banco de dados (formato normalizado)
export interface Questao extends BaseQuestao {
  options?: QuestionOption[]
}

// Questão para simulados (formato de importação/exportação)
export interface SimuladoQuestao {
  id: number | string
  enunciado: string
  alternativas: SimuladoAlternativas | QuestionOption[]
  gabarito: string
  assunto?: string
  disciplina?: string
  topico?: string
  dificuldade?: number | DifficultyLevel
  explicacao?: string
  fonte?: string
  ano?: number
}

export interface SimuladoAlternativas {
  a: string
  b: string
  c: string
  d: string
  e?: string
  f?: string
  g?: string
}

// ============================================================================
// RESULTADOS E RESPOSTAS
// ============================================================================

export interface BaseSimulationResult {
  score: number
  total_questions: number
  percentage: number
  answers: Record<string, string>
  time_taken_minutes?: number
  completed_at?: string
}

// Resultado para banco de dados (tabela simulation_history)
export interface SimuladoResultado extends UserEntity, BaseSimulationResult {
  simulation_id?: string
}

// Resultado para interface (compatibilidade com código existente)
export interface SimulationResults extends BaseSimulationResult {
  total: number // Alias para total_questions para compatibilidade
}

export interface SimuladoResposta {
  questaoId: number | string
  resposta: string
  correta: boolean
  tempoResposta?: number
}

// ============================================================================
// SIMULADOS
// ============================================================================

export interface SimuladoMetadata {
  titulo: string
  concurso?: string
  ano?: number
  area?: string
  nivel?: string
  totalQuestoes: number
  autor?: string
}

export interface SimuladoData {
  metadata: SimuladoMetadata
  questoes: SimuladoQuestao[]
}

// Simulado para banco de dados (tabela simulations)
export interface SimuladoDatabase extends UserEntity {
  competition_id?: string
  title: string
  description?: string
  questions: string[] // Array of question IDs
  question_count?: number
  time_limit_minutes?: number
  difficulty_filter?: DifficultyLevel
  subject_filters?: string[]
  topic_filters?: string[]
  status?: SimulationStatus
  is_public?: boolean
  results?: SimulationResults
  is_favorite: boolean
  attempts_count?: number
  best_score?: number
  avg_score?: number
}

// Simulado para execução (runtime)
export interface SimuladoRuntime extends UserEntity {
  competition_id?: string | null
  title: string
  metadata: SimuladoMetadata
  questions: SimuladoQuestao[]
  user_answers: Record<string, string>
  score: number
  total_questions: number
  completed: boolean
  started_at?: string
  completed_at?: string | null
}

// ============================================================================
// FORMULÁRIOS E IMPORTAÇÃO
// ============================================================================

export interface ConcursoFormData {
  title: string
  organizer: string
  registration_date: string
  exam_date: string
  edital_link?: string
  status: ConcursoStatus
  disciplinas: {
    name: string
    topicos: string[]
  }[]
}

export interface ConcursoJsonImport {
  titulo: string
  organizadora: string
  dataInscricao?: string
  dataProva?: string
  linkEdital?: string
  conteudoProgramatico: {
    disciplina: string
    topicos: string[]
  }[]
}

// ============================================================================
// TIPOS DE COMPATIBILIDADE (ALIASES)
// ============================================================================

// Para manter compatibilidade com código existente
export type Simulado = SimuladoDatabase | SimuladoRuntime