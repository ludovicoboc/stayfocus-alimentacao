import { renderHook, act } from '@testing-library/react';
import { useConcursos } from '../use-concursos-refactored';

// Mock dos hooks especializados
jest.mock('../use-concursos-crud');
jest.mock('../use-concursos-cache');
jest.mock('../use-concursos-validation');

const mockUseConcursosCRUD = require('../use-concursos-crud').useConcursosCRUD;
const mockUseConcursosCache = require('../use-concursos-cache').useConcursosCache;
const mockUseConcursosValidation = require('../use-concursos-validation').useConcursosValidation;

describe('useConcursos (Refactored)', () => {
  const mockConcursos = [
    {
      id: 'comp-1',
      title: 'Concurso 1',
      organizer: 'Org 1',
      disciplinas: [
        {
          id: 'disc-1',
          name: 'Matemática',
          topicos: [
            { id: 'top-1', name: 'Álgebra', completed: true },
            { id: 'top-2', name: 'Geometria', completed: false },
          ],
        },
      ],
    },
    {
      id: 'comp-2',
      title: 'Concurso 2',
      organizer: 'Org 2',
      disciplinas: [],
    },
  ];

  const mockCRUD = {
    createCompetition: jest.fn(),
    updateCompetition: jest.fn(),
    deleteCompetition: jest.fn(),
    addSubject: jest.fn(),
    updateSubject: jest.fn(),
    deleteSubject: jest.fn(),
    addTopic: jest.fn(),
    updateTopic: jest.fn(),
    deleteTopic: jest.fn(),
    addQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    deleteQuestion: jest.fn(),
    fetchQuestions: jest.fn(),
  };

  const mockCache = {
    concursos: mockConcursos,
    loading: false,
    error: null,
    fetchConcursos: jest.fn(),
    getConcursoById: jest.fn(),
    addToCache: jest.fn(),
    updateInCache: jest.fn(),
    removeFromCache: jest.fn(),
    invalidateCache: jest.fn(),
    getCacheStats: jest.fn(),
  };

  const mockValidation = {
    processeConcursoData: jest.fn(),
    processDisciplinaData: jest.fn(),
    processTopicoData: jest.fn(),
    processQuestaoData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseConcursosCRUD.mockReturnValue(mockCRUD);
    mockUseConcursosCache.mockReturnValue(mockCache);
    mockUseConcursosValidation.mockReturnValue(mockValidation);
  });

  describe('basic functionality', () => {
    it('should return state from cache hook', () => {
      const { result } = renderHook(() => useConcursos());

      expect(result.current.concursos).toEqual(mockConcursos);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should call fetchConcursos on mount', () => {
      renderHook(() => useConcursos());

      expect(mockCache.fetchConcursos).toHaveBeenCalled();
    });
  });

  describe('competition operations', () => {
    it('should create competition with validation', async () => {
      const newCompetition = {
        id: 'comp-new',
        title: 'New Competition',
        organizer: 'New Org',
      };

      mockValidation.processeConcursoData.mockReturnValue({
        data: { title: 'New Competition', organizer: 'New Org' },
        validation: { isValid: true, errors: [] },
      });

      mockCRUD.createCompetition.mockResolvedValue(newCompetition);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const created = await result.current.createCompetition({
          title: 'New Competition',
          organizer: 'New Org',
        });

        expect(created).toEqual(newCompetition);
      });

      expect(mockValidation.processeConcursoData).toHaveBeenCalled();
      expect(mockCRUD.createCompetition).toHaveBeenCalled();
      expect(mockCache.addToCache).toHaveBeenCalledWith(newCompetition);
    });

    it('should update competition with validation', async () => {
      const updatedCompetition = {
        id: 'comp-1',
        title: 'Updated Competition',
        organizer: 'Updated Org',
      };

      mockValidation.processeConcursoData.mockReturnValue({
        data: { title: 'Updated Competition' },
        validation: { isValid: true, errors: [] },
      });

      mockCRUD.updateCompetition.mockResolvedValue(updatedCompetition);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const updated = await result.current.updateCompetition('comp-1', {
          title: 'Updated Competition',
        });

        expect(updated).toEqual(updatedCompetition);
      });

      expect(mockValidation.processeConcursoData).toHaveBeenCalled();
      expect(mockCRUD.updateCompetition).toHaveBeenCalledWith('comp-1', {
        title: 'Updated Competition',
      });
      expect(mockCache.updateInCache).toHaveBeenCalledWith('comp-1', updatedCompetition);
    });

    it('should delete competition', async () => {
      mockCRUD.deleteCompetition.mockResolvedValue(true);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const deleted = await result.current.deleteCompetition('comp-1');
        expect(deleted).toBe(true);
      });

      expect(mockCRUD.deleteCompetition).toHaveBeenCalledWith('comp-1');
      expect(mockCache.removeFromCache).toHaveBeenCalledWith('comp-1');
    });
  });

  describe('subject operations', () => {
    it('should add subject with validation and cache refresh', async () => {
      const newSubject = {
        id: 'subj-new',
        competition_id: 'comp-1',
        name: 'New Subject',
      };

      mockValidation.processDisciplinaData.mockReturnValue({
        data: { name: 'New Subject' },
        validation: { isValid: true, errors: [] },
      });

      mockCRUD.addSubject.mockResolvedValue(newSubject);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const added = await result.current.addSubject('comp-1', {
          name: 'New Subject',
        });

        expect(added).toEqual(newSubject);
      });

      expect(mockValidation.processDisciplinaData).toHaveBeenCalled();
      expect(mockCRUD.addSubject).toHaveBeenCalledWith('comp-1', { name: 'New Subject' });
      expect(mockCache.invalidateCache).toHaveBeenCalled();
      expect(mockCache.fetchConcursos).toHaveBeenCalled();
    });
  });

  describe('question operations', () => {
    it('should add question with validation and cache refresh', async () => {
      const newQuestion = {
        id: 'quest-new',
        competition_id: 'comp-1',
        question_text: 'New Question?',
      };

      mockValidation.processQuestaoData.mockReturnValue({
        data: { question_text: 'New Question?' },
        validation: { isValid: true, errors: [] },
      });

      mockCRUD.addQuestion.mockResolvedValue(newQuestion);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const added = await result.current.addQuestion('comp-1', {
          question_text: 'New Question?',
        });

        expect(added).toEqual(newQuestion);
      });

      expect(mockValidation.processQuestaoData).toHaveBeenCalled();
      expect(mockCRUD.addQuestion).toHaveBeenCalledWith('comp-1', { question_text: 'New Question?' });
      expect(mockCache.invalidateCache).toHaveBeenCalled();
      expect(mockCache.fetchConcursos).toHaveBeenCalled();
    });

    it('should fetch questions', async () => {
      const questions = [
        { id: 'q1', question_text: 'Question 1' },
        { id: 'q2', question_text: 'Question 2' },
      ];

      mockCRUD.fetchQuestions.mockResolvedValue(questions);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const fetched = await result.current.fetchQuestions('comp-1');
        expect(fetched).toEqual(questions);
      });

      expect(mockCRUD.fetchQuestions).toHaveBeenCalledWith('comp-1');
    });
  });

  describe('utility functions', () => {
    it('should get concurso by id', () => {
      mockCache.getConcursoById.mockReturnValue(mockConcursos[0]);

      const { result } = renderHook(() => useConcursos());

      const concurso = result.current.getConcursoById('comp-1');
      expect(concurso).toEqual(mockConcursos[0]);
      expect(mockCache.getConcursoById).toHaveBeenCalledWith('comp-1');
    });

    it('should invalidate cache', () => {
      const { result } = renderHook(() => useConcursos());

      result.current.invalidateCache();
      expect(mockCache.invalidateCache).toHaveBeenCalled();
    });

    it('should get cache stats', () => {
      const mockStats = {
        size: 2,
        keys: ['comp-1', 'comp-2'],
        isValid: true,
        lastUpdate: Date.now(),
      };

      mockCache.getCacheStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useConcursos());

      const stats = result.current.getCacheStats();
      expect(stats).toEqual(mockStats);
      expect(mockCache.getCacheStats).toHaveBeenCalled();
    });
  });

  describe('specific functions', () => {
    it('should fetch concurso completo', async () => {
      mockCache.getConcursoById.mockReturnValue(mockConcursos[0]);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const concurso = await result.current.fetchConcursoCompleto('comp-1');
        expect(concurso).toEqual(mockConcursos[0]);
      });

      expect(mockCache.getConcursoById).toHaveBeenCalledWith('comp-1');
    });

    it('should fetch concurso completo from server when not in cache', async () => {
      mockCache.getConcursoById
        .mockReturnValueOnce(null) // First call returns null
        .mockReturnValueOnce(mockConcursos[0]); // Second call returns the concurso

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const concurso = await result.current.fetchConcursoCompleto('comp-1');
        expect(concurso).toEqual(mockConcursos[0]);
      });

      expect(mockCache.fetchConcursos).toHaveBeenCalled();
      expect(mockCache.getConcursoById).toHaveBeenCalledTimes(2);
    });

    it('should calculate concurso progress', () => {
      const { result } = renderHook(() => useConcursos());

      const progress = result.current.calcularProgressoConcurso(mockConcursos[0]);
      
      // Concurso 1 has 1 disciplina with 2 tópicos, 1 completed = 50%
      expect(progress).toBe(50);
    });

    it('should return 0 progress for concurso without disciplinas', () => {
      const { result } = renderHook(() => useConcursos());

      const progress = result.current.calcularProgressoConcurso(mockConcursos[1]);
      expect(progress).toBe(0);
    });

    it('should create test data', async () => {
      const testConcurso = {
        id: 'test-comp',
        title: 'Concurso de Teste',
        organizer: 'Organizadora Teste',
      };

      mockCRUD.createCompetition.mockResolvedValue(testConcurso);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const created = await result.current.createTestData();
        expect(created).toEqual(testConcurso);
      });

      expect(mockCRUD.createCompetition).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Concurso de Teste',
          organizer: 'Organizadora Teste',
          status: 'planejado',
        })
      );
    });

    it('should create test data with custom id', async () => {
      const testConcurso = {
        id: 'test-comp-123',
        title: 'Concurso de Teste 123',
        organizer: 'Organizadora Teste',
      };

      mockCRUD.createCompetition.mockResolvedValue(testConcurso);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const created = await result.current.createTestData('123');
        expect(created).toEqual(testConcurso);
      });

      expect(mockCRUD.createCompetition).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Concurso de Teste 123',
        })
      );
    });
  });

  describe('legacy compatibility functions', () => {
    it('should support adicionarConcurso alias', async () => {
      const newCompetition = {
        id: 'comp-new',
        title: 'New Competition',
      };

      mockValidation.processeConcursoData.mockReturnValue({
        data: { title: 'New Competition' },
        validation: { isValid: true, errors: [] },
      });

      mockCRUD.createCompetition.mockResolvedValue(newCompetition);

      const { result } = renderHook(() => useConcursos());

      await act(async () => {
        const created = await result.current.adicionarConcurso({
          title: 'New Competition',
        });

        expect(created).toEqual(newCompetition);
      });

      expect(mockCRUD.createCompetition).toHaveBeenCalled();
    });

    it('should support buscarConcursoPorId alias', () => {
      mockCache.getConcursoById.mockReturnValue(mockConcursos[0]);

      const { result } = renderHook(() => useConcursos());

      const concurso = result.current.buscarConcursoPorId('comp-1');
      expect(concurso).toEqual(mockConcursos[0]);
    });
  });
});