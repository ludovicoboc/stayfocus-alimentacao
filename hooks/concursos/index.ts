// Hooks especializados para concursos - SUP-3 Refatoração
// Cada hook tem responsabilidade única e bem definida

// Hook principal refatorado (substitui use-concursos.ts)
export { useConcursos } from "./use-concursos-refactored";

// Hooks especializados (podem ser usados independentemente)
export { useConcursosCRUD } from "./use-concursos-crud";
export { useConcursosCache } from "./use-concursos-cache";
export { useConcursosValidation } from "./use-concursos-validation";

// Re-exports para compatibilidade
export type { Concurso, Disciplina, Topico, Questao } from "@/types";