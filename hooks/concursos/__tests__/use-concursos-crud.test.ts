import { renderHook, act } from '@testing-library/react';
import { useConcursosCRUD } from '../use-concursos-crud';
import { useAuth } from '@/lib/auth-provider';
import { createClient } from '@/lib/supabase';

// Mocks
jest.mock('@/lib/auth-provider');
jest.mock('@/lib/supabase');
jest.mock('@/lib/error-handler');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('useConcursosCRUD', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser } as any);
    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  describe('createCompetition', () => {
    it('should create a competition successfully', async () => {
      const mockCompetition = {
        id: 'comp-123',
        title: 'Test Competition',
        organizer: 'Test Organizer',
        user_id: 'user-123',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCompetition,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const competition = await result.current.createCompetition({
          title: 'Test Competition',
          organizer: 'Test Organizer',
        });

        expect(competition).toEqual(mockCompetition);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('competitions');
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          title: 'Test Competition',
          organizer: 'Test Organizer',
          user_id: 'user-123',
        }),
      ]);
    });

    it('should throw error when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        await expect(
          result.current.createCompetition({
            title: 'Test Competition',
          })
        ).rejects.toThrow('Usuário não autenticado');
      });
    });
  });

  describe('updateCompetition', () => {
    it('should update a competition successfully', async () => {
      const mockUpdatedCompetition = {
        id: 'comp-123',
        title: 'Updated Competition',
        user_id: 'user-123',
      };

      // Mock validateCompetitionAccess
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'comp-123' },
              error: null,
            }),
          }),
        }),
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockUpdatedCompetition,
                error: null,
              }),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const competition = await result.current.updateCompetition('comp-123', {
          title: 'Updated Competition',
        });

        expect(competition).toEqual(mockUpdatedCompetition);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('competitions');
    });
  });

  describe('deleteCompetition', () => {
    it('should delete a competition successfully', async () => {
      // Mock validateCompetitionAccess
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'comp-123' },
              error: null,
            }),
          }),
        }),
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const success = await result.current.deleteCompetition('comp-123');
        expect(success).toBe(true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('competitions');
    });
  });

  describe('addSubject', () => {
    it('should add a subject successfully', async () => {
      const mockSubject = {
        id: 'subject-123',
        competition_id: 'comp-123',
        name: 'Test Subject',
      };

      // Mock validateCompetitionAccess
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'comp-123' },
              error: null,
            }),
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSubject,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const subject = await result.current.addSubject('comp-123', {
          name: 'Test Subject',
        });

        expect(subject).toEqual(mockSubject);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('competition_subjects');
    });
  });

  describe('fetchQuestions', () => {
    it('should fetch questions successfully', async () => {
      const mockQuestions = [
        { id: 'q1', question_text: 'Question 1' },
        { id: 'q2', question_text: 'Question 2' },
      ];

      // Mock validateCompetitionAccess
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'comp-123' },
              error: null,
            }),
          }),
        }),
      });

      const mockSelectQuestions = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockQuestions,
            error: null,
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ select: mockSelectQuestions });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const questions = await result.current.fetchQuestions('comp-123');
        expect(questions).toEqual(mockQuestions);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('competition_questions');
    });

    it('should return empty array when no questions found', async () => {
      // Mock validateCompetitionAccess
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'comp-123' },
              error: null,
            }),
          }),
        }),
      });

      const mockSelectQuestions = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ select: mockSelectQuestions });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const questions = await result.current.fetchQuestions('comp-123');
        expect(questions).toEqual([]);
      });
    });
  });

  describe('validateCompetitionAccess', () => {
    it('should validate access successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'comp-123' },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        const access = await result.current.validateCompetitionAccess('comp-123');
        expect(access).toEqual({ id: 'comp-123' });
      });
    });

    it('should throw error when competition not found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useConcursosCRUD());

      await act(async () => {
        await expect(
          result.current.validateCompetitionAccess('comp-123')
        ).rejects.toThrow('Concurso não encontrado ou acesso negado');
      });
    });
  });
});