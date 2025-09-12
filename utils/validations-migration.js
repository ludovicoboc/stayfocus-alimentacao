"use strict";
/**
 * SUP-4: Migração gradual para validações tipadas
 * Wrapper functions para migração gradual das validações
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInRange = exports.isPositiveNumber = exports.isNonEmptyString = exports.isValidUrl = exports.isValidEmail = exports.isValidDate = exports.isObject = exports.isArray = exports.isBoolean = exports.isNumber = exports.isString = void 0;
exports.validateConcurso = validateConcurso;
exports.validateQuestao = validateQuestao;
exports.validateData = validateData;
exports.validateReceita = validateReceita;
exports.validateMedicamento = validateMedicamento;
exports.validateRegistroHumor = validateRegistroHumor;
exports.validateDespesa = validateDespesa;
exports.validateSessaoEstudo = validateSessaoEstudo;
exports.validateRegistroSono = validateRegistroSono;
exports.validateAtividadeLazer = validateAtividadeLazer;
exports.validateItemListaCompras = validateItemListaCompras;
exports.validateQuestionOptions = validateQuestionOptions;
exports.validateSimulationResults = validateSimulationResults;
exports.sanitizeString = sanitizeString;
exports.sanitizeNumber = sanitizeNumber;
exports.sanitizeDate = sanitizeDate;
exports.sanitizeArray = sanitizeArray;
exports.testValidationCompatibility = testValidationCompatibility;
exports.getValidationStats = getValidationStats;
exports.enableTypedValidations = enableTypedValidations;
exports.disableTypedValidations = disableTypedValidations;
const validations_1 = require("./validations");
const validations_typed_1 = require("./validations-typed");
// ==================== CONFIGURAÇÃO DE MIGRAÇÃO ====================
// Flag para controlar qual versão usar
const USE_TYPED_VALIDATIONS = process.env.NODE_ENV === 'development' ||
    process.env.USE_TYPED_VALIDATIONS === 'true';
// ==================== FUNÇÕES DE MIGRAÇÃO ====================
/**
 * Wrapper para validateConcurso que usa a versão tipada quando habilitada
 */
function validateConcurso(concurso) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            const typedResult = (0, validations_typed_1.validateConcurso)(concurso);
            return {
                isValid: typedResult.isValid,
                errors: typedResult.errors
            };
        }
        catch (error) {
            console.warn('Fallback to original validation due to error:', error);
            return (0, validations_1.validateConcurso)(concurso);
        }
    }
    return (0, validations_1.validateConcurso)(concurso);
}
/**
 * Wrapper para validateQuestao que usa a versão tipada quando habilitada
 */
function validateQuestao(questao) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            const typedResult = (0, validations_typed_1.validateQuestao)(questao);
            return {
                isValid: typedResult.isValid,
                errors: typedResult.errors
            };
        }
        catch (error) {
            console.warn('Fallback to original validation due to error:', error);
            return (0, validations_1.validateQuestao)(questao);
        }
    }
    return (0, validations_1.validateQuestao)(questao);
}
/**
 * Wrapper para validateData que usa a versão tipada quando habilitada
 */
function validateData(data, validationFunction) {
    return (0, validations_1.validateData)(data, validationFunction);
}
/**
 * Wrapper para validateReceita que usa a versão tipada quando habilitada
 */
function validateReceita(receita) {
    return (0, validations_1.validateReceita)(receita);
}
/**
 * Wrapper para validateMedicamento que usa a versão tipada quando habilitada
 */
function validateMedicamento(medicamento) {
    return (0, validations_1.validateMedicamento)(medicamento);
}
/**
 * Wrapper para validateRegistroHumor que usa a versão tipada quando habilitada
 */
function validateRegistroHumor(registro) {
    return (0, validations_1.validateRegistroHumor)(registro);
}
/**
 * Wrapper para validateDespesa que usa a versão tipada quando habilitada
 */
function validateDespesa(despesa) {
    return (0, validations_1.validateDespesa)(despesa);
}
/**
 * Wrapper para validateSessaoEstudo que usa a versão tipada quando habilitada
 */
function validateSessaoEstudo(sessao) {
    return (0, validations_1.validateSessaoEstudo)(sessao);
}
/**
 * Wrapper para validateRegistroSono que usa a versão tipada quando habilitada
 */
function validateRegistroSono(registro) {
    return (0, validations_1.validateRegistroSono)(registro);
}
/**
 * Wrapper para validateAtividadeLazer que usa a versão tipada quando habilitada
 */
function validateAtividadeLazer(atividade) {
    return (0, validations_1.validateAtividadeLazer)(atividade);
}
/**
 * Wrapper para validateItemListaCompras que usa a versão tipada quando habilitada
 */
function validateItemListaCompras(item) {
    return (0, validations_1.validateItemListaCompras)(item);
}
/**
 * Wrapper para validateQuestionOptions que usa a versão tipada quando habilitada
 */
function validateQuestionOptions(options) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            const typedResult = (0, validations_typed_1.validateQuestionOptions)(options);
            return {
                isValid: typedResult.isValid,
                errors: typedResult.errors
            };
        }
        catch (error) {
            console.warn('Fallback to original validation due to error:', error);
            return (0, validations_1.validateQuestionOptions)(options);
        }
    }
    return (0, validations_1.validateQuestionOptions)(options);
}
/**
 * Wrapper para validateSimulationResults que usa a versão tipada quando habilitada
 */
