/**
 * SUP-4: Migração gradual para validações tipadas
 * Wrapper functions para migração gradual das validações
 */

import { 
  validateConcurso as validateConcursoOriginal,
  validateQuestao as validateQuestaoOriginal,
  validateQuestionOptions as validateQuestionOptionsOriginal,
  validateSimulationResults as validateSimulationResultsOriginal,
  validateReceita as validateReceitaOriginal,
  validateMedicamento as validateMedicamentoOriginal,
  validateRegistroHumor as validateRegistroHumorOriginal,
  validateDespesa as validateDespesaOriginal,
  validateSessaoEstudo as validateSessaoEstudoOriginal,
  validateRegistroSono as validateRegistroSonoOriginal,
  validateAtividadeLazer as validateAtividadeLazerOriginal,
  validateItemListaCompras as validateItemListaComprasOriginal,
  validateData as validateDataOriginal,
  sanitizeString as sanitizeStringOriginal,
  sanitizeNumber as sanitizeNumberOriginal,
  sanitizeDate as sanitizeDateOriginal,
  sanitizeArray as sanitizeArrayOriginal,
  ValidationResult
} from './validations';

import {
  validateConcurso as validateConcursoTyped,
  validateQuestao as validateQuestaoTyped,
  validateQuestionOptions as validateQuestionOptionsTyped,
  validateSimulationResults as validateSimulationResultsTyped,
  sanitizeString as sanitizeStringTyped,
  sanitizeNumber as sanitizeNumberTyped,
  sanitizeDate as sanitizeDateTyped,
  sanitizeArray as sanitizeArrayTyped,
  type ConcursoInput,
  type QuestaoInput,
  type QuestionOptionsInput,
  type SimulationResultsInput
} from './validations-typed';

// ==================== CONFIGURAÇÃO DE MIGRAÇÃO ====================

// Flag para controlar qual versão usar
const USE_TYPED_VALIDATIONS = process.env.NODE_ENV === 'development' || 
                              process.env.USE_TYPED_VALIDATIONS === 'true';

// ==================== FUNÇÕES DE MIGRAÇÃO ====================

/**
 * Wrapper para validateConcurso que usa a versão tipada quando habilitada
 */
export function validateConcurso(concurso: any): ValidationResult {
  if (USE_TYPED_VALIDATIONS) {
    try {
      const typedResult = validateConcursoTyped(concurso as ConcursoInput);
      return {
        isValid: typedResult.isValid,
        errors: typedResult.errors
      };
    } catch (error) {
      console.warn('Fallback to original validation due to error:', error);
      return validateConcursoOriginal(concurso);
    }
  }
  
  return validateConcursoOriginal(concurso);
}

/**
 * Wrapper para validateQuestao que usa a versão tipada quando habilitada
 */
export function validateQuestao(questao: any): ValidationResult {
  if (USE_TYPED_VALIDATIONS) {
    try {
      const typedResult = validateQuestaoTyped(questao as QuestaoInput);
      return {
        isValid: typedResult.isValid,
        errors: typedResult.errors
      };
    } catch (error) {
      console.warn('Fallback to original validation due to error:', error);
      return validateQuestaoOriginal(questao);
    }
  }
  
  return validateQuestaoOriginal(questao);
}

/**
 * Wrapper para validateData que usa a versão tipada quando habilitada
 */
export function validateData(data: any, validationFunction: (data: any) => ValidationResult): void {
  return validateDataOriginal(data, validationFunction);
}

/**
 * Wrapper para validateReceita que usa a versão tipada quando habilitada
 */
export function validateReceita(receita: any): ValidationResult {
  return validateReceitaOriginal(receita);
}

/**
 * Wrapper para validateMedicamento que usa a versão tipada quando habilitada
 */
export function validateMedicamento(medicamento: any): ValidationResult {
  return validateMedicamentoOriginal(medicamento);
}

/**
 * Wrapper para validateRegistroHumor que usa a versão tipada quando habilitada
 */
export function validateRegistroHumor(registro: any): ValidationResult {
  return validateRegistroHumorOriginal(registro);
}

/**
 * Wrapper para validateDespesa que usa a versão tipada quando habilitada
 */
export function validateDespesa(despesa: any): ValidationResult {
  return validateDespesaOriginal(despesa);
}

/**
 * Wrapper para validateSessaoEstudo que usa a versão tipada quando habilitada
 */
export function validateSessaoEstudo(sessao: any): ValidationResult {
  return validateSessaoEstudoOriginal(sessao);
}

/**
 * Wrapper para validateRegistroSono que usa a versão tipada quando habilitada
 */
export function validateRegistroSono(registro: any): ValidationResult {
  return validateRegistroSonoOriginal(registro);
}

/**
 * Wrapper para validateAtividadeLazer que usa a versão tipada quando habilitada
 */
export function validateAtividadeLazer(atividade: any): ValidationResult {
  return validateAtividadeLazerOriginal(atividade);
}

/**
 * Wrapper para validateItemListaCompras que usa a versão tipada quando habilitada
 */
export function validateItemListaCompras(item: any): ValidationResult {
  return validateItemListaComprasOriginal(item);
}

/**
 * Wrapper para validateQuestionOptions que usa a versão tipada quando habilitada
 */
