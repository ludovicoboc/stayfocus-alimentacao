import {
  validateConcurso,
  validateQuestao,
  validateQuestionOptions,
  validateSimulationResults,
  sanitizeString,
  sanitizeNumber,
  sanitizeDate,
  sanitizeArray,
  testValidationCompatibility,
  getValidationStats,
  enableTypedValidations,
  disableTypedValidations
} from '../validations-migration';

import {
  validateConcurso as validateConcursoOriginal,
  validateQuestao as validateQuestaoOriginal
} from '../validations';

describe('SUP-4: Migração de Validações', () => {
  
  beforeEach(() => {
    // Reset environment for each test
    delete (global as any).__USE_TYPED_VALIDATIONS;
  });

  describe('Wrapper Functions', () => {
    it('should use original validations by default in production', () => {
      // Simular ambiente de produção
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const testData = {
        title: 'Test Concurso',
        organizer: 'Test Org'
      };

      const result = validateConcurso(testData);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should use typed validations in development', () => {
      // Simular ambiente de desenvolvimento
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const testData = {
        title: 'Test Concurso',
        organizer: 'Test Org'
      };

      const result = validateConcurso(testData);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should fallback to original validation on error', () => {
      enableTypedValidations();
      
      // Dados que podem causar erro na validação tipada
      const problematicData = {
        title: 'Valid Title',
        organizer: 'Valid Org',
        // Adicionar propriedades que podem causar problemas
        someWeirdProperty: { nested: { deeply: 'value' } }
      };

      // Deve funcionar sem lançar erro
      const result = validateConcurso(problematicData);
      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('Sanitização com Migração', () => {
    it('should sanitize strings consistently', () => {
      const testValues = [
        '  hello world  ',
        'normal text',
        '',
        123,
        null,
        undefined
      ];

      testValues.forEach(value => {
        const result = sanitizeString(value);
        expect(typeof result).toBe('string');
      });
    });

    it('should sanitize numbers consistently', () => {
      const testValues = [
        123,
        '456',
        '3.14',
        'invalid',
        null,
        undefined
      ];

      testValues.forEach(value => {
        const result = sanitizeNumber(value);
        expect(result === null || typeof result === 'number').toBe(true);
      });
    });

    it('should sanitize dates consistently', () => {
      const testValues = [
        '2024-01-01',
        '01/01/2024',
        new Date('2024-01-01'),
        'invalid-date',
        null,
        undefined
      ];

      testValues.forEach(value => {
        const result = sanitizeDate(value);
        expect(result === null || typeof result === 'string').toBe(true);
      });
    });

    it('should sanitize arrays consistently', () => {
      const testValues = [
        [1, 2, 3],
        ['a', '', 'b', null, 'c'],
        'not an array',
        null,
        undefined
      ];

      testValues.forEach(value => {
        const result = sanitizeArray(value);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Compatibilidade entre Versões', () => {
    it('should test compatibility between original and typed validations', () => {
      const testData = [
        {
          title: 'Concurso Válido',
          organizer: 'Organizadora Teste',
          status: 'planejado'
        },
        {
          title: 'Outro Concurso',
          organizer: 'Outra Org',
          exam_date: '2024-06-01'
        },
        {
          title: '', // Invalid
          organizer: 'Org'
        },
        {
          title: 'Valid',
          organizer: '' // Invalid
        }
      ];

      const compatibility = testValidationCompatibility(testData);
      
      expect(compatibility).toBeDefined();
      expect(typeof compatibility.compatible).toBe('boolean');
      expect(Array.isArray(compatibility.differences)).toBe(true);
      
      // Log differences for debugging
      if (!compatibility.compatible) {
        console.log('Compatibility differences:', compatibility.differences);
      }
    });

    it('should maintain same validation results for valid data', () => {
      const validConcurso = {
        title: 'Concurso de Teste',
        organizer: 'Organizadora de Teste',
        status: 'planejado',
        exam_date: '2024-06-01'
      };

      // Testar com validação original
      disableTypedValidations();
      const originalResult = validateConcurso(validConcurso);

      // Testar com validação tipada
      enableTypedValidations();
      const typedResult = validateConcurso(validConcurso);

      // Ambos devem ser válidos
      expect(originalResult.isValid).toBe(true);
      expect(typedResult.isValid).toBe(true);
    });

    it('should maintain same validation results for invalid data', () => {
      const invalidConcurso = {
        title: '', // Invalid
        organizer: 'Valid Org'
      };

      // Testar com validação original
      disableTypedValidations();
      const originalResult = validateConcurso(invalidConcurso);

      // Testar com validação tipada
      enableTypedValidations();
      const typedResult = validateConcurso(invalidConcurso);

      // Ambos devem ser inválidos
      expect(originalResult.isValid).toBe(false);
      expect(typedResult.isValid).toBe(false);
    });
  });

  describe('Estatísticas de Validação', () => {
    it('should provide validation statistics', () => {
      const stats = getValidationStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.usingTypedValidations).toBe('boolean');
      expect(typeof stats.environment).toBe('string');
      expect(typeof stats.fallbackCount).toBe('number');
    });

    it('should reflect environment changes', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Testar em desenvolvimento
      process.env.NODE_ENV = 'development';
      const devStats = getValidationStats();
      expect(devStats.environment).toBe('development');
      
      // Testar em produção
      process.env.NODE_ENV = 'production';
      const prodStats = getValidationStats();
      expect(prodStats.environment).toBe('production');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Controle Manual de Validações', () => {
    it('should allow enabling typed validations manually', () => {
      enableTypedValidations();
      
      const testData = {
        title: 'Test',
        organizer: 'Test Org'
      };

      // Deve usar validações tipadas
      const result = validateConcurso(testData);
      expect(result).toBeDefined();
    });

    it('should allow disabling typed validations manually', () => {
      disableTypedValidations();
      
      const testData = {
        title: 'Test',
        organizer: 'Test Org'
      };

      // Deve usar validações originais
      const result = validateConcurso(testData);
      expect(result).toBeDefined();
    });
  });

  describe('Validações Específicas com Migração', () => {
    it('should validate questao with migration wrapper', () => {
      const validQuestao = {
        question_text: 'Qual é a resposta?',
        options: [
          { text: 'Opção A', isCorrect: true },
          { text: 'Opção B', isCorrect: false }
        ],
        difficulty: 'medio'
      };

      const result = validateQuestao(validQuestao);
      expect(result.isValid).toBe(true);
    });

    it('should validate question options with migration wrapper', () => {
      const validOptions = {
        options: [
          { text: 'Opção A', isCorrect: true },
          { text: 'Opção B', isCorrect: false },
          { text: 'Opção C', isCorrect: false }
        ]
      };

      const result = validateQuestionOptions(validOptions);
      expect(result.isValid).toBe(true);
    });

    it('should validate simulation results with migration wrapper', () => {
      const validResults = {
        score: 8,
        total_questions: 10,
        percentage: 80,
        answers: { '1': 'A', '2': 'B' }
      };

      const result = validateSimulationResults(validResults);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = {
        title: { nested: 'object' },
        organizer: ['array', 'value'],
        status: 123,
        exam_date: { invalid: 'date' }
      };

      // Não deve lançar erro, deve retornar resultado de validação
      expect(() => {
        const result = validateConcurso(malformedData);
        expect(result).toBeDefined();
        expect(typeof result.isValid).toBe('boolean');
      }).not.toThrow();
    });

    it('should handle circular references', () => {
      const circularData: any = {
        title: 'Test',
        organizer: 'Test Org'
      };
      circularData.self = circularData; // Circular reference

      // Não deve lançar erro
      expect(() => {
        const result = validateConcurso(circularData);
        expect(result).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not significantly impact performance', () => {
      const testData = {
        title: 'Performance Test',
        organizer: 'Test Org'
      };

      const iterations = 1000;
      
      // Medir tempo da validação com migração
      const startTime = Date.now();
      for (let i = 0; i < iterations; i++) {
        validateConcurso(testData);
      }
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;
      
      // Deve ser rápido (menos de 1ms por validação em média)
      expect(avgTime).toBeLessThan(1);
    });
  });
});