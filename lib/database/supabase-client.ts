/**
 * SUP-6: Implementação da interface DatabaseClient usando Supabase
 * Encapsula toda lógica específica do Supabase
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { 
  DatabaseClient, 
  DatabaseResponse, 
  DatabaseFilter, 
  DatabaseOrderBy,
  DatabaseError,
  DatabaseErrorType,
  DatabaseConfig,
  DatabaseClientFactory
} from './database-interface';

/**
 * Implementação Supabase do DatabaseClient
 */
export class SupabaseClient implements DatabaseClient {
  private client: any;

  constructor(config?: DatabaseConfig) {
    // Se config não fornecido, usar variáveis de ambiente
    const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    this.client = createSupabaseClient(url, apiKey);
  }

  /**
   * Converte filtros da interface para formato Supabase
   */
  private applyFilters(query: any, filters: DatabaseFilter[]): any {
    filters.forEach(filter => {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        case 'gt':
          query = query.gt(filter.column, filter.value);
          break;
        case 'gte':
          query = query.gte(filter.column, filter.value);
          break;
        case 'lt':
          query = query.lt(filter.column, filter.value);
          break;
        case 'lte':
          query = query.lte(filter.column, filter.value);
          break;
        case 'like':
          query = query.like(filter.column, filter.value);
          break;
        case 'ilike':
          query = query.ilike(filter.column, filter.value);
          break;
        case 'in':
          query = query.in(filter.column, filter.value);
          break;
        case 'is':
          query = query.is(filter.column, filter.value);
          break;
        case 'not':
          query = query.not(filter.column, filter.value);
          break;
        default:
          console.warn(`Operador não suportado: ${filter.operator}`);
      }
    });
    return query;
  }

  /**
   * Converte erros Supabase para DatabaseError
   */
  private handleError(error: any): DatabaseError {
    if (!error) return null as any;

    let errorType: DatabaseErrorType = DatabaseErrorType.UNKNOWN_ERROR;
    
    // Mapear tipos de erro do Supabase
    if (error.code === 'PGRST116') errorType = DatabaseErrorType.NOT_FOUND;
    else if (error.code === '23505') errorType = DatabaseErrorType.CONFLICT;
    else if (error.code === '42501') errorType = DatabaseErrorType.PERMISSION_ERROR;
    else if (error.message?.includes('JWT')) errorType = DatabaseErrorType.AUTHENTICATION_ERROR;
    else if (error.message?.includes('connection')) errorType = DatabaseErrorType.CONNECTION_ERROR;

    return new DatabaseError(
      error.message || 'Erro desconhecido',
      errorType,
      error
    );
  }

  async select<T = any>(
    table: string, 
    options?: {
      columns?: string | string[];
      filters?: DatabaseFilter[];
      orderBy?: DatabaseOrderBy[];
      limit?: number;
      single?: boolean;
    }
  ): Promise<DatabaseResponse<T>> {
    try {
      let query = this.client.from(table);

      // Aplicar colunas
      if (options?.columns) {
        const columns = Array.isArray(options.columns) 
          ? options.columns.join(',') 
          : options.columns;
        query = query.select(columns);
      } else {
        query = query.select('*');
      }

      // Aplicar filtros
      if (options?.filters?.length) {
        query = this.applyFilters(query, options.filters);
      }

      // Aplicar ordenação
      if (options?.orderBy?.length) {
        options.orderBy.forEach(order => {
          query = query.order(order.column, { ascending: order.ascending ?? true });
        });
      }

      // Aplicar limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      // Executar query
      let result;
      if (options?.single) {
        result = await query.single();
      } else {
        result = await query;
      }

      return {
        data: result.data,
        error: this.handleError(result.error),
        count: result.count
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error)
      };
    }
  }

  async insert<T = any>(
    table: string, 
    data: any | any[], 
    options?: {
      returning?: string | string[];
      upsert?: boolean;
    }
  ): Promise<DatabaseResponse<T>> {
    try {
      let query = this.client.from(table);

      if (options?.upsert) {
        query = query.upsert(data);
      } else {
        query = query.insert(data);
      }

      // Configurar retorno
      if (options?.returning) {
        const columns = Array.isArray(options.returning) 
          ? options.returning.join(',') 
          : options.returning;
        query = query.select(columns);
      }

      const result = await query;

      return {
        data: result.data,
        error: this.handleError(result.error)
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error)
      };
    }
  }

  async update<T = any>(
    table: string, 
    data: any, 
    filters: DatabaseFilter[], 
    options?: {
      returning?: string | string[];
    }
  ): Promise<DatabaseResponse<T>> {
    try {
      let query = this.client.from(table).update(data);

      // Aplicar filtros
      if (filters.length) {
        query = this.applyFilters(query, filters);
      } else {
        throw new Error('Update requer pelo menos um filtro');
      }

      // Configurar retorno
      if (options?.returning) {
        const columns = Array.isArray(options.returning) 
          ? options.returning.join(',') 
          : options.returning;
        query = query.select(columns);
      }

      const result = await query;

      return {
        data: result.data,
        error: this.handleError(result.error)
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error)
      };
    }
  }

  async delete<T = any>(
    table: string, 
    filters: DatabaseFilter[], 
    options?: {
      returning?: string | string[];
    }
  ): Promise<DatabaseResponse<T>> {
    try {
      let query = this.client.from(table).delete();

      // Aplicar filtros
      if (filters.length) {
        query = this.applyFilters(query, filters);
      } else {
        throw new Error('Delete requer pelo menos um filtro');
      }

      // Configurar retorno
      if (options?.returning) {
        const columns = Array.isArray(options.returning) 
          ? options.returning.join(',') 
          : options.returning;
        query = query.select(columns);
      }

      const result = await query;

      return {
        data: result.data,
        error: this.handleError(result.error)
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error)
      };
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  subscribe(
    table: string, 
    callback: (payload: any) => void, 
    filters?: DatabaseFilter[]
  ): () => void {
    let channel = this.client
      .channel(`public:${table}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table 
        }, 
        callback
      );

    // TODO: Implementar filtros para subscriptions
    channel.subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }

  async isConnected(): Promise<boolean> {
    try {
      const { data, error } = await this.client.from('_health').select('1').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

/**
 * Factory para criar clientes Supabase
 */
export class SupabaseClientFactory implements DatabaseClientFactory {
  private config?: DatabaseConfig;

  constructor(config?: DatabaseConfig) {
    this.config = config;
  }

  create(): DatabaseClient {
    return new SupabaseClient(this.config);
  }

  createWithAuth(): DatabaseClient {
    // Mesma implementação por enquanto
    // Pode ser expandido para RLS específico
    return new SupabaseClient(this.config);
  }
}

/**
 * Instance singleton (compatibilidade com código existente)
 */
let defaultClient: DatabaseClient | null = null;

export function getDefaultDatabaseClient(): DatabaseClient {
  if (!defaultClient) {
    defaultClient = new SupabaseClient();
  }
  return defaultClient;
}

/**
 * Helper para criar novo cliente
 */
export function createDatabaseClient(config?: DatabaseConfig): DatabaseClient {
  return new SupabaseClient(config);
}