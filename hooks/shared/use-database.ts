/**
 * SUP-6: Hook abstrato para operações de banco de dados
 * Remove dependência direta do Supabase dos hooks
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { getDefaultDatabaseClient } from '@/lib/database/supabase-client';
import { FilterBuilder, QueryBuilder } from '@/lib/database/database-interface';
import type { 
  DatabaseClient, 
  DatabaseResponse, 
  DatabaseFilter,
  DatabaseOrderBy 
} from '@/lib/database/database-interface';

/**
 * Hook principal para operações de banco de dados
 * Remove acoplamento direto com Supabase
 */
export function useDatabase() {
  const { user } = useAuth();
  
  // Cliente de banco de dados abstrato
  const client: DatabaseClient = useMemo(() => {
    return getDefaultDatabaseClient();
  }, []);

  // Verificar se usuário está autenticado
  const ensureAuthenticated = useCallback(() => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user;
  }, [user]);

  // SELECT abstrato
  const select = useCallback(async <T = any>(
    table: string,
    options?: {
      columns?: string | string[];
      filters?: DatabaseFilter[];
      orderBy?: DatabaseOrderBy[];
      limit?: number;
      single?: boolean;
      requireAuth?: boolean;
    }
  ): Promise<DatabaseResponse<T>> => {
    if (options?.requireAuth !== false) {
      ensureAuthenticated();
    }

    return await client.select<T>(table, options);
  }, [client, ensureAuthenticated]);

  // INSERT abstrato
  const insert = useCallback(async <T = any>(
    table: string,
    data: any | any[],
    options?: {
      returning?: string | string[];
      upsert?: boolean;
      requireAuth?: boolean;
    }
  ): Promise<DatabaseResponse<T>> => {
    if (options?.requireAuth !== false) {
      const currentUser = ensureAuthenticated();
      
      // Adicionar user_id automaticamente se não presente
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (!data.user_id && !data.userId) {
          data.user_id = currentUser.id;
        }
      } else if (Array.isArray(data)) {
        data = data.map(item => {
          if (item && typeof item === 'object' && !item.user_id && !item.userId) {
            return { ...item, user_id: currentUser.id };
          }
          return item;
        });
      }
    }

    return await client.insert<T>(table, data, options);
  }, [client, ensureAuthenticated]);

  // UPDATE abstrato
  const update = useCallback(async <T = any>(
    table: string,
    data: any,
    filters: DatabaseFilter[],
    options?: {
      returning?: string | string[];
      requireAuth?: boolean;
    }
  ): Promise<DatabaseResponse<T>> => {
    if (options?.requireAuth !== false) {
      ensureAuthenticated();
    }

    return await client.update<T>(table, data, filters, options);
  }, [client, ensureAuthenticated]);

  // DELETE abstrato  
  const remove = useCallback(async <T = any>(
    table: string,
    filters: DatabaseFilter[],
    options?: {
      returning?: string | string[];
      requireAuth?: boolean;
    }
  ): Promise<DatabaseResponse<T>> => {
    if (options?.requireAuth !== false) {
      ensureAuthenticated();
    }

    return await client.delete<T>(table, filters, options);
  }, [client, ensureAuthenticated]);

  // Helpers para construção de queries
  const createFilter = useCallback(() => new FilterBuilder(), []);
  const createQuery = useCallback(() => new QueryBuilder(), []);

  // Helpers específicos para usuário atual
  const selectByUser = useCallback(async <T = any>(
    table: string,
    options?: {
      columns?: string | string[];
      additionalFilters?: DatabaseFilter[];
      orderBy?: DatabaseOrderBy[];
      limit?: number;
      single?: boolean;
    }
  ): Promise<DatabaseResponse<T>> => {
    const currentUser = ensureAuthenticated();
    
    const filters = [
      { column: 'user_id', operator: 'eq' as const, value: currentUser.id },
      ...(options?.additionalFilters || [])
    ];

    return await select<T>(table, {
      ...options,
      filters,
      requireAuth: false // Já verificamos acima
    });
  }, [select, ensureAuthenticated]);

  const updateByUser = useCallback(async <T = any>(
    table: string,
    data: any,
    additionalFilters: DatabaseFilter[] = [],
    options?: {
      returning?: string | string[];
    }
  ): Promise<DatabaseResponse<T>> => {
    const currentUser = ensureAuthenticated();
    
    const filters = [
      { column: 'user_id', operator: 'eq' as const, value: currentUser.id },
      ...additionalFilters
    ];

    return await update<T>(table, data, filters, {
      ...options,
      requireAuth: false // Já verificamos acima
    });
  }, [update, ensureAuthenticated]);

  const removeByUser = useCallback(async <T = any>(
    table: string,
    additionalFilters: DatabaseFilter[] = [],
    options?: {
      returning?: string | string[];
    }
  ): Promise<DatabaseResponse<T>> => {
    const currentUser = ensureAuthenticated();
    
    const filters = [
      { column: 'user_id', operator: 'eq' as const, value: currentUser.id },
      ...additionalFilters
    ];

    return await remove<T>(table, filters, {
      ...options,
      requireAuth: false // Já verificamos acima
    });
  }, [remove, ensureAuthenticated]);

  // Subscribe para real-time
  const subscribe = useCallback((
    table: string,
    callback: (payload: any) => void,
    filters?: DatabaseFilter[]
  ) => {
    if (!client.subscribe) {
      console.warn('Subscriptions não suportadas pelo cliente atual');
      return () => {};
    }

    return client.subscribe(table, callback, filters);
  }, [client]);

  // Health check
  const isConnected = useCallback(async (): Promise<boolean> => {
    return await client.isConnected();
  }, [client]);

  return {
    // Operações básicas
    select,
    insert,
    update,
    remove,
    
    // Operações específicas do usuário
    selectByUser,
    updateByUser,
    removeByUser,
    
    // Helpers
    createFilter,
    createQuery,
    subscribe,
    isConnected,
    
    // Estado
    user,
    isAuthenticated: !!user,
    
    // Cliente direto (para casos especiais)
    client
  };
}

