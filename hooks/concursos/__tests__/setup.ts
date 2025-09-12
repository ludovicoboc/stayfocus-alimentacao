// Setup para testes dos hooks de concursos
import '@testing-library/jest-dom';

// Mock global do console para evitar logs desnecessários nos testes
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock das dependências globais
jest.mock('@/lib/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/auth-utils', () => ({
  withAuth: jest.fn((fn) => fn({ id: 'test-user' })),
}));

jest.mock('@/lib/error-handler', () => ({
  handleSupabaseCompetitionError: jest.fn((error) => error.message || 'Database error'),
}));

jest.mock('@/lib/request-debouncer', () => ({
  createDebouncedFunction: jest.fn((key, fn) => fn),
}));

// Mock dos tipos para evitar erros de importação
jest.mock('@/types', () => ({
  // Mock dos tipos principais
}));

// Configuração global para testes
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do fetch para testes de API
global.fetch = jest.fn();

export {};