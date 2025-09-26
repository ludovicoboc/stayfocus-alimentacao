# SUP-6: Guia de Migração - Abstração de Banco de Dados

## 📋 **Objetivo**

Eliminar o acoplamento forte com Supabase através de uma camada de abstração que permite:
- ✅ Trocar de banco de dados facilmente
- ✅ Testes unitários simplificados  
- ✅ Type safety melhorado
- ✅ Manutenibilidade aumentada

---

## 🏗️ **Arquitetura Implementada**

### **Camadas da Abstração:**

```
┌─────────────────────────┐
│    Hooks de Aplicação   │ ← hooks/use-*.ts
├─────────────────────────┤
│   Abstração Database    │ ← hooks/shared/use-database.ts
├─────────────────────────┤
│ Interface Padronizada   │ ← lib/database/database-interface.ts
├─────────────────────────┤
│ Implementação Supabase  │ ← lib/database/supabase-client.ts
└─────────────────────────┘
```

### **Arquivos Criados:**

1. **`lib/database/database-interface.ts`** - Interface padronizada
2. **`lib/database/supabase-client.ts`** - Implementação Supabase
3. **`hooks/shared/use-database.ts`** - Hook de abstração
4. **`hooks/use-estudos-abstracted.ts`** - Exemplo de migração
5. **`lib/database/__tests__/database-abstraction.test.ts`** - Testes

---

## 🔄 **Guia de Migração por Hook**

### **ANTES (Acoplado ao Supabase):**

```typescript
// ❌ Acoplamento direto
import { createClient } from "@/lib/supabase";

export function useEstudos() {
  const supabase = createClient();
  const [sessoes, setSessoes] = useState<SessaoEstudo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessoes = async () => {
    try {
      setLoading(true);
      
      // Query Supabase direta
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessoes(data || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };
}
```

### **DEPOIS (Abstração de Banco):**

```typescript
// ✅ Abstração implementada
import { useDatabase, useDatabaseCRUD } from "@/hooks/shared/use-database";
import { useAsyncState } from "@/hooks/shared/use-async-state";

export function useEstudos() {
  const db = useDatabase();
  const crud = useDatabaseCRUD<SessaoEstudo>('study_sessions');
  
  // SUP-5: Estados async padronizados
  const sessoesState = useAsyncState<SessaoEstudo[]>({
    initialData: [],
    onError: (error) => console.error("Erro em useEstudos:", error)
  });

  const fetchSessoes = async () => {
    return await sessoesState.execute(async () => {
      // API abstrata
      const sessoes = await crud.findAll({
        orderBy: [{ column: 'created_at', ascending: false }]
      });
      return sessoes;
    });
  };
}
```

---

## 📝 **Roteiro de Migração**

### **Fase 1: Hooks Críticos (Prioridade Alta)**
- [ ] `hooks/use-concursos.ts`
- [ ] `hooks/use-dashboard.ts`
- [ ] `hooks/use-auth.ts`
- [ ] `hooks/use-estudos.ts`

### **Fase 2: Hooks Modulares (Prioridade Média)**
- [ ] `hooks/use-financas.ts`
- [ ] `hooks/use-saude.ts`
- [ ] `hooks/use-sono.ts`
- [ ] `hooks/use-lazer.ts`
- [ ] `hooks/use-receitas.ts`

### **Fase 3: Hooks Especializados (Prioridade Baixa)**
- [ ] `hooks/use-simulations.ts`
- [ ] `hooks/use-questions.ts`
- [ ] `hooks/use-profile.ts`
- [ ] `hooks/use-hiperfocos.ts`
- [ ] Demais hooks específicos

### **Fase 4: Hooks de Concursos (Em Desenvolvimento)**
- [ ] `hooks/concursos/use-concursos-crud.ts`
- [ ] `hooks/concursos/use-concursos-cache.ts`
- [ ] Hooks especializados do módulo

---

## 🛠️ **APIs Disponíveis**

### **1. useDatabase() - API Principal**

```typescript
const db = useDatabase();

// Operações básicas
await db.select('table', { filters, orderBy, limit });
await db.insert('table', data);
await db.update('table', data, filters);
await db.remove('table', filters);

// Operações do usuário (automático user_id)
await db.selectByUser('table', { additionalFilters });
await db.updateByUser('table', data, additionalFilters);
await db.removeByUser('table', additionalFilters);

// Builders
const filters = db.createFilter().eq('status', 'active').build();
const query = db.createQuery().table('sessions').select().build();
```

### **2. useDatabaseCRUD<T>() - CRUD Tipado**