/**
 * Hook especializado para operações CRUD simples
 */
export function useDatabaseCRUD<T = any>(tableName: string) {
  const db = useDatabase();

  const findAll = useCallback(async (options?: {
    columns?: string | string[];
    filters?: DatabaseFilter[];
    orderBy?: DatabaseOrderBy[];
    limit?: number;
  }): Promise<T[]> => {
    const result = await db.selectByUser<T[]>(tableName, options);
    return result.data || [];
  }, [db, tableName]);

  const findById = useCallback(async (id: string): Promise<T | null> => {
    const result = await db.selectByUser<T>(tableName, {
      additionalFilters: [{ column: 'id', operator: 'eq', value: id }],
      single: true
    });
    return result.data;
  }, [db, tableName]);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    const result = await db.insert<T>(tableName, data, {
      returning: '*'
    });
    return Array.isArray(result.data) ? result.data[0] : result.data;
  }, [db, tableName]);

  const updateById = useCallback(async (id: string, data: Partial<T>): Promise<T | null> => {
    const result = await db.updateByUser<T>(tableName, data, [
      { column: 'id', operator: 'eq', value: id }
    ], {
      returning: '*'
    });
    return Array.isArray(result.data) ? result.data[0] : result.data;
  }, [db, tableName]);

  const deleteById = useCallback(async (id: string): Promise<boolean> => {
    const result = await db.removeByUser(tableName, [
      { column: 'id', operator: 'eq', value: id }
    ]);
    return !result.error;
  }, [db, tableName]);

  return {
    findAll,
    findById,
    create,
    updateById,
    deleteById,
    
    // Acesso ao database completo se necessário
    db
  };
}

/**
 * Hook para operações em lote
 */
export function useDatabaseBatch() {
  const db = useDatabase();

  const batchInsert = useCallback(async <T = any>(
    table: string,
    items: any[],
    options?: {
      returning?: string | string[];
      upsert?: boolean;
    }
  ): Promise<T[]> => {
    const result = await db.insert<T[]>(table, items, options);
    return result.data || [];
  }, [db]);

  const batchUpdate = useCallback(async <T = any>(
    table: string,
    updates: Array<{ id: string; data: any }>
  ): Promise<T[]> => {
    const results = await Promise.all(
      updates.map(update => 
        db.updateByUser<T>(table, update.data, [
          { column: 'id', operator: 'eq', value: update.id }
        ], { returning: '*' })
      )
    );

    return results
      .map(result => Array.isArray(result.data) ? result.data[0] : result.data)
      .filter(Boolean);
  }, [db]);

  const batchDelete = useCallback(async (
    table: string,
    ids: string[]
  ): Promise<boolean> => {
    const result = await db.removeByUser(table, [
      { column: 'id', operator: 'in', value: ids }
    ]);
    return !result.error;
  }, [db]);

  return {
    batchInsert,
    batchUpdate,
    batchDelete
  };
}