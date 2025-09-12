/**
 * SUP-5: Hook padronizado para estados async
 * Elimina inconsistências e padroniza loading/error/data states
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ==================== TIPOS PADRONIZADOS ====================

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isIdle: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface AsyncActions<T> {
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  execute: <Args extends any[]>(
    asyncFn: (...args: Args) => Promise<T>,
    ...args: Args
  ) => Promise<T | null>;
}

export interface AsyncOptions {
  initialData?: any;
  resetOnExecute?: boolean;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onFinish?: () => void;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

// ==================== HOOK PRINCIPAL ====================

export function useAsyncState<T = any>(options: AsyncOptions = {}): AsyncState<T> & AsyncActions<T> {
  const {
    initialData = null,
    resetOnExecute = true,
    retryCount = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    onStart,
    onFinish
  } = options;

  // Estados principais
  const [data, setDataState] = useState<T | null>(initialData);
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  // Refs para evitar stale closures
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Estados derivados
  const isIdle = !loading && !error && data === null;
  const isLoading = loading;
  const isError = !loading && error !== null;
  const isSuccess = !loading && error === null && data !== null;

  // Ações padronizadas
  const setData = useCallback((newData: T | null) => {
    if (!isMountedRef.current) return;
    setDataState(newData);
    if (newData !== null) {
      setErrorState(null);
    }
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    if (!isMountedRef.current) return;
    setLoadingState(isLoading);
  }, []);

  const setError = useCallback((errorMessage: string | null) => {
    if (!isMountedRef.current) return;
    setErrorState(errorMessage);
    if (errorMessage !== null) {
      setLoadingState(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    setDataState(initialData);
    setLoadingState(false);
    setErrorState(null);
    retryCountRef.current = 0;
  }, [initialData]);

  // Função de execução com retry automático
  const execute = useCallback(async <Args extends any[]>(
    asyncFn: (...args: Args) => Promise<T>,
    ...args: Args
  ): Promise<T | null> => {
    if (!isMountedRef.current) return null;

    // Reset state se configurado
    if (resetOnExecute) {
      setErrorState(null);
      if (data !== null) {
        setDataState(null);
      }
    }

    setLoadingState(true);
    onStart?.();

    const executeWithRetry = async (attempt: number = 0): Promise<T | null> => {
      try {
        const result = await asyncFn(...args);
        
        if (!isMountedRef.current) return null;

        setDataState(result);
        setLoadingState(false);
        setErrorState(null);
        retryCountRef.current = 0;
        
        onSuccess?.(result);
        onFinish?.();
        
        return result;
      } catch (err) {
        if (!isMountedRef.current) return null;

        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        
        // Tentar retry se configurado
        if (attempt < retryCount) {
          console.warn(`Tentativa ${attempt + 1} falhou, tentando novamente em ${retryDelay}ms...`);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          if (!isMountedRef.current) return null;
          
          return executeWithRetry(attempt + 1);
        }
        
        // Falha final
        setLoadingState(false);
        setErrorState(errorMessage);
        retryCountRef.current = 0;
        
        onError?.(errorMessage);
        onFinish?.();
        
        return null;
      }
    };

    return executeWithRetry();
  }, [data, resetOnExecute, retryCount, retryDelay, onSuccess, onError, onStart, onFinish]);

  return {
    // Estado
    data,
    loading,
    error,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    
    // Ações
    setData,
    setLoading,
    setError,
    reset,
    execute
  };
}

// ==================== HOOKS ESPECIALIZADOS ====================

/**
 * Hook para operações CRUD padronizadas
 */
export function useAsyncCRUD<T = any>(options: AsyncOptions = {}) {
  const asyncState = useAsyncState<T[]>({ initialData: [], ...options });

  const create = useCallback(async (createFn: () => Promise<T>, item?: T) => {
    const result = await asyncState.execute(createFn);
    if (result && asyncState.data) {
      // Adicionar item criado à lista
      asyncState.setData([result, ...asyncState.data]);
    }
    return result;
  }, [asyncState]);

  const update = useCallback(async (updateFn: () => Promise<T>, id: string) => {
    const result = await asyncState.execute(updateFn);
    if (result && asyncState.data) {
      // Atualizar item na lista
      const updatedData = asyncState.data.map(item => 
        (item as any).id === id ? result : item
      );
      asyncState.setData(updatedData);
    }
    return result;
  }, [asyncState]);

  const remove = useCallback(async (deleteFn: () => Promise<void>, id: string) => {
    await asyncState.execute(async () => {
      await deleteFn();
      return null; // Delete não retorna dados
    });
    
    if (asyncState.data && !asyncState.error) {
      // Remover item da lista
      const filteredData = asyncState.data.filter(item => 
        (item as any).id !== id
      );
      asyncState.setData(filteredData);
    }
  }, [asyncState]);

  const fetchAll = useCallback(async (fetchFn: () => Promise<T[]>) => {
    return await asyncState.execute(fetchFn);
  }, [asyncState]);

  return {
    ...asyncState,
    create,
    update,
    remove,
    fetchAll
  };
}