function validateSimulationResults(results) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            const typedResult = (0, validations_typed_1.validateSimulationResults)(results);
            return {
                isValid: typedResult.isValid,
                errors: typedResult.errors
            };
        }
        catch (error) {
            console.warn('Fallback to original validation due to error:', error);
            return (0, validations_1.validateSimulationResults)(results);
        }
    }
    return (0, validations_1.validateSimulationResults)(results);
}
/**
 * Wrapper para sanitizeString que usa a versão tipada quando habilitada
 */
function sanitizeString(value) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            return (0, validations_typed_1.sanitizeString)(value);
        }
        catch (error) {
            console.warn('Fallback to original sanitization due to error:', error);
            return (0, validations_1.sanitizeString)(value);
        }
    }
    return (0, validations_1.sanitizeString)(value);
}
/**
 * Wrapper para sanitizeNumber que usa a versão tipada quando habilitada
 */
function sanitizeNumber(value) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            return (0, validations_typed_1.sanitizeNumber)(value);
        }
        catch (error) {
            console.warn('Fallback to original sanitization due to error:', error);
            return (0, validations_1.sanitizeNumber)(value);
        }
    }
    return (0, validations_1.sanitizeNumber)(value);
}
/**
 * Wrapper para sanitizeDate que usa a versão tipada quando habilitada
 */
function sanitizeDate(value) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            return (0, validations_typed_1.sanitizeDate)(value);
        }
        catch (error) {
            console.warn('Fallback to original sanitization due to error:', error);
            return (0, validations_1.sanitizeDate)(value);
        }
    }
    return (0, validations_1.sanitizeDate)(value);
}
/**
 * Wrapper para sanitizeArray que usa a versão tipada quando habilitada
 */
function sanitizeArray(value) {
    if (USE_TYPED_VALIDATIONS) {
        try {
            return (0, validations_typed_1.sanitizeArray)(value);
        }
        catch (error) {
            console.warn('Fallback to original sanitization due to error:', error);
            return (0, validations_1.sanitizeArray)(value);
        }
    }
    return (0, validations_1.sanitizeArray)(value);
}
// ==================== UTILITÁRIOS DE MIGRAÇÃO ====================
/**
 * Função para testar compatibilidade entre versões
 */
function testValidationCompatibility(testData) {
    const differences = [];
    let compatible = true;
    for (const data of testData) {
        try {
            // Testar validateConcurso
            const originalResult = (0, validations_1.validateConcurso)(data);
            const typedResult = (0, validations_typed_1.validateConcurso)(data);
            if (originalResult.isValid !== typedResult.isValid) {
                differences.push(`validateConcurso: Original=${originalResult.isValid}, Typed=${typedResult.isValid}`);
                compatible = false;
            }
            // Testar sanitização
            const originalSanitized = (0, validations_1.sanitizeString)(data.title);
            const typedSanitized = (0, validations_typed_1.sanitizeString)(data.title);
            if (originalSanitized !== typedSanitized) {
                differences.push(`sanitizeString: Original="${originalSanitized}", Typed="${typedSanitized}"`);
                compatible = false;
            }
        }
        catch (error) {
            differences.push(`Error testing data: ${error}`);
            compatible = false;
        }
    }
    return { compatible, differences };
}
/**
 * Função para obter estatísticas de uso das validações tipadas
 */
function getValidationStats() {
    return {
        usingTypedValidations: USE_TYPED_VALIDATIONS,
        environment: process.env.NODE_ENV || 'unknown',
        fallbackCount: 0 // TODO: Implementar contador de fallbacks
    };
}
/**
 * Função para forçar o uso das validações tipadas (para testes)
 */
function enableTypedValidations() {
    // Esta função pode ser usada em testes para forçar o uso das validações tipadas
    global.__USE_TYPED_VALIDATIONS = true;
}
/**
 * Função para desabilitar as validações tipadas (para testes)
 */
function disableTypedValidations() {
    // Esta função pode ser usada em testes para forçar o uso das validações originais
    global.__USE_TYPED_VALIDATIONS = false;
}
// Re-export dos type guards para uso direto
var validations_typed_2 = require("./validations-typed");
Object.defineProperty(exports, "isString", { enumerable: true, get: function () { return validations_typed_2.isString; } });
Object.defineProperty(exports, "isNumber", { enumerable: true, get: function () { return validations_typed_2.isNumber; } });
Object.defineProperty(exports, "isBoolean", { enumerable: true, get: function () { return validations_typed_2.isBoolean; } });
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return validations_typed_2.isArray; } });
Object.defineProperty(exports, "isObject", { enumerable: true, get: function () { return validations_typed_2.isObject; } });
Object.defineProperty(exports, "isValidDate", { enumerable: true, get: function () { return validations_typed_2.isValidDate; } });
Object.defineProperty(exports, "isValidEmail", { enumerable: true, get: function () { return validations_typed_2.isValidEmail; } });
Object.defineProperty(exports, "isValidUrl", { enumerable: true, get: function () { return validations_typed_2.isValidUrl; } });
Object.defineProperty(exports, "isNonEmptyString", { enumerable: true, get: function () { return validations_typed_2.isNonEmptyString; } });
Object.defineProperty(exports, "isPositiveNumber", { enumerable: true, get: function () { return validations_typed_2.isPositiveNumber; } });
Object.defineProperty(exports, "isInRange", { enumerable: true, get: function () { return validations_typed_2.isInRange; } });
