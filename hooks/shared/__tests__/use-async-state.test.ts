import { renderHook, act } from '@testing-library/react';
import {
  useAsyncState,
  useAsyncCRUD,
  useAsyncCache,
  useAsyncPagination,
  combineAsyncStates,
  useAsyncDebounce
} from '../use-async-state';

describe('SUP-5: Estados Async Padronizados', () => {
  
  describe('useAsyncState', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAsyncState());

      expect(result.current.data).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should initialize with custom initial data', () => {
      const initialData = { id: 1, name: 'Test' };
      const { result } = renderHook(() => useAsyncState({ initialData }));

      expect(result.current.data).toEqual(initialData);
      expect(result.current.isIdle).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should handle successful async execution', async () => {
      const { result } = renderHook(() => useAsyncState<string>());

      const mockAsyncFn = jest.fn().mockResolvedValue('success data');

      await act(async () => {
        const response = await result.current.execute(mockAsyncFn);
        expect(response).toBe('success data');
      });

      expect(result.current.data).toBe('success data');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isSuccess).toBe(true);
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    });

    it('should handle async execution errors', async () => {
      const { result } = renderHook(() => useAsyncState<string>());

      const mockAsyncFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        const response = await result.current.execute(mockAsyncFn);
        expect(response).toBe(null);
      });

      expect(result.current.data).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Test error');
      expect(result.current.isError).toBe(true);
    });

    it('should handle loading states correctly', async () => {
      const { result } = renderHook(() => useAsyncState<string>());

      const mockAsyncFn = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('data'), 100))
      );

      act(() => {
        result.current.execute(mockAsyncFn);
      });

      // Should be loading immediately
      expect(result.current.loading).toBe(true);
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should be done loading
      expect(result.current.loading).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe('data');
    });

    it('should support retry functionality', async () => {
      const { result } = renderHook(() => 
        useAsyncState({ retryCount: 2, retryDelay: 10 })
      );

      let callCount = 0;
      const mockAsyncFn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve('success after retry');
      });

      await act(async () => {
        const response = await result.current.execute(mockAsyncFn);
        expect(response).toBe('success after retry');
      });

      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
      expect(result.current.data).toBe('success after retry');
      expect(result.current.error).toBe(null);
    });

    it('should call lifecycle callbacks', async () => {
      const onStart = jest.fn();
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onFinish = jest.fn();

      const { result } = renderHook(() => 
        useAsyncState({ onStart, onSuccess, onError, onFinish })
      );

      // Test successful execution
      const mockSuccessFn = jest.fn().mockResolvedValue('success');

      await act(async () => {
        await result.current.execute(mockSuccessFn);
      });

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith('success');
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();

      // Test error execution
      const mockErrorFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await act(async () => {
        await result.current.execute(mockErrorFn);
      });

      expect(onStart).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledWith('Test error');
      expect(onFinish).toHaveBeenCalledTimes(2);
    });

    it('should support manual state management', () => {
      const { result } = renderHook(() => useAsyncState<string>());

      act(() => {
        result.current.setData('manual data');
      });

      expect(result.current.data).toBe('manual data');
      expect(result.current.error).toBe(null);

      act(() => {
        result.current.setError('manual error');
      });

      expect(result.current.error).toBe('manual error');
      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });

    it('should reset state correctly', () => {
      const { result } = renderHook(() => useAsyncState({ initialData: 'initial' }));

      act(() => {
        result.current.setData('changed data');
        result.current.setError('some error');
        result.current.setLoading(true);
      });

      expect(result.current.data).toBe('changed data');
      expect(result.current.error).toBe('some error');
      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe('initial');
      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useAsyncCRUD', () => {
    it('should provide CRUD operations', () => {
      const { result } = renderHook(() => useAsyncCRUD());

      expect(typeof result.current.create).toBe('function');
      expect(typeof result.current.update).toBe('function');
      expect(typeof result.current.remove).toBe('function');
      expect(typeof result.current.fetchAll).toBe('function');
    });

    it('should handle create operation', async () => {
      const { result } = renderHook(() => useAsyncCRUD<{ id: string; name: string }>());

      const mockCreateFn = jest.fn().mockResolvedValue({ id: '1', name: 'Created Item' });

      await act(async () => {
        const created = await result.current.create(mockCreateFn);
        expect(created).toEqual({ id: '1', name: 'Created Item' });
      });

      expect(result.current.data).toEqual([{ id: '1', name: 'Created Item' }]);
    });

    it('should handle update operation', async () => {
      const { result } = renderHook(() => useAsyncCRUD<{ id: string; name: string }>());

      // Set initial data
      act(() => {
        result.current.setData([{ id: '1', name: 'Original' }]);
      });

      const mockUpdateFn = jest.fn().mockResolvedValue({ id: '1', name: 'Updated' });

      await act(async () => {
        const updated = await result.current.update(mockUpdateFn, '1');
        expect(updated).toEqual({ id: '1', name: 'Updated' });
      });

      expect(result.current.data).toEqual([{ id: '1', name: 'Updated' }]);
    });

    it('should handle remove operation', async () => {
      const { result } = renderHook(() => useAsyncCRUD<{ id: string; name: string }>());

      // Set initial data
      act(() => {
        result.current.setData([
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' }
        ]);
      });

      const mockDeleteFn = jest.fn().mockResolvedValue(undefined);

      await act(async () => {
        await result.current.remove(mockDeleteFn, '1');
      });

      expect(result.current.data).toEqual([{ id: '2', name: 'Item 2' }]);
    });
  });

  describe('useAsyncCache', () => {
    it('should provide cache operations', () => {
      const { result } = renderHook(() => useAsyncCache('test-key'));

      expect(typeof result.current.fetchWithCache).toBe('function');
      expect(typeof result.current.invalidateCache).toBe('function');
      expect(typeof result.current.clearAllCache).toBe('function');
      expect(typeof result.current.isCacheValid).toBe('function');
    });

    it('should cache data correctly', async () => {
      const { result } = renderHook(() => useAsyncCache<string>('test-key', { ttl: 1000 }));

      const mockFetchFn = jest.fn().mockResolvedValue('cached data');

      // First call should fetch
      await act(async () => {
        const data = await result.current.fetchWithCache(mockFetchFn);
        expect(data).toBe('cached data');
      });

      expect(mockFetchFn).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await act(async () => {
        const data = await result.current.fetchWithCache(mockFetchFn);
        expect(data).toBe('cached data');
      });

      expect(mockFetchFn).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should invalidate cache when TTL expires', async () => {
      const { result } = renderHook(() => useAsyncCache<string>('test-key', { ttl: 10 }));

      const mockFetchFn = jest.fn()
        .mockResolvedValueOnce('first data')
        .mockResolvedValueOnce('second data');

      // First call
      await act(async () => {
        await result.current.fetchWithCache(mockFetchFn);
      });

      // Wait for TTL to expire
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      // Second call should fetch again
      await act(async () => {
        const data = await result.current.fetchWithCache(mockFetchFn);
        expect(data).toBe('second data');
      });

      expect(mockFetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('useAsyncPagination', () => {
    it('should provide pagination operations', () => {
      const { result } = renderHook(() => useAsyncPagination());

      expect(typeof result.current.fetchPage).toBe('function');
      expect(typeof result.current.loadMore).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.total).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      const { result } = renderHook(() => useAsyncPagination<string>());

      const mockFetchFn = jest.fn().mockResolvedValue({
        data: ['item1', 'item2'],
        hasMore: true,
        total: 10
      });

      await act(async () => {
        await result.current.fetchPage(mockFetchFn, 1);
      });

      expect(result.current.data).toEqual(['item1', 'item2']);
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.total).toBe(10);
    });

    it('should handle load more correctly', async () => {
      const { result } = renderHook(() => useAsyncPagination<string>());

      const mockFetchFn = jest.fn()
        .mockResolvedValueOnce({
          data: ['item1', 'item2'],
          hasMore: true,
          total: 4
        })
        .mockResolvedValueOnce({
          data: ['item3', 'item4'],
          hasMore: false,
          total: 4
        });

      // First page
      await act(async () => {
        await result.current.fetchPage(mockFetchFn, 1);
      });

      // Load more
      await act(async () => {
        await result.current.loadMore(mockFetchFn);
      });

      expect(result.current.data).toEqual(['item1', 'item2', 'item3', 'item4']);
      expect(result.current.page).toBe(2);
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('combineAsyncStates', () => {
    it('should combine multiple async states correctly', () => {
      const state1 = {
        data: ['item1'],
        loading: false,
        error: null,
        isIdle: false,
        isLoading: false,
        isError: false,
        isSuccess: true
      };

      const state2 = {
        data: { count: 5 },
        loading: true,
        error: null,
        isIdle: false,
        isLoading: true,
        isError: false,
        isSuccess: false
      };

      const combined = combineAsyncStates({ list: state1, stats: state2 });

      expect(combined.loading).toBe(true); // Any loading = true
      expect(combined.isLoading).toBe(true);
      expect(combined.error).toBe(null);
      expect(combined.isError).toBe(false);
      expect(combined.isSuccess).toBe(false); // Not all success = false
      expect(combined.data).toEqual({
        list: ['item1'],
        stats: { count: 5 }
      });
    });

    it('should handle errors in combined states', () => {
      const state1 = {
        data: null,
        loading: false,
        error: 'Error 1',
        isIdle: false,
        isLoading: false,
        isError: true,
        isSuccess: false
      };

      const state2 = {
        data: null,
        loading: false,
        error: 'Error 2',
        isIdle: false,
        isLoading: false,
        isError: true,
        isSuccess: false
      };

      const combined = combineAsyncStates({ first: state1, second: state2 });

      expect(combined.error).toBe('Error 1; Error 2');
      expect(combined.isError).toBe(true);
      expect(combined.isSuccess).toBe(false);
    });
  });

  describe('useAsyncDebounce', () => {
    it('should debounce async execution', async () => {
      jest.useFakeTimers();
      
      const { result } = renderHook(() => useAsyncDebounce<string>(100));

      const mockAsyncFn = jest.fn().mockResolvedValue('debounced result');

      // Call multiple times quickly
      act(() => {
        result.current.execute(mockAsyncFn);
        result.current.execute(mockAsyncFn);
        result.current.execute(mockAsyncFn);
      });

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(150);
      });

      await act(async () => {
        await Promise.resolve(); // Wait for promises to resolve
      });

      // Should only be called once due to debouncing
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle component unmount gracefully', async () => {
      const { result, unmount } = renderHook(() => useAsyncState<string>());

      const mockAsyncFn = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('data'), 100))
      );

      act(() => {
        result.current.execute(mockAsyncFn);
      });

      // Unmount before async operation completes
      unmount();

      // Wait for async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should not throw errors or update state after unmount
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent executions', async () => {
      const { result } = renderHook(() => useAsyncState<string>());

      const mockAsyncFn1 = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('first'), 100))
      );

      const mockAsyncFn2 = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('second'), 50))
      );

      // Start both executions
      const promise1 = act(async () => {
        return result.current.execute(mockAsyncFn1);
      });

      const promise2 = act(async () => {
        return result.current.execute(mockAsyncFn2);
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should complete
      expect(result1).toBe('first');
      expect(result2).toBe('second');
    });
  });
});