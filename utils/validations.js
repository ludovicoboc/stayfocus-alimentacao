"use strict";
/**
 * Sistema de validação de dados para a aplicação StayFocus
 * Funções reutilizáveis para validar dados antes de enviar para o Supabase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
exports.validateReceita = validateReceita;
exports.validateMedicamento = validateMedicamento;
exports.validateRegistroHumor = validateRegistroHumor;
exports.validateDespesa = validateDespesa;
exports.validateConcurso = validateConcurso;
exports.validateSessaoEstudo = validateSessaoEstudo;
exports.validateRegistroSono = validateRegistroSono;
exports.validateAtividadeLazer = validateAtividadeLazer;
exports.validateQuestionOptions = validateQuestionOptions;
exports.validateQuestao = validateQuestao;
exports.validateItemListaCompras = validateItemListaCompras;
exports.validateSimulationResults = validateSimulationResults;
exports.validateData = validateData;
exports.sanitizeString = sanitizeString;
exports.sanitizeArray = sanitizeArray;
exports.sanitizeNumber = sanitizeNumber;
exports.sanitizeDate = sanitizeDate;
/**
 * Classe principal para validação de dados
 */
class DataValidator {
    constructor() {
        this.errors = [];
        this.errors = [];
    }
    /**
     * Valida múltiplos campos usando regras
     */
    validateFields(rules) {
        this.errors = [];
        for (const rule of rules) {
            this.validateField(rule.field, rule.value, rule.rules, rule.customMessage);
        }
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
        };
    }
    /**
     * Valida um campo individual
     */
    validateField(fieldName, value, rules, customMessage) {
        // Se o campo não é obrigatório e o valor é null/undefined, pular todas as validações
        const isRequired = rules.includes("required");
        if (!isRequired && (value === null || value === undefined)) {
            return;
        }
        for (const rule of rules) {
            const parts = rule.split(":");
            const ruleName = parts[0];
            const ruleValue = parts[1];
            let isValid = true;
            let errorMessage = customMessage || "";
            switch (ruleName) {
                case "required":
                    isValid = this.isRequired(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} é obrigatório`;
                    }
                    break;
                case "string":
                    isValid = this.isString(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser um texto`;
                    }
                    break;
                case "number":
                    isValid = this.isNumber(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser um número`;
                    }
                    break;
                case "positive":
                    isValid = this.isPositive(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser um número positivo`;
                    }
                    break;
                case "email":
                    isValid = this.isEmail(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ter um formato de email válido`;
                    }
                    break;
                case "date":
                    isValid = this.isValidDate(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ter um formato de data válido`;
                    }
                    break;
                case "time":
                    isValid = this.isValidTime(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ter um formato de horário válido (HH:MM)`;
                    }
                    break;
                case "url":
                    isValid = this.isUrl(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser uma URL válida`;
                    }
                    break;
                case "minLength":
                    isValid = this.hasMinLength(value, parseInt(ruleValue));
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ter pelo menos ${ruleValue} caracteres`;
                    }
                    break;
                case "maxLength":
                    isValid = this.hasMaxLength(value, parseInt(ruleValue));
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ter no máximo ${ruleValue} caracteres`;
                    }
                    break;
                case "min":
                    isValid = this.hasMinValue(value, parseFloat(ruleValue));
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser pelo menos ${ruleValue}`;
                    }
                    break;
                case "max":
                    isValid = this.hasMaxValue(value, parseFloat(ruleValue));
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser no máximo ${ruleValue}`;
                    }
                    break;
                case "array":
                    isValid = this.isArray(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser uma lista`;
                    }
                    break;
                case "arrayNotEmpty":
                    isValid = this.isArrayNotEmpty(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve conter pelo menos um item`;
                    }
                    break;
                case "boolean":
                    isValid = this.isBoolean(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser verdadeiro ou falso`;
                    }
                    break;
                case "enum":
                    const enumValues = ruleValue.split(",");
                    isValid = this.isInEnum(value, enumValues);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser um dos valores: ${enumValues.join(", ")}`;
                    }
                    break;
                case "uuid":
                    isValid = this.isUuid(value);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve ser um ID válido`;
                    }
                    break;
                case "range":
                    const [minRange, maxRange] = ruleValue.split("-").map(Number);
                    isValid = this.isInRange(value, minRange, maxRange);
                    if (!isValid && !errorMessage) {
                        errorMessage = `${fieldName} deve estar entre ${minRange} e ${maxRange}`;
                    }
                    break;
            }
            if (!isValid) {
                this.errors.push(errorMessage);
                break; // Para de validar este campo se uma regra falhou
            }
        }
    }
    // Métodos de validação individuais
    isRequired(value) {
        if (value === null || value === undefined)
            return false;
        if (typeof value === "string" && value.trim() === "")
            return false;
        if (Array.isArray(value) && value.length === 0)
            return false;
        return true;
    }
    isString(value) {
        return typeof value === "string";
    }
    isNumber(value) {
        return typeof value === "number" && !isNaN(value);
    }
    isPositive(value) {
        return this.isNumber(value) && value > 0;
    }
    isEmail(value) {
        if (!this.isString(value))
            return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
    isValidDate(value) {
        // Para campos opcionais, aceitar null, undefined
        if (value === null || value === undefined)
            return true;
        if (!this.isString(value))
            return false;
        // Se a string estiver vazia, considerar válida (campo opcional)
        if (value.trim() === "")
            return true;
        // Aceita formatos ISO (YYYY-MM-DD) e DD/MM/YYYY
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const brDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (isoDateRegex.test(value)) {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        if (brDateRegex.test(value)) {
            const [day, month, year] = value.split("/");
            const date = new Date(`${year}-${month}-${day}`);
            return !isNaN(date.getTime());
        }
        return false;
    }
    isValidTime(value) {
        if (!this.isString(value))
            return false;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
    }
    isUrl(value) {
        if (!this.isString(value))
            return false;
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    }
    hasMinLength(value, minLength) {
        if (!this.isString(value))
            return false;
        return value.length >= minLength;
    }
    hasMaxLength(value, maxLength) {
        if (!this.isString(value))
            return false;
        return value.length <= maxLength;
    }
    hasMinValue(value, minValue) {
        if (!this.isNumber(value))
            return false;
        return value >= minValue;
    }
    hasMaxValue(value, maxValue) {
        if (!this.isNumber(value))
            return false;
        return value <= maxValue;
    }
    isArray(value) {
        return Array.isArray(value);
    }
    isArrayNotEmpty(value) {
        return this.isArray(value) && value.length > 0;
    }
    isBoolean(value) {
        return typeof value === "boolean";
    }
    isInEnum(value, enumValues) {
        return enumValues.includes(value);
    }
    isUuid(value) {
        if (!this.isString(value))
            return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }
    isInRange(value, min, max) {
        if (!this.isNumber(value))
            return false;
        return value >= min && value <= max;
    }
}
exports.DataValidator = DataValidator;
/**
 * Funções de validação específicas para tipos de dados da aplicação
 */
// Validação para receitas
function validateReceita(receita) {
    const validator = new DataValidator();
    return validator.validateFields([
        {
            field: "Nome",
            value: receita.nome,
            rules: ["required", "string", "minLength:2", "maxLength:100"],
        },
        {
            field: "Categoria",
            value: receita.categoria,
            rules: ["required", "string", "maxLength:50"],
        },
        {
            field: "Ingredientes",
            value: receita.ingredientes,
            rules: ["required", "array", "arrayNotEmpty"],
        },
        {
            field: "Modo de preparo",
            value: receita.modo_preparo,
            rules: ["required", "string", "minLength:10", "maxLength:2000"],
        },
        {
            field: "Tempo de preparo",
            value: receita.tempo_preparo,
            rules: ["number", "positive", "max:1440"],
        }, // máximo 24h
        {
            field: "Porções",
            value: receita.porcoes,
            rules: ["number", "positive", "max:50"],
        },
        {
            field: "Dificuldade",
            value: receita.dificuldade,
            rules: ["enum:facil,medio,dificil"],
        },
    ]);
}
// Validação para medicamentos
function validateMedicamento(medicamento) {
    const validator = new DataValidator();
    return validator.validateFields([
        {
            field: "Nome",
            value: medicamento.nome,
            rules: ["required", "string", "minLength:2", "maxLength:100"],
        },
        {
            field: "Dosagem",
            value: medicamento.dosagem,
            rules: ["required", "string", "maxLength:50"],
        },
        {
            field: "Frequência",
            value: medicamento.frequencia,
            rules: ["required", "string", "maxLength:100"],
        },
        {
            field: "Horários",
            value: medicamento.horarios,
            rules: ["required", "array", "arrayNotEmpty"],
        },
        {
            field: "Data de início",
            value: medicamento.data_inicio,
            rules: ["required", "date"],
        },
        { field: "Data de fim", value: medicamento.data_fim, rules: ["date"] },
        {
            field: "Observações",
            value: medicamento.observacoes,
            rules: ["string", "maxLength:500"],
        },
    ]);
}
// Validação para registros de humor
function validateRegistroHumor(registro) {
    const validator = new DataValidator();
    return validator.validateFields([
        { field: "Data", value: registro.data, rules: ["required", "date"] },
        {
            field: "Nível de humor",
            value: registro.nivel_humor,
            rules: ["required", "number", "range:1-10"],
        },
        { field: "Fatores", value: registro.fatores, rules: ["array"] },
        {
            field: "Observações",
            value: registro.notas,
            rules: ["string", "maxLength:500"],
        },
    ]);
}
// Validação para despesas
function validateDespesa(despesa) {
    const validator = new DataValidator();
    return validator.validateFields([
        {
            field: "Descrição",
            value: despesa.description,
            rules: ["required", "string", "minLength:2", "maxLength:200"],
        },
        {
            field: "Valor",
            value: despesa.amount,
            rules: ["required", "number", "positive"],
        },
        { field: "Data", value: despesa.date, rules: ["required", "date"] },
        {
            field: "Categoria ID",
            value: despesa.category_id,
            rules: ["required", "uuid"],
        },
        {
            field: "Observações",
            value: despesa.notes,
            rules: ["string", "maxLength:500"],
        },
    ]);
}
// Validação para concursos
function validateConcurso(concurso) {
    const validator = new DataValidator();
    const rules = [
        {
            field: "Título",
            value: concurso.title,
            rules: ["required", "string", "minLength:2", "maxLength:200"],
        },
        {
            field: "Organizador",
            value: concurso.organizer,
            rules: ["required", "string", "minLength:2", "maxLength:100"],
        },
        {
            field: "Status",
            value: concurso.status,
            rules: [
                "enum:planejado,inscrito,estudando,realizado,aguardando_resultado",
            ],
        },
    ];
    // Validar datas apenas se fornecidas (campos opcionais)
    if (concurso.registration_date) {
        rules.push({
            field: "Data de inscrição",
            value: concurso.registration_date,
            rules: ["date"],
        });
    }
    if (concurso.exam_date) {
        rules.push({
            field: "Data da prova",
            value: concurso.exam_date,
            rules: ["date"],
        });
    }
    // Validar URL apenas se fornecida (campo opcional)
    if (concurso.edital_link && concurso.edital_link.trim() !== "") {
        // Aceitar URLs mais flexíveis com regex específica para HTTP/HTTPS
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(concurso.edital_link.trim())) {
            rules.push({
                field: "Link do edital",
                value: concurso.edital_link,
                rules: ["url"],
            });
        }
    }
    return validator.validateFields(rules);
}
// Validação para sessões de estudo
function validateSessaoEstudo(sessao) {
    const validator = new DataValidator();
    const rules = [
        {
            field: "Matéria",
            value: sessao.disciplina,
            rules: ["required", "string", "minLength:2", "maxLength:200"],
        },
        {
            field: "Tópico",
            value: sessao.topico,
            rules: ["string", "maxLength:200"],
        },
        {
            field: "Duração em minutos",
            value: sessao.duration_minutes,
            rules: ["required", "number", "positive", "max:1440"],
        }, // máximo 24h
        {
            field: "Ciclos Pomodoro",
            value: sessao.pomodoro_cycles,
            rules: ["number", "min:0", "max:100"],
        },
        {
            field: "Notas",
            value: sessao.notes,
            rules: ["string", "maxLength:1000"],
        },
    ];
    // Validar competition_id apenas se fornecido
    if (sessao.competition_id) {
        rules.push({
            field: "Concurso ID",
            value: sessao.competition_id,
            rules: ["uuid"],
        });
    }
    return validator.validateFields(rules);
}
// Validação para registro de sono
function validateRegistroSono(registro) {
    const validator = new DataValidator();
    return validator.validateFields([
        { field: "Data", value: registro.date, rules: ["required", "date"] },
        {
            field: "Horário de dormir",
            value: registro.bedtime,
            rules: ["required", "time"],
        },
        {
            field: "Horário de acordar",
            value: registro.wake_time,
            rules: ["required", "time"],
        },
        {
            field: "Qualidade do sono",
            value: registro.sleep_quality,
            rules: ["required", "number", "range:1-5"],
        },
        {
            field: "Observações",
            value: registro.notes,
            rules: ["string", "maxLength:500"],
        },
    ]);
}
// Validação para atividades de lazer
function validateAtividadeLazer(atividade) {
    const validator = new DataValidator();
    return validator.validateFields([
        {
            field: "Nome",
            value: atividade.nome,
            rules: ["required", "string", "minLength:2", "maxLength:100"],
        },
        {
            field: "Categoria",
            value: atividade.categoria,
            rules: ["required", "string", "maxLength:50"],
        },
        {
            field: "Duração em minutos",
            value: atividade.duracao_minutos,
            rules: ["required", "number", "positive", "max:1440"],
        },
        {
            field: "Data de realização",
            value: atividade.data_realizacao,
            rules: ["required", "date"],
        },
        {
            field: "Avaliação",
            value: atividade.avaliacao,
            rules: ["number", "range:1-5"],
        },
        {
            field: "Observações",
            value: atividade.observacoes,
            rules: ["string", "maxLength:500"],
        },
    ]);
}
// Validação para opções de questões
function validateQuestionOptions(options) {
    const validator = new DataValidator();
    if (!Array.isArray(options)) {
        return {
            isValid: false,
            errors: ["Opções devem ser uma lista"]
        };
    }
    if (options.length === 0) {
        return {
            isValid: false,
            errors: ["Deve haver pelo menos uma opção"]
        };
    }
    const errors = [];
    let hasCorrectAnswer = false;
    let correctAnswersCount = 0;
    options.forEach((option, index) => {
        // Validar estrutura da opção
        if (!option || typeof option !== 'object') {
            errors.push(`Opção ${index + 1}: deve ser um objeto válido`);
            return;
        }
        // Validar texto da opção
        if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
            errors.push(`Opção ${index + 1}: texto é obrigatório e deve ser uma string não vazia`);
        }
        else if (option.text.length > 500) {
            errors.push(`Opção ${index + 1}: texto deve ter no máximo 500 caracteres`);
        }
        // Validar indicador de resposta correta
        if (typeof option.isCorrect !== 'boolean') {
            errors.push(`Opção ${index + 1}: isCorrect deve ser verdadeiro ou falso`);
        }
        else if (option.isCorrect) {
            hasCorrectAnswer = true;
            correctAnswersCount++;
        }
    });
    // Validar que há exatamente uma resposta correta
    if (!hasCorrectAnswer) {
        errors.push("Deve haver pelo menos uma resposta correta");
    }
    else if (correctAnswersCount > 1) {
        errors.push("Deve haver apenas uma resposta correta");
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
// Validação para questões de concurso
function validateQuestao(questao) {
    const validator = new DataValidator();
    const baseValidation = validator.validateFields([
        {
            field: "Texto da questão",
            value: questao.question_text,
            rules: ["required", "string", "minLength:10", "maxLength:2000"],
        },
        {
            field: "Opções",
            value: questao.options,
            rules: ["required", "array", "arrayNotEmpty"],
        },
        {
            field: "Resposta correta",
            value: questao.correct_answer,
            rules: ["required", "string", "minLength:1"],
        },
        {
            field: "Explicação",
            value: questao.explanation,
            rules: ["string", "maxLength:1000"],
        },
        {
            field: "Dificuldade",
            value: questao.difficulty,
            rules: ["enum:facil,medio,dificil"],
        },
        {
            field: "Concurso ID",
            value: questao.competition_id,
            rules: ["required", "uuid"],
        },
        {
            field: "Disciplina ID",
            value: questao.subject_id,
            rules: ["required", "uuid"],
        },
    ]);
    // Se a validação base falhou, retornar os erros
    if (!baseValidation.isValid) {
        return baseValidation;
    }
    // Validação específica das opções
    if (questao.options) {
        const optionsValidation = validateQuestionOptions(questao.options);
        if (!optionsValidation.isValid) {
            return {
                isValid: false,
                errors: [...baseValidation.errors, ...optionsValidation.errors]
            };
        }
    }
    // Validações adicionais para novos campos
    const additionalRules = [];
    if (questao.question_type !== undefined) {
        additionalRules.push({
            field: "Tipo de questão",
            value: questao.question_type,
            rules: ["enum:multiple_choice,true_false,essay,short_answer"],
        });
    }
    if (questao.points !== undefined) {
        additionalRules.push({
            field: "Pontos",
            value: questao.points,
            rules: ["number", "positive", "max:1000"],
        });
    }
    if (questao.time_limit_seconds !== undefined) {
        additionalRules.push({
            field: "Tempo limite em segundos",
            value: questao.time_limit_seconds,
            rules: ["number", "positive", "max:7200"], // máximo 2 horas
        });
    }
    if (questao.year !== undefined) {
        additionalRules.push({
            field: "Ano",
            value: questao.year,
            rules: ["number", "min:1900", "max:2100"],
        });
    }
    if (questao.usage_count !== undefined) {
        additionalRules.push({
            field: "Contagem de uso",
            value: questao.usage_count,
            rules: ["number", "min:0"],
        });
    }
    if (additionalRules.length > 0) {
        const additionalValidation = validator.validateFields(additionalRules);
        if (!additionalValidation.isValid) {
            return {
                isValid: false,
                errors: [...baseValidation.errors, ...additionalValidation.errors]
            };
        }
    }
    return baseValidation;
}
// Validação para lista de compras
function validateItemListaCompras(item) {
    const validator = new DataValidator();
    return validator.validateFields([
        {
            field: "Nome",
            value: item.nome,
            rules: ["required", "string", "minLength:1", "maxLength:100"],
        },
        {
            field: "Categoria",
            value: item.categoria,
            rules: ["required", "string", "maxLength:50"],
        },
        {
            field: "Quantidade",
            value: item.quantidade,
            rules: ["string", "maxLength:50"],
        },
    ]);
}
// Validação para resultados de simulação
function validateSimulationResults(results) {
    const validator = new DataValidator();
    const baseValidation = validator.validateFields([
        {
            field: "Score",
            value: results.score,
            rules: ["required", "number", "min:0"],
        },
        {
            field: "Total",
            value: results.total,
            rules: ["required", "number", "positive"],
        },
        {
            field: "Answers",
            value: results.answers,
            rules: ["required"],
        },
        {
            field: "Percentage",
            value: results.percentage,
            rules: ["number", "range:0-100"],
        },
        {
            field: "Time taken in minutes",
            value: results.time_taken_minutes,
            rules: ["number", "positive", "max:1440"], // máximo 24 horas
        },
    ]);
    // Se a validação base falhou, retornar os erros
    if (!baseValidation.isValid) {
        return baseValidation;
    }
    // Validação específica para answers (deve ser um objeto)
    if (results.answers && typeof results.answers !== 'object') {
        return {
            isValid: false,
            errors: ["Answers deve ser um objeto com as respostas"]
        };
    }
    // Validação adicional: score não pode ser maior que total
    if (results.score > results.total) {
        return {
            isValid: false,
            errors: ["Score não pode ser maior que o total de questões"]
        };
    }
    // Validação de data completed_at se fornecida
    if (results.completed_at) {
        const dateValidation = validator.validateFields([
            {
                field: "Data de conclusão",
                value: results.completed_at,
                rules: ["date"],
            },
        ]);
        if (!dateValidation.isValid) {
            return dateValidation;
        }
    }
    // Calcular percentage se não fornecida mas temos score e total
    if (results.percentage === undefined && results.total > 0) {
        results.percentage = Math.round((results.score / results.total) * 100);
    }
    return baseValidation;
}
/**
 * Função utilitária para validar dados de forma simples
 */
function validateData(data, validationFunction) {
    const result = validationFunction(data);
    if (!result.isValid) {
        throw new Error(`Dados inválidos: ${result.errors.join(", ")}`);
    }
}
/**
 * Função para sanitizar strings (remover espaços extras, etc.)
 */
function sanitizeString(value) {
    if (typeof value !== "string")
        return "";
    return value.trim().replace(/\s+/g, " ");
}
/**
 * Função para sanitizar arrays (remover valores vazios)
 */
function sanitizeArray(value) {
    if (!Array.isArray(value))
        return [];
    return value.filter((item) => item !== null && item !== undefined && item !== "");
}
/**
 * Função para sanitizar números
 */
function sanitizeNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
}
/**
 * Função para sanitizar datas
 */
function sanitizeDate(value) {
    if (!value)
        return null;
    // Se já está no formato ISO
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.split("T")[0]; // Remove a parte do tempo se houver
    }
    // Se está no formato brasileiro DD/MM/YYYY
    if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    // Tentar converter Date para string ISO
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }
    return null;
}
exports.default = DataValidator;