```typescript
const crud = useDatabaseCRUD<MyType>('my_table');

// Operações CRUD simples
const items = await crud.findAll();
const item = await crud.findById('123');
const newItem = await crud.create(data);
const updated = await crud.updateById('123', updates);
const deleted = await crud.deleteById('123');
```

### **3. useDatabaseBatch() - Operações em Lote**

```typescript
const batch = useDatabaseBatch();

await batch.batchInsert('table', [item1, item2, item3]);
await batch.batchUpdate('table', [
  { id: '1', data: update1 },
  { id: '2', data: update2 }
]);
await batch.batchDelete('table', ['id1', 'id2', 'id3']);
```

---

## 🧪 **Benefícios para Testes**

### **ANTES (Supabase Direto):**

```typescript
// ❌ Mock complexo necessário
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null
          })
        })
      })
    })
  })
}));
```

### **DEPOIS (Abstração):**

```typescript
// ✅ Mock simples da interface
const mockClient: DatabaseClient = {
  select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
  insert: vi.fn().mockResolvedValue({ data: newItem, error: null }),
  // ... outras operações
};
```

---

## 🎯 **Padrões de Migração**

### **1. Query Select Simples**

```typescript
// ANTES
const { data, error } = await supabase
  .from("table")
  .select("*")
  .eq("user_id", user.id);

// DEPOIS
const result = await db.selectByUser("table");
const data = result.data;
```

### **2. Query com Filtros Complexos**

```typescript
// ANTES
const { data, error } = await supabase
  .from("sessions")
  .select("*")
  .eq("user_id", user.id)
  .gte("created_at", startDate)
  .like("title", `%${search}%`)
  .order("created_at", { ascending: false })
  .limit(20);

// DEPOIS
const filters = db.createFilter()
  .gte("created_at", startDate)
  .like("title", `%${search}%`)
  .build();

const result = await db.selectByUser("sessions", {
  additionalFilters: filters,
  orderBy: [{ column: "created_at", ascending: false }],
  limit: 20
});
```

### **3. Insert com Validação**

```typescript
// ANTES
const { data, error } = await supabase
  .from("sessions")
  .insert({ ...newSession, user_id: user.id })
  .select();

// DEPOIS
const newItem = await crud.create(newSession);
// user_id adicionado automaticamente
```

### **4. Update Condicional**

```typescript
// ANTES
const { data, error } = await supabase
  .from("sessions")
  .update(updates)
  .eq("id", sessionId)
  .eq("user_id", user.id)
  .select();

// DEPOIS
const updated = await crud.updateById(sessionId, updates);
// user_id verificado automaticamente
```

---

## 📊 **Métricas de Progresso**

### **Status Atual:**
- **Hooks Identificados:** 29 hooks com dependência Supabase
- **Abstração Criada:** ✅ Interface + Implementação + Testes
- **Exemplo Implementado:** ✅ `use-estudos-abstracted.ts`
- **Hooks Migrados:** 0/29 (0%)

### **Meta SUP-6:**
- **Hooks Críticos Migrados:** 0/4 (0%)
- **Coverage de Abstração:** 0/29 (0%)
- **Testes de Abstração:** ✅ Implementados

---

## 🚀 **Próximos Passos**

### **Imediato:**
1. **Migrar hook crítico** (use-concursos.ts)
2. **Testar em ambiente de desenvolvimento**
3. **Documentar problemas encontrados**

### **Curto Prazo:**
4. **Migrar 3-4 hooks principais**
5. **Criar mais exemplos de migração**
6. **Otimizar performance da abstração**

### **Médio Prazo:**
7. **Migrar todos os hooks restantes**
8. **Implementar cache layer na abstração**
9. **Adicionar métricas de performance**

---

## ⚠️ **Considerações e Limitações**

### **Compatibilidade:**
- ✅ API mantém compatibilidade total com hooks existentes
- ✅ Migração pode ser gradual (hook por hook)
- ✅ Rollback simples se necessário

### **Performance:**
- ⚠️ Pequeno overhead da abstração (desprezível)
- ✅ Possibilidade de otimizações futuras (cache, pooling)
- ✅ Queries mantêm mesma eficiência

### **Real-time:**
- ✅ Subscriptions suportadas na interface
- ⚠️ Implementação específica por banco
- 🔄 Pode necessitar ajustes para outros bancos

---

## 📚 **Recursos Adicionais**

- **Exemplo Completo:** `hooks/use-estudos-abstracted.ts`
- **Testes:** `lib/database/__tests__/database-abstraction.test.ts`
- **Interface:** `lib/database/database-interface.ts`
- **Implementação:** `lib/database/supabase-client.ts`

---

**Status:** 🟡 **Em Desenvolvimento - Base Sólida Implementada**  
**Próximo:** Migração do primeiro hook crítico para validar arquitetura