/**
 * Hook para cache padronizado
 */
export function useAsyncCache<T = any>(
  cacheKey: string,
  options: AsyncOptions & {
    ttl?: number;
    invalidateOnFocus?: boolean;
  } = {}
) {
  const { ttl = 5 * 60 * 1000, invalidateOnFocus = false, ...asyncOptions } = options;
  const asyncState = useAsyncState<T>(asyncOptions);
  
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchWithCache = useCallback(async (fetchFn: () => Promise<T>) => {
    const cached = cacheRef.current.get(cacheKey);
    
    // Verificar se cache é válido
    if (cached && Date.now() - cached.timestamp < ttl) {
      asyncState.setData(cached.data);
      return cached.data;
    }

    // Buscar dados frescos
    const result = await asyncState.execute(fetchFn);
    
    if (result) {
      // Atualizar cache
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }
    
    return result;
  }, [cacheKey, ttl, asyncState]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(cacheKey);
  }, [cacheKey]);

  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Invalidar cache quando a janela ganha foco (opcional)
  useEffect(() => {
    if (!invalidateOnFocus) return;

    const handleFocus = () => {
      invalidateCache();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [invalidateOnFocus, invalidateCache]);

  return {
    ...asyncState,
    fetchWithCache,
    invalidateCache,
    clearAllCache,
    isCacheValid: () => {
      const cached = cacheRef.current.get(cacheKey);
      return cached ? Date.now() - cached.timestamp < ttl : false;
    }
  };
}

/**
 * Hook para paginação padronizada
 */
export function useAsyncPagination<T = any>(options: AsyncOptions = {}) {
  const asyncState = useAsyncState<T[]>({ initialData: [], ...options });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(async (
    fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
    pageNumber: number = 1,
    append: boolean = false
  ) => {
    const result = await asyncState.execute(async () => {
      const response = await fetchFn(pageNumber);
      
      if (append && asyncState.data) {
        // Adicionar à lista existente
        return [...asyncState.data, ...response.data];
      } else {
        // Substituir lista
        return response.data;
      }
    });

    if (result) {
      const response = await fetchFn(pageNumber);
      setHasMore(response.hasMore);
      if (response.total !== undefined) {
        setTotal(response.total);
      }
      setPage(pageNumber);
    }

    return result;
  }, [asyncState]);

  const loadMore = useCallback(async (
    fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>
  ) => {
    if (!hasMore || asyncState.loading) return;
    
    return await fetchPage(fetchFn, page + 1, true);
  }, [fetchPage, page, hasMore, asyncState.loading]);

  const refresh = useCallback(async (
    fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>
  ) => {
    setPage(1);
    setHasMore(true);
    return await fetchPage(fetchFn, 1, false);
  }, [fetchPage]);

  return {
    ...asyncState,
    page,
    hasMore,
    total,
    fetchPage,
    loadMore,
    refresh
  };
}

// ==================== UTILITÁRIOS ====================

/**
 * Combina múltiplos estados async
 */
export function combineAsyncStates<T extends Record<string, AsyncState<any>>>(
  states: T
): {
  loading: boolean;
  error: string | null;
  isIdle: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data: { [K in keyof T]: T[K]['data'] };
} {
  const loading = Object.values(states).some(state => state.loading);
  const errors = Object.values(states)
    .map(state => state.error)
    .filter(Boolean);
  const error = errors.length > 0 ? errors.join('; ') : null;
  
  const isIdle = Object.values(states).every(state => state.isIdle);
  const isLoading = Object.values(states).some(state => state.isLoading);
  const isError = Object.values(states).some(state => state.isError);
  const isSuccess = Object.values(states).every(state => state.isSuccess);

  const data = Object.keys(states).reduce((acc, key) => {
    acc[key as keyof T] = states[key as keyof T].data;
    return acc;
  }, {} as { [K in keyof T]: T[K]['data'] });

  return {
    loading,
    error,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    data
  };
}

/**
 * Hook para debounce de estados async
 */
export function useAsyncDebounce<T = any>(
  delay: number = 300,
  options: AsyncOptions = {}
) {
  const asyncState = useAsyncState<T>(options);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedExecute = useCallback(async <Args extends any[]>(
    asyncFn: (...args: Args) => Promise<T>,
    ...args: Args
  ): Promise<T | null> => {
    return new Promise((resolve) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        const result = await asyncState.execute(asyncFn, ...args);
        resolve(result);
      }, delay);
    });
  }, [asyncState, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...asyncState,
    execute: debouncedExecute
  };
}

// ==================== EXPORTS ====================

export default useAsyncState;