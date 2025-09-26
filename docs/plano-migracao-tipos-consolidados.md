# 🔄 Plano de Migração - Consolidação de Tipos Duplicados

**Issue:** SUP-2  
**Data:** 19/12/2024  
**Status:** Em Implementação  

---

## 🎯 Objetivo

Consolidar tipos duplicados entre `types/concursos.ts` e `types/simulados.ts`, eliminando confusão e inconsistências de dados através de uma hierarquia clara de tipos.

## 🚨 Problemas Identificados

### Tipos Duplicados
1. **`Simulado`** - Definido em ambos os arquivos com estruturas diferentes
2. **`SimulationResults` vs `SimuladoResultado`** - Mesma finalidade, estruturas similares
3. **Questões** - Estruturas similares em contextos diferentes

### Inconsistências
- **Nomenclatura:** snake_case vs camelCase
- **Campos opcionais:** Inconsistentes entre tipos similares
- **Relacionamentos:** Mapeamento confuso entre estruturas

## ✅ Solução Implementada

### 1. Nova Estrutura de Tipos
```
types/
├── base.ts              # Tipos base e interfaces fundamentais
├── index.ts             # Tipos consolidados e API unificada
├── concursos.ts         # DEPRECIADO - será removido
└── simulados.ts         # DEPRECIADO - será removido
```

### 2. Hierarquia Clara
```typescript
// Tipos base compartilhados
BaseEntity → UserEntity → Concurso
BaseEntity → UserEntity → Questao
BaseSimulationResult → SimuladoResultado
BaseSimulationResult → SimulationResults

// Contextos específicos
SimuladoDatabase (para banco de dados)
SimuladoRuntime (para execução)
```

### 3. Benefícios da Consolidação
- **Zero duplicação** de tipos
- **Hierarquia clara** com herança
- **Compatibilidade mantida** com código existente
- **Transformers** para conversão entre contextos
- **Type guards** para validação
- **API unificada** através de types/index.ts

## 📋 Plano de Migração

### 🔄 **FASE 1 - Criação da Nova Estrutura (CONCLUÍDA)**
- [x] Criar `types/base.ts` com tipos fundamentais
- [x] Criar `types/index.ts` com API consolidada
- [x] Implementar transformers e type guards
- [x] Documentar plano de migração

### 🔄 **FASE 2 - Migração Gradual dos Hooks (1-2 dias)**

#### Passo 2.1: Atualizar Imports Principais
```typescript
// ANTES
import type { Simulado } from "@/types/concursos"
import type { SimuladoResultado } from "@/types/simulados"

// DEPOIS
import type { SimuladoDatabase, SimuladoRuntime, SimuladoResultado } from "@/types"
```

#### Passo 2.2: Migrar Hooks Críticos
- [ ] `lib/concursos-context.tsx`
- [ ] `hooks/use-concursos-new.ts`
- [ ] `hooks/use-simulados-new.ts`
- [ ] `hooks/use-simulation-history.ts`
- [ ] `hooks/use-simulation-statistics.ts`

#### Passo 2.3: Atualizar Validações
- [ ] `utils/validations.ts` - Usar tipos específicos em vez de `any`

### 🔄 **FASE 3 - Migração de Componentes (1 dia)**
- [ ] Atualizar todos os componentes que importam tipos
- [ ] Verificar compatibilidade de interfaces
- [ ] Testar funcionalidade completa

### 🔄 **FASE 4 - Limpeza Final (0.5 dia)**
- [ ] Remover `types/concursos.ts`
- [ ] Remover `types/simulados.ts`
- [ ] Atualizar todos os imports para `types/index.ts`
- [ ] Validação final

## 🧪 Estratégia de Migração

### Migração Segura
1. **Manter arquivos antigos** durante a migração
2. **Migrar arquivo por arquivo** com testes
3. **Usar aliases de compatibilidade** quando necessário
4. **Validar funcionalidade** a cada etapa

### Compatibilidade
```typescript
// types/index.ts já inclui aliases para compatibilidade
export type Simulado = SimuladoDatabase | SimuladoRuntime
export type { SimuladoResultado, SimulationResults }
```

## 📊 Arquivos Afetados

### ✅ Criados
- [x] `types/base.ts`
- [x] `types/index.ts`
- [x] `docs/plano-migracao-tipos-consolidados.md`

### 🔄 Para Migrar
- [ ] `lib/concursos-context.tsx`
- [ ] `hooks/use-concursos.ts`
- [ ] `hooks/use-simulados.ts`
- [ ] `hooks/use-simulation-history.ts`
- [ ] `hooks/use-simulation-statistics.ts`
- [ ] `hooks/use-simulations.ts`
- [ ] `utils/validations.ts`
- [ ] `lib/competition-tests.ts`

### 🗑️ Para Remover (Fase 4)
- [ ] `types/concursos.ts`
- [ ] `types/simulados.ts`

## 🚧 Riscos e Mitigações

### 🔴 Riscos Altos
**Quebrar tipagem existente**
- *Mitigação:* Aliases de compatibilidade mantidos
- *Rollback:* Manter arquivos antigos até validação completa

**Conflitos de tipos**
- *Mitigação:* Migração gradual com testes em cada etapa
- *Rollback:* Reverter imports específicos se necessário

### 🟡 Riscos Médios
**Confusão durante migração**
- *Mitigação:* Documentação clara e comunicação com equipe
- *Rollback:* Guias de migração específicos

## 📈 Métricas de Sucesso

### ✅ Critérios de Aceitação
- [ ] Zero tipos duplicados
- [ ] Todos os imports funcionando
- [ ] Testes passando
- [ ] Funcionalidade preservada
- [ ] Código mais limpo e consistente

### 📊 Indicadores Técnicos
- [ ] Build sem erros de tipagem
- [ ] IntelliSense funcionando corretamente
- [ ] Imports consistentes
- [ ] Documentação atualizada

## 🔗 Comandos de Validação

### Verificar Tipagem
```bash
# Verificar erros de TypeScript
npx tsc --noEmit

# Verificar imports específicos
grep -r "from.*types/concursos" --include="*.ts" --include="*.tsx" .
grep -r "from.*types/simulados" --include="*.ts" --include="*.tsx" .
```

### Testes
```bash
# Executar testes de tipagem
npm run type-check

# Testes unitários
npm run test

# Build de produção
npm run build
```

## 📋 Checklist de Migração

### Fase 1 - Estrutura
- [x] ✅ Criar tipos base
- [x] ✅ Criar API consolidada
- [x] ✅ Implementar transformers
- [x] ✅ Documentar plano

### Fase 2 - Hooks
- [ ] ⏳ Migrar concursos-context.tsx
- [ ] ⏳ Migrar hooks principais
- [ ] ⏳ Atualizar validações
- [ ] ⏳ Testes de integração

### Fase 3 - Componentes
- [ ] ⏳ Migrar componentes
- [ ] ⏳ Verificar compatibilidade
- [ ] ⏳ Testes funcionais

### Fase 4 - Limpeza
- [ ] ⏳ Remover arquivos antigos
- [ ] ⏳ Atualizar imports
- [ ] ⏳ Validação final

## 🎯 Próximos Passos Imediatos

1. **Migrar `lib/concursos-context.tsx`** para usar tipos consolidados
2. **Atualizar hooks principais** com novos imports
3. **Testar funcionalidade** básica
4. **Continuar migração gradual**

---

**Responsável:** Rovo Dev  
**Revisor:** Tech Lead  
**Prazo:** 2-3 dias  
**Prioridade:** Alta 🔴