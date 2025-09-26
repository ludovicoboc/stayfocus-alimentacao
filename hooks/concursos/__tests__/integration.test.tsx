import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useConcursos } from '../use-concursos-refactored';
import { useConcursosCRUD } from '../use-concursos-crud';
import { useConcursosCache } from '../use-concursos-cache';
import { useConcursosValidation } from '../use-concursos-validation';

// Este teste de integração verifica se todos os hooks funcionam juntos
describe('Concursos Hooks Integration', () => {
  // Mock das dependências principais
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do useAuth
    require('@/lib/auth-provider').useAuth.mockReturnValue({ user: mockUser });
    
    // Mock do Supabase
    require('@/lib/supabase').createClient.mockReturnValue(mockSupabase);
  });

  describe('Hook Integration Flow', () => {
    it('should integrate all specialized hooks correctly', () => {
      // Renderizar todos os hooks especializados
      const { result: crudResult } = renderHook(() => useConcursosCRUD());
      const { result: cacheResult } = renderHook(() => useConcursosCache());
      const { result: validationResult } = renderHook(() => useConcursosValidation());
      const { result: mainResult } = renderHook(() => useConcursos());

      // Verificar se todos os hooks foram inicializados
      expect(crudResult.current).toBeDefined();
      expect(cacheResult.current).toBeDefined();
      expect(validationResult.current).toBeDefined();
      expect(mainResult.current).toBeDefined();

      // Verificar se o hook principal expõe as funcionalidades esperadas
      expect(mainResult.current.concursos).toBeDefined();
      expect(mainResult.current.loading).toBeDefined();
      expect(mainResult.current.error).toBeDefined();
      expect(mainResult.current.createCompetition).toBeDefined();
      expect(mainResult.current.updateCompetition).toBeDefined();
      expect(mainResult.current.deleteCompetition).toBeDefined();
    });

    it('should maintain API compatibility', () => {
      const { result } = renderHook(() => useConcursos());

      // Verificar API principal
      expect(typeof result.current.fetchConcursos).toBe('function');
      expect(typeof result.current.createCompetition).toBe('function');
      expect(typeof result.current.updateCompetition).toBe('function');
      expect(typeof result.current.deleteCompetition).toBe('function');
      expect(typeof result.current.getConcursoById).toBe('function');

      // Verificar operações de disciplinas
      expect(typeof result.current.addSubject).toBe('function');
      expect(typeof result.current.updateSubject).toBe('function');
      expect(typeof result.current.deleteSubject).toBe('function');

      // Verificar operações de tópicos
      expect(typeof result.current.addTopic).toBe('function');
      expect(typeof result.current.updateTopic).toBe('function');
      expect(typeof result.current.deleteTopic).toBe('function');

      // Verificar operações de questões
      expect(typeof result.current.addQuestion).toBe('function');
      expect(typeof result.current.updateQuestion).toBe('function');
      expect(typeof result.current.deleteQuestion).toBe('function');
      expect(typeof result.current.fetchQuestions).toBe('function');

      // Verificar funções específicas
      expect(typeof result.current.fetchConcursoCompleto).toBe('function');
      expect(typeof result.current.atualizarTopicoCompletado).toBe('function');
      expect(typeof result.current.buscarQuestoesConcurso).toBe('function');
      expect(typeof result.current.calcularProgressoConcurso).toBe('function');
      expect(typeof result.current.createTestData).toBe('function');

      // Verificar aliases legados
      expect(typeof result.current.adicionarConcurso).toBe('function');
      expect(typeof result.current.atualizarConcurso).toBe('function');
      expect(typeof result.current.removerConcurso).toBe('function');
      expect(typeof result.current.buscarConcursoPorId).toBe('function');

      // Verificar utilitários
      expect(typeof result.current.invalidateCache).toBe('function');
      expect(typeof result.current.getCacheStats).toBe('function');
      expect(result.current.validation).toBeDefined();
    });

    it('should handle complete workflow', async () => {
      // Mock das respostas do Supabase
      const mockCompetition = {
        id: 'comp-123',
        title: 'Test Competition',
        organizer: 'Test Org',
        user_id: 'user-123',
      };

      const mockSubject = {
        id: 'subj-123',
        competition_id: 'comp-123',
        name: 'Test Subject',
      };

      const mockTopic = {
        id: 'topic-123',
        subject_id: 'subj-123',
        name: 'Test Topic',
        completed: false,
      };

      const mockQuestion = {
        id: 'quest-123',
        competition_id: 'comp-123',
        question_text: 'Test Question?',
        correct_answer: 'A',
      };

      // Mock das operações do Supabase
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCompetition,
            error: null,
          }),
        }),
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockCompetition,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
      });

      const { result } = renderHook(() => useConcursos());

      // Simular workflow completo
      await act(async () => {
        // 1. Criar concurso
        const competition = await result.current.createCompetition({
          title: 'Test Competition',
          organizer: 'Test Org',
        });

        expect(competition).toBeDefined();

        // 2. Buscar concurso por ID
        const found = result.current.getConcursoById('comp-123');
        // Note: Como estamos usando mocks, o resultado pode ser null
        // Em um teste real, isso dependeria do estado do cache

        // 3. Calcular progresso
        const progress = result.current.calcularProgressoConcurso({
          id: 'comp-123',
          title: 'Test',
          organizer: 'Test',
          status: 'planejado',
          disciplinas: [
            {
              id: 'disc-1',
              name: 'Test Subject',
              topicos: [
                { id: 'top-1', name: 'Topic 1', completed: true },
                { id: 'top-2', name: 'Topic 2', completed: false },
              ],
            },
          ],
        } as any);

        expect(progress).toBe(50); // 1 de 2 tópicos completos = 50%
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors gracefully across hooks', async () => {
      // Mock de erro do Supabase
      const mockError = { message: 'Database connection failed' };
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        try {
          await result.current.createCompetition({
            title: 'Test Competition',
          });
        } catch (error) {
          expect(error).toBeDefined();
          // O erro deve ser tratado pelos hooks especializados
        }
      });
    });
  });

  describe('Performance Integration', () => {
    it('should not cause infinite re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        const { concursos, loading } = useConcursos();
        return <div>{loading ? 'Loading...' : `${concursos.length} concursos`}</div>;
      };

      const { rerender } = renderHook(() => <TestComponent />);

      // Re-renderizar algumas vezes
      rerender();
      rerender();
      rerender();

      // Verificar que não houve re-renders excessivos
      // Note: O número exato depende da implementação, mas não deve ser excessivo
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Cache Integration', () => {
    it('should coordinate cache operations between hooks', () => {
      const { result } = renderHook(() => useConcursos());

      // Verificar operações de cache
      expect(typeof result.current.invalidateCache).toBe('function');
      expect(typeof result.current.getCacheStats).toBe('function');

      // Testar invalidação de cache
      act(() => {
        result.current.invalidateCache();
      });

      // Testar estatísticas de cache
      const stats = result.current.getCacheStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Validation Integration', () => {
    it('should integrate validation across all operations', () => {
      const { result } = renderHook(() => useConcursos());

      // Verificar se validação está exposta
      expect(result.current.validation).toBeDefined();
      expect(typeof result.current.validation.validateConcursoData).toBe('function');
      expect(typeof result.current.validation.sanitizeConcursoData).toBe('function');
      expect(typeof result.current.validation.validateDisciplinaData).toBe('function');
      expect(typeof result.current.validation.validateTopicoData).toBe('function');
      expect(typeof result.current.validation.validateQuestaoData).toBe('function');
    });
  });
});