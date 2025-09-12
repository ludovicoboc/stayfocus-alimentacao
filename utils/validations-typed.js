"use strict";
/**
 * SUP-4: Sistema de validação com tipagem forte
 * Versões tipadas das funções de validação, eliminando uso de 'any'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedValidator = void 0;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isValidDate = isValidDate;
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.isNonEmptyString = isNonEmptyString;
exports.isPositiveNumber = isPositiveNumber;
exports.isInRange = isInRange;
exports.sanitizeString = sanitizeString;
exports.sanitizeStringTyped = sanitizeString;
exports.sanitizeNumber = sanitizeNumber;
exports.sanitizeNumberTyped = sanitizeNumber;
exports.sanitizeDate = sanitizeDate;
exports.sanitizeDateTyped = sanitizeDate;
exports.sanitizeArray = sanitizeArray;
exports.sanitizeArrayTyped = sanitizeArray;
exports.sanitizeBoolean = sanitizeBoolean;
exports.validateConcurso = validateConcurso;
exports.validateConcursoTyped = validateConcurso;
exports.validateQuestao = validateQuestao;
exports.validateQuestaoTyped = validateQuestao;
exports.validateQuestionOptions = validateQuestionOptions;
exports.validateQuestionOptionsTyped = validateQuestionOptions;
exports.validateSimulationResults = validateSimulationResults;
exports.validateSimulationResultsTyped = validateSimulationResults;
exports.createValidator = createValidator;
exports.required = required;
exports.minLength = minLength;
exports.maxLength = maxLength;
exports.isValidType = isValidType;
// ==================== TYPE GUARDS ====================
function isString(value) {
    return typeof value === 'string';
}
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isArray(value) {
    return Array.isArray(value);
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isValidDate(value) {
    if (value instanceof Date) {
        return !isNaN(value.getTime());
    }
    if (isString(value)) {
        const date = new Date(value);
        return !isNaN(date.getTime());
    }
    return false;
}
function isValidEmail(value) {
    if (!isString(value))
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}
function isValidUrl(value) {
    if (!isString(value))
        return false;
    try {
        new URL(value);
        return true;
    }
    catch {
        return false;
    }
}
function isNonEmptyString(value) {
    return isString(value) && value.trim().length > 0;
}
function isPositiveNumber(value) {
    return isNumber(value) && value > 0;
}
function isInRange(value, min, max) {
    return isNumber(value) && value >= min && value <= max;
}
// ==================== FUNÇÕES DE SANITIZAÇÃO TIPADAS ====================
function sanitizeString(value) {
    if (!isString(value))
        return '';
    return value.trim().replace(/\s+/g, ' ');
}
function sanitizeNumber(value) {
    if (isNumber(value))
        return value;
    if (isString(value)) {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }
    return null;
}
function sanitizeDate(value) {
    if (!value)
        return null;
    // Se já está no formato ISO
    if (isString(value) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.split('T')[0]; // Remove a parte do tempo se houver
    }
    // Se está no formato brasileiro DD/MM/YYYY
    if (isString(value) && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // Tentar converter Date para string ISO
    if (value instanceof Date) {
        return value.toISOString().split('T')[0];
    }
    return null;
}
function sanitizeArray(value, itemSanitizer) {
    if (!isArray(value))
        return [];
    const filtered = value.filter(item => item !== null && item !== undefined && item !== '');
    if (itemSanitizer) {
        return filtered.map(itemSanitizer);
    }
    return filtered;
}
function sanitizeBoolean(value) {
    if (isBoolean(value))
        return value;
    if (isString(value)) {
        const lower = value.toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes';
    }
    if (isNumber(value))
        return value !== 0;
    return false;
}
// ==================== VALIDAÇÕES ESPECÍFICAS TIPADAS ====================
function validateConcurso(input) {
    const errors = [];
    // Validar title
    if (!isNonEmptyString(input.title)) {
        errors.push('Título é obrigatório e deve ser uma string não vazia');
    }
    else if (input.title.length > 200) {
        errors.push('Título deve ter no máximo 200 caracteres');
    }
    // Validar organizer
    if (!isNonEmptyString(input.organizer)) {
        errors.push('Organizador é obrigatório e deve ser uma string não vazia');
    }
    else if (input.organizer.length > 100) {
        errors.push('Organizador deve ter no máximo 100 caracteres');
    }
    // Validar status
    const validStatuses = ['planejado', 'inscrito', 'estudando', 'realizado', 'aguardando_resultado'];
    if (input.status && !validStatuses.includes(input.status)) {
        errors.push(`Status deve ser um dos valores: ${validStatuses.join(', ')}`);
    }
    // Validar datas (opcionais)
    if (input.registration_date && !isValidDate(input.registration_date)) {
        errors.push('Data de inscrição deve ser uma data válida');
    }
    if (input.exam_date && !isValidDate(input.exam_date)) {
        errors.push('Data do exame deve ser uma data válida');
    }
    // Validar URL do edital (opcional)
    if (input.edital_link && !isValidUrl(input.edital_link)) {
        errors.push('Link do edital deve ser uma URL válida');
    }
    const isValid = errors.length === 0;
    if (isValid) {
        const sanitizedData = {
            title: sanitizeString(input.title),
            organizer: sanitizeString(input.organizer),
            status: input.status || 'planejado',
            registration_date: sanitizeDate(input.registration_date),
            exam_date: sanitizeDate(input.exam_date),
            edital_link: input.edital_link ? sanitizeString(input.edital_link) : null,
        };
        return { isValid: true, errors: [], data: sanitizedData };
    }
    return { isValid: false, errors };
}
function validateQuestao(input) {
    const errors = [];
    // Validar question_text
    if (!isNonEmptyString(input.question_text)) {
        errors.push('Texto da questão é obrigatório');
    }
    else if (input.question_text.length > 2000) {
        errors.push('Texto da questão deve ter no máximo 2000 caracteres');
    }
    // Validar options (se fornecido)
    if (input.options) {
        if (!isArray(input.options)) {
            errors.push('Opções devem ser um array');
        }
        else {
            const optionsValidation = validateQuestionOptions({ options: input.options });
            if (!optionsValidation.isValid) {
                errors.push(...optionsValidation.errors);
            }
        }
    }
    // Validar correct_answer (opcional)
    if (input.correct_answer && !isString(input.correct_answer)) {
        errors.push('Resposta correta deve ser uma string');
    }
    // Validar difficulty (opcional)
    const validDifficulties = ['facil', 'medio', 'dificil'];
    if (input.difficulty && !validDifficulties.includes(input.difficulty)) {
        errors.push(`Dificuldade deve ser: ${validDifficulties.join(', ')}`);
    }
    // Validar question_type (opcional)
    const validTypes = ['multiple_choice', 'true_false', 'essay', 'short_answer'];
    if (input.question_type && !validTypes.includes(input.question_type)) {
        errors.push(`Tipo de questão deve ser: ${validTypes.join(', ')}`);
    }
    // Validar points (opcional)
    if (input.points !== undefined) {
        const points = sanitizeNumber(input.points);
        if (points === null || points < 0) {
            errors.push('Pontos deve ser um número não negativo');
        }
    }
    // Validar time_limit_seconds (opcional)
    if (input.time_limit_seconds !== undefined) {
        const timeLimit = sanitizeNumber(input.time_limit_seconds);
        if (timeLimit === null || timeLimit < 0) {
            errors.push('Limite de tempo deve ser um número não negativo');
        }
    }
    // Validar year (opcional)
    if (input.year !== undefined) {
        const year = sanitizeNumber(input.year);
        if (year === null || year < 1900 || year > new Date().getFullYear() + 10) {
            errors.push('Ano deve ser um número válido entre 1900 e ' + (new Date().getFullYear() + 10));
        }
    }
    // Validar tags (opcional)
    if (input.tags && !isArray(input.tags)) {
        errors.push('Tags devem ser um array');
    }
    const isValid = errors.length === 0;
    if (isValid) {
        const sanitizedData = {
            question_text: sanitizeString(input.question_text),
            correct_answer: input.correct_answer ? sanitizeString(input.correct_answer) : undefined,
            explanation: input.explanation ? sanitizeString(input.explanation) : undefined,
            difficulty: input.difficulty,
            question_type: input.question_type,
            points: sanitizeNumber(input.points) || undefined,
            time_limit_seconds: sanitizeNumber(input.time_limit_seconds) || undefined,
            year: sanitizeNumber(input.year) || undefined,
            tags: input.tags ? sanitizeArray(input.tags, sanitizeString) : undefined,
            source: input.source ? sanitizeString(input.source) : undefined,
            is_active: input.is_active !== undefined ? sanitizeBoolean(input.is_active) : true,
        };
        return { isValid: true, errors: [], data: sanitizedData };
    }
    return { isValid: false, errors };
}
function validateQuestionOptions(input) {
    const errors = [];
    if (!input.options || !isArray(input.options)) {
        errors.push('Opções são obrigatórias e devem ser um array');
        return { isValid: false, errors };
    }
    if (input.options.length < 2) {
        errors.push('Deve haver pelo menos 2 opções');
    }
    if (input.options.length > 10) {
        errors.push('Deve haver no máximo 10 opções');
    }
    let correctCount = 0;
    const sanitizedOptions = [];
    input.options.forEach((option, index) => {
        if (!isObject(option)) {
            errors.push(`Opção ${index + 1} deve ser um objeto`);
            return;
        }
        const opt = option;
        if (!isNonEmptyString(opt.text)) {
            errors.push(`Opção ${index + 1} deve ter um texto não vazio`);
            return;
        }
        if (opt.text.length > 500) {
            errors.push(`Opção ${index + 1} deve ter no máximo 500 caracteres`);
        }
        const isCorrect = sanitizeBoolean(opt.isCorrect);
        if (isCorrect)
            correctCount++;
        sanitizedOptions.push({
            text: sanitizeString(opt.text),
            isCorrect
        });
    });
    if (correctCount === 0) {
        errors.push('Deve haver pelo menos uma opção correta');
    }
    if (correctCount > 1) {
        errors.push('Deve haver apenas uma opção correta');
    }
    const isValid = errors.length === 0;
    return {
        isValid,
        errors,
        data: isValid ? sanitizedOptions : undefined
    };
}
function validateSimulationResults(input) {
    const errors = [];
    // Validar score
    const score = sanitizeNumber(input.score);
    if (score === null || score < 0) {
        errors.push('Score deve ser um número não negativo');
    }
    // Validar total_questions
    const totalQuestions = sanitizeNumber(input.total_questions);
    if (totalQuestions === null || totalQuestions <= 0) {
        errors.push('Total de questões deve ser um número positivo');
    }
    // Validar percentage
    if (input.percentage !== undefined) {
        const percentage = sanitizeNumber(input.percentage);
        if (percentage === null || !isInRange(percentage, 0, 100)) {
            errors.push('Porcentagem deve ser um número entre 0 e 100');
        }
    }
    // Validar time_taken_minutes (opcional)
    if (input.time_taken_minutes !== undefined) {
        const timeTaken = sanitizeNumber(input.time_taken_minutes);
        if (timeTaken === null || timeTaken < 0) {
            errors.push('Tempo gasto deve ser um número não negativo');
        }
    }
    // Validar answers
    if (!isObject(input.answers)) {
        errors.push('Respostas devem ser um objeto');
    }
    // Validar completed_at (opcional)
    if (input.completed_at && !isValidDate(input.completed_at)) {
        errors.push('Data de conclusão deve ser uma data válida');
    }
    const isValid = errors.length === 0;
    if (isValid) {
        const sanitizedData = {
            score: score,
            total_questions: totalQuestions,
            percentage: sanitizeNumber(input.percentage) || Math.round((score / totalQuestions) * 100),
            time_taken_minutes: sanitizeNumber(input.time_taken_minutes) || undefined,
            answers: input.answers,
            completed_at: sanitizeDate(input.completed_at) || new Date().toISOString(),
            user_id: input.user_id ? sanitizeString(input.user_id) : undefined,
            simulation_id: input.simulation_id ? sanitizeString(input.simulation_id) : undefined,
        };
        return { isValid: true, errors: [], data: sanitizedData };
    }
    return { isValid: false, errors };
}
// ==================== VALIDADOR GENÉRICO TIPADO ====================
class TypedValidator {
    constructor() {
        this.errors = [];
        this.errors = [];
    }
    validate(field, value, validators) {
        for (const validator of validators) {
            const result = validator(value);
            if (result === false) {
                this.errors.push(`Campo ${String(field)} é inválido`);
                break;
            }
            else if (typeof result === 'string') {
                this.errors.push(result);
                break;
            }
        }
        return this;
    }
    getResult() {
        return {
            isValid: this.errors.length === 0,
            errors: this.errors
        };
    }
    reset() {
        this.errors = [];
        return this;
    }
}
exports.TypedValidator = TypedValidator;
// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================
function createValidator() {
    return new TypedValidator();
}
function required(fieldName) {
    return (value) => {
        if (value === null || value === undefined) {
            return `${fieldName} é obrigatório`;
        }
        if (isString(value) && value.trim() === '') {
            return `${fieldName} não pode estar vazio`;
        }
        if (isArray(value) && value.length === 0) {
            return `${fieldName} deve ter pelo menos um item`;
        }
        return true;
    };
}
function minLength(min, fieldName) {
    return (value) => {
        if (!isString(value))
            return `${fieldName} deve ser uma string`;
        return value.length >= min || `${fieldName} deve ter pelo menos ${min} caracteres`;
    };
}
function maxLength(max, fieldName) {
    return (value) => {
        if (!isString(value))
            return `${fieldName} deve ser uma string`;
        return value.length <= max || `${fieldName} deve ter no máximo ${max} caracteres`;
    };
}
function isValidType(typeName, typeGuard) {
    return (value) => {
        return typeGuard(value) || `Deve ser do tipo ${typeName}`;
    };
}
