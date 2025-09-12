import {
  validateConcurso,
  validateQuestao,
  validateQuestionOptions,
  validateSimulationResults,
  sanitizeString,
  sanitizeNumber,
  sanitizeDate,
  sanitizeArray,
  isString,
  isNumber,
  isValidDate,
  isValidEmail,
  isValidUrl,
  isNonEmptyString,
  isPositiveNumber,
  isInRange,
  type ConcursoInput,
  type QuestaoInput,
  type QuestionOptionsInput,
  type SimulationResultsInput
} from '../validations-typed';

describe('SUP-4: Validações Tipadas', () => {
  
  describe('Type Guards', () => {
    describe('isString', () => {
      it('should return true for strings', () => {
        expect(isString('hello')).toBe(true);
        expect(isString('')).toBe(true);
        expect(isString('123')).toBe(true);
      });

      it('should return false for non-strings', () => {
        expect(isString(123)).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString({})).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should return true for valid numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-456)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
      });

      it('should return false for invalid numbers', () => {
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber('123')).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
      });
    });

    describe('isValidDate', () => {
      it('should return true for valid dates', () => {
        expect(isValidDate('2024-01-01')).toBe(true);
        expect(isValidDate(new Date())).toBe(true);
        expect(isValidDate('2024-12-31T23:59:59Z')).toBe(true);
      });

      it('should return false for invalid dates', () => {
        expect(isValidDate('invalid-date')).toBe(false);
        expect(isValidDate('2024-13-01')).toBe(false);
        expect(isValidDate(123)).toBe(false);
        expect(isValidDate(null)).toBe(false);
      });
    });

    describe('isValidEmail', () => {
      it('should return true for valid emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(isValidEmail('test+tag@example.org')).toBe(true);
      });

      it('should return false for invalid emails', () => {
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail(123)).toBe(false);
      });
    });

    describe('isValidUrl', () => {
      it('should return true for valid URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
        expect(isValidUrl('http://localhost:3000')).toBe(true);
        expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true);
      });

      it('should return false for invalid URLs', () => {
        expect(isValidUrl('not-a-url')).toBe(false);
        expect(isValidUrl('ftp://invalid')).toBe(false);
        expect(isValidUrl(123)).toBe(false);
      });
    });

    describe('isNonEmptyString', () => {
      it('should return true for non-empty strings', () => {
        expect(isNonEmptyString('hello')).toBe(true);
        expect(isNonEmptyString('   text   ')).toBe(true);
      });

      it('should return false for empty or non-strings', () => {
        expect(isNonEmptyString('')).toBe(false);
        expect(isNonEmptyString('   ')).toBe(false);
        expect(isNonEmptyString(123)).toBe(false);
        expect(isNonEmptyString(null)).toBe(false);
      });
    });

    describe('isPositiveNumber', () => {
      it('should return true for positive numbers', () => {
        expect(isPositiveNumber(1)).toBe(true);
        expect(isPositiveNumber(3.14)).toBe(true);
        expect(isPositiveNumber(100)).toBe(true);
      });

      it('should return false for non-positive numbers', () => {
        expect(isPositiveNumber(0)).toBe(false);
        expect(isPositiveNumber(-1)).toBe(false);
        expect(isPositiveNumber('5')).toBe(false);
      });
    });

    describe('isInRange', () => {
      it('should return true for numbers in range', () => {
        expect(isInRange(50, 0, 100)).toBe(true);
        expect(isInRange(0, 0, 100)).toBe(true);
        expect(isInRange(100, 0, 100)).toBe(true);
      });

      it('should return false for numbers out of range', () => {
        expect(isInRange(-1, 0, 100)).toBe(false);
        expect(isInRange(101, 0, 100)).toBe(false);
        expect(isInRange('50', 0, 100)).toBe(false);
      });
    });
  });

  describe('Sanitização Tipada', () => {
    describe('sanitizeString', () => {
      it('should sanitize strings correctly', () => {
        expect(sanitizeString('  hello  world  ')).toBe('hello world');
        expect(sanitizeString('normal text')).toBe('normal text');
        expect(sanitizeString('')).toBe('');
      });

      it('should handle non-strings', () => {
        expect(sanitizeString(123)).toBe('');
        expect(sanitizeString(null)).toBe('');
        expect(sanitizeString(undefined)).toBe('');
      });
    });

    describe('sanitizeNumber', () => {
      it('should sanitize numbers correctly', () => {
        expect(sanitizeNumber(123)).toBe(123);
        expect(sanitizeNumber('456')).toBe(456);
        expect(sanitizeNumber('3.14')).toBe(3.14);
      });

      it('should return null for invalid numbers', () => {
        expect(sanitizeNumber('invalid')).toBe(null);
        expect(sanitizeNumber(null)).toBe(null);
        expect(sanitizeNumber({})).toBe(null);
      });
    });

    describe('sanitizeDate', () => {
      it('should sanitize dates correctly', () => {
        expect(sanitizeDate('2024-01-01')).toBe('2024-01-01');
        expect(sanitizeDate('01/01/2024')).toBe('2024-01-01');
        expect(sanitizeDate(new Date('2024-01-01'))).toBe('2024-01-01');
      });

      it('should return null for invalid dates', () => {
        expect(sanitizeDate('invalid')).toBe(null);
        expect(sanitizeDate(null)).toBe(null);
        expect(sanitizeDate(123)).toBe(null);
      });
    });

    describe('sanitizeArray', () => {
      it('should sanitize arrays correctly', () => {
        expect(sanitizeArray([1, 2, 3])).toEqual([1, 2, 3]);
        expect(sanitizeArray(['a', '', 'b', null, 'c'])).toEqual(['a', 'b', 'c']);
      });

      it('should return empty array for non-arrays', () => {
        expect(sanitizeArray('not array')).toEqual([]);
        expect(sanitizeArray(null)).toEqual([]);
        expect(sanitizeArray(123)).toEqual([]);
      });
    });
  });

  describe('validateConcurso', () => {
    it('should validate valid concurso data', () => {
      const validInput: ConcursoInput = {
        title: 'Concurso Teste',
        organizer: 'Organizadora Teste',
        status: 'planejado',
        exam_date: '2024-06-01',
        registration_date: '2024-01-01'
      };

      const result = validateConcurso(validInput);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Concurso Teste');
      expect(result.data?.organizer).toBe('Organizadora Teste');
    });

    it('should reject invalid concurso data', () => {
      const invalidInput: ConcursoInput = {
        title: '', // Empty title
        organizer: null, // Invalid organizer
        status: 'invalid-status', // Invalid status
        exam_date: 'invalid-date' // Invalid date
      };

      const result = validateConcurso(invalidInput);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Título é obrigatório e deve ser uma string não vazia');
      expect(result.errors).toContain('Organizador é obrigatório e deve ser uma string não vazia');
    });

    it('should validate optional fields', () => {
      const minimalInput: ConcursoInput = {
        title: 'Concurso Mínimo',
        organizer: 'Organizadora'
      };

      const result = validateConcurso(minimalInput);

      expect(result.isValid).toBe(true);
      expect(result.data?.title).toBe('Concurso Mínimo');
      expect(result.data?.status).toBe('planejado'); // Default value
    });
  });

  describe('validateQuestao', () => {
    it('should validate valid questao data', () => {
      const validInput: QuestaoInput = {
        question_text: 'Qual é a resposta?',
        options: [
          { text: 'Opção A', isCorrect: true },
          { text: 'Opção B', isCorrect: false }
        ],
        correct_answer: 'A',
        difficulty: 'medio',
        points: 10
      };

      const result = validateQuestao(validInput);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data?.question_text).toBe('Qual é a resposta?');
      expect(result.data?.difficulty).toBe('medio');
      expect(result.data?.points).toBe(10);
    });

    it('should reject invalid questao data', () => {
      const invalidInput: QuestaoInput = {
        question_text: '', // Empty question
        difficulty: 'invalid', // Invalid difficulty
        points: -5, // Negative points
        year: 1800 // Invalid year
      };

      const result = validateQuestao(invalidInput);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Texto da questão é obrigatório');
    });
  });

  describe('validateQuestionOptions', () => {
    it('should validate valid options', () => {
      const validInput: QuestionOptionsInput = {
        options: [
          { text: 'Opção A', isCorrect: true },
          { text: 'Opção B', isCorrect: false },
          { text: 'Opção C', isCorrect: false }
        ]
      };

      const result = validateQuestionOptions(validInput);

      expect(result.isValid).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data?.[0].text).toBe('Opção A');
      expect(result.data?.[0].isCorrect).toBe(true);
    });

    it('should reject invalid options', () => {
      const invalidInput: QuestionOptionsInput = {
        options: [
          { text: 'Opção A', isCorrect: true },
          { text: 'Opção B', isCorrect: true } // Multiple correct answers
        ]
      };

      const result = validateQuestionOptions(invalidInput);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Deve haver apenas uma opção correta');
    });

    it('should require at least 2 options', () => {
      const invalidInput: QuestionOptionsInput = {
        options: [
          { text: 'Única opção', isCorrect: true }
        ]
      };

      const result = validateQuestionOptions(invalidInput);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Deve haver pelo menos 2 opções');
    });
  });

  describe('validateSimulationResults', () => {
    it('should validate valid simulation results', () => {
      const validInput: SimulationResultsInput = {
        score: 8,
        total_questions: 10,
        percentage: 80,
        time_taken_minutes: 30,
        answers: { '1': 'A', '2': 'B' },
        completed_at: '2024-01-01T10:00:00Z'
      };

      const result = validateSimulationResults(validInput);

      expect(result.isValid).toBe(true);
      expect(result.data?.score).toBe(8);
      expect(result.data?.total_questions).toBe(10);
      expect(result.data?.percentage).toBe(80);
    });

    it('should reject invalid simulation results', () => {
      const invalidInput: SimulationResultsInput = {
        score: -1, // Negative score
        total_questions: 0, // Zero questions
        percentage: 150, // Invalid percentage
        answers: 'not an object' // Invalid answers
      };

      const result = validateSimulationResults(invalidInput);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Score deve ser um número não negativo');
      expect(result.errors).toContain('Total de questões deve ser um número positivo');
    });

    it('should calculate percentage when not provided', () => {
      const input: SimulationResultsInput = {
        score: 7,
        total_questions: 10,
        answers: {}
      };

      const result = validateSimulationResults(input);

      expect(result.isValid).toBe(true);
      expect(result.data?.percentage).toBe(70); // Calculated: (7/10) * 100
    });
  });

  describe('Compatibilidade com tipos TypeScript', () => {
    it('should provide proper TypeScript types', () => {
      const concursoInput: ConcursoInput = {
        title: 'Test',
        organizer: 'Test Org'
      };

      const result = validateConcurso(concursoInput);
      
      if (result.isValid && result.data) {
        // TypeScript should infer the correct type here
        const title: string = result.data.title;
        const organizer: string = result.data.organizer;
        
        expect(title).toBe('Test');
        expect(organizer).toBe('Test Org');
      }
    });

    it('should work with type guards', () => {
      const unknownValue: unknown = 'test string';
      
      if (isString(unknownValue)) {
        // TypeScript should know this is a string now
        const length: number = unknownValue.length;
        expect(length).toBe(11);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined inputs', () => {
      expect(validateConcurso(null as any).isValid).toBe(false);
      expect(validateConcurso(undefined as any).isValid).toBe(false);
      expect(validateQuestao({}).isValid).toBe(false);
    });

    it('should handle very long strings', () => {
      const longTitle = 'a'.repeat(300);
      const input: ConcursoInput = {
        title: longTitle,
        organizer: 'Test'
      };

      const result = validateConcurso(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título deve ter no máximo 200 caracteres');
    });

    it('should handle special characters in strings', () => {
      const input: ConcursoInput = {
        title: 'Concurso com ç, ã, é, ü',
        organizer: 'Org & Co.'
      };

      const result = validateConcurso(input);
      expect(result.isValid).toBe(true);
    });
  });
});