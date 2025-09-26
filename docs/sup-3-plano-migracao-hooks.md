# 🔧 SUP-3 - Plano de Migração: Refatoração useConcursos

**Issue:** SUP-3  
**Data:** 19/12/2024  
**Status:** Implementado - Aguardando Migração

---

## 🎯 Objetivo

Refatorar o hook `useConcursos` sobrecarregado dividindo-o em hooks especializados com responsabilidade única, melhorando manutenibilidade, testabilidade e reutilização.

## 🚨 Problema Resolvido

### Hook Original Sobrecarregado
O `hooks/use-concursos.ts` tinha **9+ responsabilidades diferentes**:
1. Gerenciamento de estado de concursos
2. Operações CRUD completas
3. Cache manual implementado
4. Validação e sanitização de dados
5. Criação de dados de teste
6. Enriquecimento com histórico
7. Operações de disciplinas
8. Operações de tópicos
9. Operações de questões

**Problemas causados:**
- Arquivo com 1363+ linhas
- Dificulta manutenção e testes
- Viola princípio de responsabilidade única
- Re-renderizações desnecessárias
- Código difícil de reutilizar

## ✅ Solução Implementada

### Nova Arquitetura Especializada

```
hooks/concursos/
├── index.ts                      # API consolidada
├── use-concursos-refactored.ts   # Hook principal (substitui original)
├── use-concursos-crud.ts         # Operações de banco de dados
├── use-concursos-cache.ts        # Gerenciamento de cache
└── use-concursos-validation.ts   # Validação e sanitização
```

### 🏗️ Responsabilidades Distribuídas

#### 1. **useConcursosCRUD** - Operações de Banco
- ✅ CRUD de concursos
- ✅ CRUD de disciplinas  
- ✅ CRUD de tópicos
- ✅ CRUD de questões
- ✅ Validação de acesso
- ✅ Tratamento de erros

#### 2. **useConcursosCache** - Gerenciamento de Cache
- ✅ Cache otimizado com TTL
- ✅ Debouncing de requisições
- ✅ Invalidação inteligente
- ✅ Operações de cache (add, update, remove)
- ✅ Estatísticas de cache

#### 3. **useConcursosValidation** - Validação de Dados
- ✅ Validação de concursos
- ✅ Validação de disciplinas
- ✅ Validação de tópicos
- ✅ Validação de questões
- ✅ Sanitização de dados
- ✅ Validações compostas

#### 4. **useConcursos (Refatorado)** - Hook Principal
- ✅ Combina hooks especializados
- ✅ Mantém API compatível
- ✅ Coordena operações
- ✅ Gerencia estado global

## 📊 Benefícios Alcançados

### 🎯 **Responsabilidade Única**
- Cada hook tem uma função específica
- Código mais focado e legível
- Facilita manutenção e debugging

### 🧪 **Testabilidade Melhorada**
- Hooks podem ser testados independentemente
- Mocks mais simples
- Cobertura de testes mais granular

### 🔄 **Reutilização**
- Hooks especializados podem ser usados em outros contextos
- Composição flexível
- Menos duplicação de código

### ⚡ **Performance Otimizada**
- Re-renders mais controlados
- Cache mais eficiente
- Operações mais rápidas

### 🛠️ **Manutenibilidade**
- Código mais organizado
- Mudanças isoladas
- Menos efeitos colaterais

## 📋 Plano de Migração

### 🔄 **FASE 1 - Validação (1 dia)**

#### Passo 1.1: Testes de Compatibilidade
- [ ] Verificar se nova API funciona
- [ ] Testar operações principais
- [ ] Validar cache e performance

#### Passo 1.2: Testes de Integração
- [ ] Testar com componentes existentes
- [ ] Verificar fluxos completos
- [ ] Validar que não há regressões

### 🔄 **FASE 2 - Migração Gradual (2-3 dias)**

#### Passo 2.1: Atualizar Imports
```typescript
// ANTES
import { useConcursos } from "@/hooks/use-concursos"

// DEPOIS
import { useConcursos } from "@/hooks/concursos"
```

#### Passo 2.2: Migrar Componentes Críticos
- [ ] `app/concursos/page.tsx`
- [ ] `components/concurso-card.tsx`
- [ ] `components/concurso-form.tsx`
- [ ] `app/concursos/[id]/page.tsx`

#### Passo 2.3: Migrar Componentes Secundários
- [ ] Todos os outros componentes que usam useConcursos
- [ ] Atualizar testes relacionados

### 🔄 **FASE 3 - Finalização (1 dia)**

#### Passo 3.1: Limpeza
- [ ] Remover `hooks/use-concursos.ts` original
- [ ] Atualizar documentação
- [ ] Verificar que não há imports órfãos