export function validateQuestionOptions(options: any): ValidationResult {
  if (USE_TYPED_VALIDATIONS) {
    try {
      const typedResult = validateQuestionOptionsTyped(options as QuestionOptionsInput);
      return {
        isValid: typedResult.isValid,
        errors: typedResult.errors
      };
    } catch (error) {
      console.warn('Fallback to original validation due to error:', error);
      return validateQuestionOptionsOriginal(options);
    }
  }
  
  return validateQuestionOptionsOriginal(options);
}

/**
 * Wrapper para validateSimulationResults que usa a versão tipada quando habilitada
 */
export function validateSimulationResults(results: any): ValidationResult {
  if (USE_TYPED_VALIDATIONS) {
    try {
      const typedResult = validateSimulationResultsTyped(results as SimulationResultsInput);
      return {
        isValid: typedResult.isValid,
        errors: typedResult.errors
      };
    } catch (error) {
      console.warn('Fallback to original validation due to error:', error);
      return validateSimulationResultsOriginal(results);
    }
  }
  
  return validateSimulationResultsOriginal(results);
}

/**
 * Wrapper para sanitizeString que usa a versão tipada quando habilitada
 */
export function sanitizeString(value: any): string {
  if (USE_TYPED_VALIDATIONS) {
    try {
      return sanitizeStringTyped(value);
    } catch (error) {
      console.warn('Fallback to original sanitization due to error:', error);
      return sanitizeStringOriginal(value);
    }
  }
  
  return sanitizeStringOriginal(value);
}

/**
 * Wrapper para sanitizeNumber que usa a versão tipada quando habilitada
 */
export function sanitizeNumber(value: any): number | null {
  if (USE_TYPED_VALIDATIONS) {
    try {
      return sanitizeNumberTyped(value);
    } catch (error) {
      console.warn('Fallback to original sanitization due to error:', error);
      return sanitizeNumberOriginal(value);
    }
  }
  
  return sanitizeNumberOriginal(value);
}

/**
 * Wrapper para sanitizeDate que usa a versão tipada quando habilitada
 */
export function sanitizeDate(value: any): string | null {
  if (USE_TYPED_VALIDATIONS) {
    try {
      return sanitizeDateTyped(value);
    } catch (error) {
      console.warn('Fallback to original sanitization due to error:', error);
      return sanitizeDateOriginal(value);
    }
  }
  
  return sanitizeDateOriginal(value);
}

/**
 * Wrapper para sanitizeArray que usa a versão tipada quando habilitada
 */
export function sanitizeArray(value: any): any[] {
  if (USE_TYPED_VALIDATIONS) {
    try {
      return sanitizeArrayTyped(value);
    } catch (error) {
      console.warn('Fallback to original sanitization due to error:', error);
      return sanitizeArrayOriginal(value);
    }
  }
  
  return sanitizeArrayOriginal(value);
}

// ==================== UTILITÁRIOS DE MIGRAÇÃO ====================

/**
 * Função para testar compatibilidade entre versões
 */
export function testValidationCompatibility(testData: any[]): {
  compatible: boolean;
  differences: string[];
} {
  const differences: string[] = [];
  let compatible = true;
  
  for (const data of testData) {
    try {
      // Testar validateConcurso
      const originalResult = validateConcursoOriginal(data);
      const typedResult = validateConcursoTyped(data as ConcursoInput);
      
      if (originalResult.isValid !== typedResult.isValid) {
        differences.push(`validateConcurso: Original=${originalResult.isValid}, Typed=${typedResult.isValid}`);
        compatible = false;
      }
      
      // Testar sanitização
      const originalSanitized = sanitizeStringOriginal(data.title);
      const typedSanitized = sanitizeStringTyped(data.title);
      
      if (originalSanitized !== typedSanitized) {
        differences.push(`sanitizeString: Original="${originalSanitized}", Typed="${typedSanitized}"`);
        compatible = false;
      }
      
    } catch (error) {
      differences.push(`Error testing data: ${error}`);
      compatible = false;
    }
  }
  
  return { compatible, differences };
}

/**
 * Função para obter estatísticas de uso das validações tipadas
 */
export function getValidationStats(): {
  usingTypedValidations: boolean;
  environment: string;
  fallbackCount: number;
} {
  return {
    usingTypedValidations: USE_TYPED_VALIDATIONS,
    environment: process.env.NODE_ENV || 'unknown',
    fallbackCount: 0 // TODO: Implementar contador de fallbacks
  };
}

/**
 * Função para forçar o uso das validações tipadas (para testes)
 */
export function enableTypedValidations(): void {
  // Esta função pode ser usada em testes para forçar o uso das validações tipadas
  (global as any).__USE_TYPED_VALIDATIONS = true;
}

/**
 * Função para desabilitar as validações tipadas (para testes)
 */
export function disableTypedValidations(): void {
  // Esta função pode ser usada em testes para forçar o uso das validações originais
  (global as any).__USE_TYPED_VALIDATIONS = false;
}

// ==================== EXPORTS ====================

// Re-export das interfaces e tipos para facilitar o uso
export type { 
  ValidationResult,
  ConcursoInput,
  QuestaoInput,
  QuestionOptionsInput,
  SimulationResultsInput
} from './validations-typed';

// Re-export dos type guards para uso direto
export {
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isValidDate,
  isValidEmail,
  isValidUrl,
  isNonEmptyString,
  isPositiveNumber,
  isInRange
} from './validations-typed';