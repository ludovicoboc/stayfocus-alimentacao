/**
 * SUP-6: Interface de abstração para operações de banco de dados
 * Remove acoplamento direto com Supabase
 */

export interface DatabaseQuery {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  filters?: Record<string, any>;
  data?: any;
  columns?: string | string[];
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
  single?: boolean;
}

export interface DatabaseResponse<T = any> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface DatabaseFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not';
  value: any;
}

export interface DatabaseOrderBy {
  column: string;
  ascending?: boolean;
}

/**
 * Interface principal para operações de banco de dados
 */
export interface DatabaseClient {
  // Operações básicas de CRUD
  select<T = any>(
    table: string, 
    options?: {
      columns?: string | string[];
      filters?: DatabaseFilter[];
      orderBy?: DatabaseOrderBy[];
      limit?: number;
      single?: boolean;
    }
  ): Promise<DatabaseResponse<T>>;

  insert<T = any>(
    table: string, 
    data: any | any[], 
    options?: {
      returning?: string | string[];
      upsert?: boolean;
    }
  ): Promise<DatabaseResponse<T>>;

  update<T = any>(
    table: string, 
    data: any, 
    filters: DatabaseFilter[], 
    options?: {
      returning?: string | string[];
    }
  ): Promise<DatabaseResponse<T>>;

  delete<T = any>(
    table: string, 
    filters: DatabaseFilter[], 
    options?: {
      returning?: string | string[];
    }
  ): Promise<DatabaseResponse<T>>;

  // Operações de autenticação
  getCurrentUser(): Promise<any>;
  
  // Operações em tempo real (opcional)
  subscribe?(
    table: string, 
    callback: (payload: any) => void, 
    filters?: DatabaseFilter[]
  ): () => void;

  // Health check
  isConnected(): Promise<boolean>;
}

/**
 * Factory para criar cliente de banco de dados
 */
export interface DatabaseClientFactory {
  create(): DatabaseClient;
  createWithAuth(): DatabaseClient;
}

/**
 * Configuração de conexão
 */
export interface DatabaseConfig {
  url: string;
  apiKey: string;
  serviceKey?: string;
  debug?: boolean;
}

/**
 * Tipos de erro padronizados
 */
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'connection_error',
  AUTHENTICATION_ERROR = 'auth_error', 
  PERMISSION_ERROR = 'permission_error',
  VALIDATION_ERROR = 'validation_error',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN_ERROR = 'unknown_error'
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public type: DatabaseErrorType,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Helper para construir filtros de forma type-safe
 */
export class FilterBuilder {
  private filters: DatabaseFilter[] = [];

  eq(column: string, value: any): FilterBuilder {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any): FilterBuilder {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any): FilterBuilder {
    this.filters.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any): FilterBuilder {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any): FilterBuilder {
    this.filters.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any): FilterBuilder {
    this.filters.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, value: string): FilterBuilder {
    this.filters.push({ column, operator: 'like', value });
    return this;
  }

  ilike(column: string, value: string): FilterBuilder {
    this.filters.push({ column, operator: 'ilike', value });
    return this;
  }

  in(column: string, values: any[]): FilterBuilder {
    this.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  isNull(column: string): FilterBuilder {
    this.filters.push({ column, operator: 'is', value: null });
    return this;
  }

  isNotNull(column: string): FilterBuilder {
    this.filters.push({ column, operator: 'not', value: null });
    return this;
  }

  build(): DatabaseFilter[] {
    return this.filters;
  }

  clear(): FilterBuilder {
    this.filters = [];
    return this;
  }
}

/**
 * Helper para construir queries complexas
 */
export class QueryBuilder {
  private query: Partial<DatabaseQuery> = {};

  table(tableName: string): QueryBuilder {
    this.query.table = tableName;
    return this;
  }

  select(columns?: string | string[]): QueryBuilder {
    this.query.operation = 'select';
    this.query.columns = columns;
    return this;
  }

  insert(data: any): QueryBuilder {
    this.query.operation = 'insert';
    this.query.data = data;
    return this;
  }

  update(data: any): QueryBuilder {
    this.query.operation = 'update';
    this.query.data = data;
    return this;
  }

  delete(): QueryBuilder {
    this.query.operation = 'delete';
    return this;
  }

  where(filters: DatabaseFilter[]): QueryBuilder {
    this.query.filters = filters;
    return this;
  }

  orderBy(column: string, ascending = true): QueryBuilder {
    this.query.orderBy = { column, ascending };
    return this;
  }

  limit(count: number): QueryBuilder {
    this.query.limit = count;
    return this;
  }

  single(): QueryBuilder {
    this.query.single = true;
    return this;
  }

  build(): DatabaseQuery {
    if (!this.query.table || !this.query.operation) {
      throw new Error('Table and operation are required');
    }
    return this.query as DatabaseQuery;
  }
}