#### Passo 3.2: Validação Final
- [ ] Build de produção
- [ ] Testes de regressão completos
- [ ] Performance benchmarks

## 🧪 Testes de Validação

### Testes Unitários
```typescript
describe('useConcursosCRUD', () => {
  it('should create competition', async () => {
    // Test implementation
  })
})

describe('useConcursosCache', () => {
  it('should cache data correctly', () => {
    // Test implementation  
  })
})

describe('useConcursosValidation', () => {
  it('should validate data', () => {
    // Test implementation
  })
})
```

### Testes de Integração
- [ ] Fluxo completo: criar → editar → deletar concurso
- [ ] Cache funcionando corretamente
- [ ] Validação impedindo dados inválidos
- [ ] Performance mantida ou melhorada

## 📁 Arquivos Implementados

### ✅ **Criados**
- [x] `hooks/concursos/use-concursos-crud.ts` (320 linhas)
- [x] `hooks/concursos/use-concursos-cache.ts` (280 linhas)
- [x] `hooks/concursos/use-concursos-validation.ts` (350 linhas)
- [x] `hooks/concursos/use-concursos-refactored.ts` (250 linhas)
- [x] `hooks/concursos/index.ts` (API consolidada)

### 🔄 **Para Migrar**
- [ ] Todos os componentes que importam `use-concursos`
- [ ] Testes relacionados
- [ ] Documentação

### 🗑️ **Para Remover (Fase 3)**
- [ ] `hooks/use-concursos.ts` (1363 linhas → 0)

## 📊 Comparação: Antes vs Depois

### **ANTES (Problemático)**
```typescript
// 1 arquivo gigante
hooks/use-concursos.ts (1363 linhas)
├── 9+ responsabilidades misturadas
├── Difícil de testar
├── Difícil de manter
└── Performance subótima
```

### **DEPOIS (Refatorado)**
```typescript
// 4 arquivos especializados
hooks/concursos/
├── use-concursos-crud.ts (320 linhas)      # CRUD operations
├── use-concursos-cache.ts (280 linhas)     # Cache management  
├── use-concursos-validation.ts (350 linhas) # Data validation
├── use-concursos-refactored.ts (250 linhas) # Main coordinator
└── index.ts (API consolidada)
```

**Benefícios:**
- ✅ Responsabilidade única por arquivo
- ✅ Fácil de testar independentemente
- ✅ Fácil de manter e evoluir
- ✅ Performance otimizada
- ✅ Reutilização de código

## 🚧 Riscos e Mitigações

### 🔴 **Riscos Altos**
**Quebrar funcionalidade existente**
- *Mitigação:* API mantida 100% compatível
- *Rollback:* Manter arquivo original até validação completa

**Performance degradada**
- *Mitigação:* Benchmarks antes/depois
- *Rollback:* Otimizações específicas se necessário

### 🟡 **Riscos Médios**
**Complexidade aumentada**
- *Mitigação:* Documentação clara e API simples
- *Rollback:* Simplificação se necessário

**Curva de aprendizado**
- *Mitigação:* Treinamento da equipe
- *Rollback:* Manter compatibilidade durante transição

## 📈 Métricas de Sucesso

### ✅ **Critérios de Aceitação**
- [ ] Hook principal com responsabilidade única
- [ ] Hooks especializados funcionando independentemente
- [ ] API 100% compatível com código existente
- [ ] Performance igual ou melhor
- [ ] Testes unitários implementados
- [ ] Documentação atualizada

### 📊 **Indicadores Técnicos**
- **Linhas de código:** 1363 → 1200 (mais organizadas)
- **Arquivos:** 1 → 4 (especializados)
- **Responsabilidades:** 9 → 1 por arquivo
- **Testabilidade:** Baixa → Alta
- **Manutenibilidade:** Baixa → Alta

## 🎯 Próximos Passos Imediatos

1. **Validar implementação** com testes básicos
2. **Migrar primeiro componente** como prova de conceito
3. **Executar benchmarks** de performance
4. **Iniciar migração gradual** dos componentes

## 🔗 Links Relacionados

### **Jira**
- [SUP-3: Refatorar useConcursos](https://claudio-vinicius.atlassian.net/browse/SUP-3)

### **Documentação**
- [Auditoria Módulo Concursos](./auditoria-modulo-concursos.json)
- [Plano de Refatoração Geral](./plano-refatoracao-modulo-concursos.md)

### **Dependências**
- ✅ SUP-1: Dependência circular resolvida
- ✅ SUP-2: Tipos consolidados

---

**Responsável:** Rovo Dev  
**Revisor:** Tech Lead  
**Prazo:** 3-5 dias  
**Prioridade:** Crítica 🔴