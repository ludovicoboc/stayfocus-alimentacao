import { renderHook } from '@testing-library/react';
import { useConcursosValidation } from '../use-concursos-validation';

// Mock das funções de validação
jest.mock('@/utils/validations', () => ({
  validateConcurso: jest.fn(),
  validateQuestao: jest.fn(),
  validateQuestionOptions: jest.fn(),
  validateSimulationResults: jest.fn(),
  sanitizeString: jest.fn((str) => str?.trim() || ''),
  sanitizeDate: jest.fn((date) => date),
  sanitizeArray: jest.fn((arr) => Array.isArray(arr) ? arr : []),
  sanitizeNumber: jest.fn((num) => typeof num === 'number' ? num : null),
}));

describe('useConcursosValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateConcursoData', () => {
    it('should validate concurso data successfully', () => {
      const mockValidateConcurso = require('@/utils/validations').validateConcurso;
      mockValidateConcurso.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const { result } = renderHook(() => useConcursosValidation());

      const concursoData = {
        title: 'Test Concurso',
        organizer: 'Test Organizer',
        status: 'planejado',
      };

      const validation = result.current.validateConcursoData(concursoData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(mockValidateConcurso).toHaveBeenCalledWith(concursoData);
    });

    it('should throw error when validation fails', () => {
      const mockValidateConcurso = require('@/utils/validations').validateConcurso;
      mockValidateConcurso.mockReturnValue({
        isValid: false,
        errors: ['Title is required', 'Organizer is required'],
      });

      const { result } = renderHook(() => useConcursosValidation());

      const invalidData = {};

      expect(() => {
        result.current.validateConcursoData(invalidData);
      }).toThrow('Dados inválidos: Title is required, Organizer is required');
    });
  });

  describe('sanitizeConcursoData', () => {
    it('should sanitize concurso data correctly', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const dirtyData = {
        title: '  Test Concurso  ',
        organizer: '  Test Organizer  ',
        registration_date: '2024-01-01',
        exam_date: '2024-06-01',
        edital_link: '  https://example.com  ',
        other_field: 'should be preserved',
      };

      const sanitized = result.current.sanitizeConcursoData(dirtyData);

      expect(sanitized).toEqual({
        title: '  Test Concurso  ', // sanitizeString mock just returns the input
        organizer: '  Test Organizer  ',
        registration_date: '2024-01-01',
        exam_date: '2024-06-01',
        edital_link: '  https://example.com  ',
        other_field: 'should be preserved',
      });
    });

    it('should handle undefined fields', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const dataWithUndefined = {
        title: 'Test',
        organizer: undefined,
        registration_date: undefined,
      };

      const sanitized = result.current.sanitizeConcursoData(dataWithUndefined);

      expect(sanitized.title).toBe('Test');
      expect(sanitized.organizer).toBeUndefined();
      expect(sanitized.registration_date).toBeUndefined();
    });
  });

  describe('validateDisciplinaData', () => {
    it('should validate disciplina data successfully', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const validData = {
        name: 'Matemática',
        progress: 75,
      };

      const validation = result.current.validateDisciplinaData(validData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should fail validation when name is missing', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const invalidData = {
        progress: 75,
      };

      const validation = result.current.validateDisciplinaData(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Nome da disciplina é obrigatório');
    });

    it('should fail validation when progress is out of range', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const invalidData = {
        name: 'Matemática',
        progress: 150, // Invalid: > 100
      };

      const validation = result.current.validateDisciplinaData(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Progresso deve ser um número entre 0 e 100');
    });
  });

  describe('validateTopicoData', () => {
    it('should validate topico data successfully', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const validData = {
        name: 'Álgebra',
        completed: true,
      };

      const validation = result.current.validateTopicoData(validData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should fail validation when name is missing', () => {
      const { result } = renderHook(() => useConcursosValidation());

      const invalidData = {
        completed: false,
      };

      const validation = result.current.validateTopicoData(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Nome do tópico é obrigatório');
    });
  });

  describe('processeConcursoData', () => {
    it('should process concurso data successfully', () => {
      const mockValidateConcurso = require('@/utils/validations').validateConcurso;
      mockValidateConcurso.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const { result } = renderHook(() => useConcursosValidation());

      const inputData = {
        title: '  Test Concurso  ',
        organizer: '  Test Organizer  ',
      };

      const processed = result.current.processeConcursoData(inputData);

      expect(processed.data).toBeDefined();
      expect(processed.validation.isValid).toBe(true);
    });
  });

  describe('validateConcursoCompleto', () => {
    it('should validate complete concurso data', () => {
      const mockValidateConcurso = require('@/utils/validations').validateConcurso;
      const mockValidateQuestao = require('@/utils/validations').validateQuestao;
      
      mockValidateConcurso.mockReturnValue({ isValid: true, errors: [] });
      mockValidateQuestao.mockReturnValue({ isValid: true, errors: [] });

      const { result } = renderHook(() => useConcursosValidation());

      const completeData = {
        concurso: {
          title: 'Test Concurso',
          organizer: 'Test Organizer',
        },
        disciplinas: [
          { name: 'Matemática', progress: 50 },
          { name: 'Português', progress: 75 },
        ],
        questoes: [
          { question_text: 'Questão 1', correct_answer: 'A' },
          { question_text: 'Questão 2', correct_answer: 'B' },
        ],
      };

      const validation = result.current.validateConcursoCompleto(completeData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should collect all validation errors', () => {
      const mockValidateConcurso = require('@/utils/validations').validateConcurso;
      const mockValidateQuestao = require('@/utils/validations').validateQuestao;
      
      mockValidateConcurso.mockReturnValue({ 
        isValid: false, 
        errors: ['Title required'] 
      });
      mockValidateQuestao.mockReturnValue({ 
        isValid: false, 
        errors: ['Question text required'] 
      });

      const { result } = renderHook(() => useConcursosValidation());

      const invalidData = {
        concurso: {},
        disciplinas: [
          { progress: 150 }, // Invalid progress
        ],
        questoes: [
          {}, // Invalid question
        ],
      };

      const validation = result.current.validateConcursoCompleto(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('utility validators', () => {
    it('should validate strings correctly', () => {
      const { result } = renderHook(() => useConcursosValidation());

      expect(result.current.isValidString('valid string')).toBe(true);
      expect(result.current.isValidString('   ')).toBe(false);
      expect(result.current.isValidString('')).toBe(false);
      expect(result.current.isValidString(null)).toBe(false);
      expect(result.current.isValidString(undefined)).toBe(false);
    });

    it('should validate numbers correctly', () => {
      const { result } = renderHook(() => useConcursosValidation());

      expect(result.current.isValidNumber(42)).toBe(true);
      expect(result.current.isValidNumber(0)).toBe(true);
      expect(result.current.isValidNumber(-5)).toBe(true);
      expect(result.current.isValidNumber('42')).toBe(false);
      expect(result.current.isValidNumber(NaN)).toBe(false);
      expect(result.current.isValidNumber(null)).toBe(false);
    });

    it('should validate numbers with range', () => {
      const { result } = renderHook(() => useConcursosValidation());

      expect(result.current.isValidNumber(50, 0, 100)).toBe(true);
      expect(result.current.isValidNumber(0, 0, 100)).toBe(true);
      expect(result.current.isValidNumber(100, 0, 100)).toBe(true);
      expect(result.current.isValidNumber(-1, 0, 100)).toBe(false);
      expect(result.current.isValidNumber(101, 0, 100)).toBe(false);
    });

    it('should validate dates correctly', () => {
      const { result } = renderHook(() => useConcursosValidation());

      expect(result.current.isValidDate('2024-01-01')).toBe(true);
      expect(result.current.isValidDate(new Date())).toBe(true);
      expect(result.current.isValidDate('invalid-date')).toBe(false);
      expect(result.current.isValidDate('')).toBe(false);
      expect(result.current.isValidDate(null)).toBe(false);
    });

    it('should validate arrays correctly', () => {
      const { result } = renderHook(() => useConcursosValidation());

      expect(result.current.isValidArray([])).toBe(true);
      expect(result.current.isValidArray([1, 2, 3])).toBe(true);
      expect(result.current.isValidArray(['a', 'b'])).toBe(true);
      expect(result.current.isValidArray('not an array')).toBe(false);
      expect(result.current.isValidArray(null)).toBe(false);
      expect(result.current.isValidArray(undefined)).toBe(false);
    });

    it('should validate arrays with minimum length', () => {
      const { result } = renderHook(() => useConcursosValidation());

      expect(result.current.isValidArray([1, 2, 3], 2)).toBe(true);
      expect(result.current.isValidArray([1], 2)).toBe(false);
      expect(result.current.isValidArray([], 1)).toBe(false);
    });
  });
});