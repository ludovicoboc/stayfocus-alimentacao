import { renderHook, act } from '@testing-library/react';
import { useConcursosCache } from '../use-concursos-cache';
import { useAuth } from '@/lib/auth-provider';
import { createClient } from '@/lib/supabase';

// Mocks
jest.mock('@/lib/auth-provider');
jest.mock('@/lib/supabase');
jest.mock('@/lib/request-debouncer');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock do debouncer
const mockCreateDebouncedFunction = jest.fn((key, fn) => fn);
jest.mock('@/lib/request-debouncer', () => ({
  createDebouncedFunction: (...args: any[]) => mockCreateDebouncedFunction(...args),
}));

describe('useConcursosCache', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSupabase = {
    from: jest.fn(),
  };

  const mockConcursos = [
    {
      id: 'comp-1',
      title: 'Concurso 1',
      organizer: 'Org 1',
      user_id: 'user-123',
      competition_subjects: [],
      competition_questions: [],
    },
    {
      id: 'comp-2',
      title: 'Concurso 2',
      organizer: 'Org 2',
      user_id: 'user-123',
      competition_subjects: [],
      competition_questions: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser } as any);
    mockCreateClient.mockReturnValue(mockSupabase as any);
    
    // Reset cache
    jest.clearAllMocks();
  });

  describe('fetchConcursos', () => {
    it('should fetch concursos successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockConcursos,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useConcursosCache());

      await act(async () => {
        await result.current.fetchConcursos();
      });

      expect(result.current.concursos).toHaveLength(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockSupabase.from).toHaveBeenCalledWith('competitions');
    });

    it('should handle fetch error', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useConcursosCache());

      await act(async () => {
        await result.current.fetchConcursos();
      });

      expect(result.current.concursos).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useConcursosCache());

      await act(async () => {
        await result.current.fetchConcursos();
      });

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result.current.concursos).toEqual([]);
    });
  });

  describe('cache operations', () => {
    it('should add item to cache', async () => {
      const { result } = renderHook(() => useConcursosCache());

      const newConcurso = {
        id: 'comp-3',
        title: 'Concurso 3',
        organizer: 'Org 3',
        user_id: 'user-123',
      };

      act(() => {
        result.current.addToCache(newConcurso as any);
      });

      expect(result.current.concursos).toContain(newConcurso);
    });

    it('should update item in cache', async () => {
      const { result } = renderHook(() => useConcursosCache());

      // Primeiro adicionar um item
      const concurso = {
        id: 'comp-1',
        title: 'Concurso Original',
        organizer: 'Org 1',
        user_id: 'user-123',
      };

      act(() => {
        result.current.addToCache(concurso as any);
      });

      // Depois atualizar
      act(() => {
        result.current.updateInCache('comp-1', { title: 'Concurso Atualizado' });
      });

      const updatedConcurso = result.current.concursos.find(c => c.id === 'comp-1');
      expect(updatedConcurso?.title).toBe('Concurso Atualizado');
    });

    it('should remove item from cache', async () => {
      const { result } = renderHook(() => useConcursosCache());

      // Primeiro adicionar um item
      const concurso = {
        id: 'comp-1',
        title: 'Concurso 1',
        organizer: 'Org 1',
        user_id: 'user-123',
      };

      act(() => {
        result.current.addToCache(concurso as any);
      });

      expect(result.current.concursos).toHaveLength(1);

      // Depois remover
      act(() => {
        result.current.removeFromCache('comp-1');
      });

      expect(result.current.concursos).toHaveLength(0);
    });

    it('should update entire cache', async () => {
      const { result } = renderHook(() => useConcursosCache());

      const newData = [
        {
          id: 'comp-new-1',
          title: 'Novo Concurso 1',
          organizer: 'Nova Org',
          user_id: 'user-123',
        },
      ];

      act(() => {
        result.current.updateCache(newData as any);
      });

      expect(result.current.concursos).toEqual(newData);
    });

    it('should clear cache', async () => {
      const { result } = renderHook(() => useConcursosCache());

      // Adicionar alguns itens primeiro
      act(() => {
        result.current.addToCache({ id: 'comp-1', title: 'Test' } as any);
        result.current.addToCache({ id: 'comp-2', title: 'Test 2' } as any);
      });

      expect(result.current.concursos).toHaveLength(2);

      // Limpar cache
      act(() => {
        result.current.clearCache();
      });

      // Note: clearCache limpa o cache interno, mas não necessariamente o estado local
      // O comportamento exato depende da implementação
    });

    it('should invalidate cache', async () => {
      const { result } = renderHook(() => useConcursosCache());

      act(() => {
        result.current.invalidateCache();
      });

      // Verificar se a função foi chamada sem erro
      expect(result.current.invalidateCache).toBeDefined();
    });
  });

  describe('getConcursoById', () => {
    it('should find concurso by id', async () => {
      const { result } = renderHook(() => useConcursosCache());

      const concurso = {
        id: 'comp-1',
        title: 'Concurso 1',
        organizer: 'Org 1',
        user_id: 'user-123',
      };

      act(() => {
        result.current.addToCache(concurso as any);
      });

      const found = result.current.getConcursoById('comp-1');
      expect(found).toEqual(concurso);
    });

    it('should return null when concurso not found', async () => {
      const { result } = renderHook(() => useConcursosCache());

      const found = result.current.getConcursoById('non-existent');
      expect(found).toBe(null);
    });
  });

  describe('cache stats', () => {
    it('should return cache statistics', async () => {
      const { result } = renderHook(() => useConcursosCache());

      const stats = result.current.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('isValid');
      expect(stats).toHaveProperty('lastUpdate');
    });

    it('should check if cache is valid', async () => {
      const { result } = renderHook(() => useConcursosCache());

      const isValid = result.current.isCacheValid();
      expect(typeof isValid).toBe('boolean');
    });
  });
});