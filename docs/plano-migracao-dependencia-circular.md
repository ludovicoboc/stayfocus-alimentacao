# 🔄 Plano de Migração - Resolução de Dependência Circular

**Issue:** SUP-1  
**Data:** 19/12/2024  
**Status:** Em Implementação  

---

## 🎯 Objetivo

Resolver a dependência circular entre `useSimulados` e `useConcursos` implementando uma solução baseada em Context API que centraliza o estado compartilhado.

## 🚨 Problema Identificado

### Dependência Circular Atual
```
useSimulados.ts → useConcursos.ts
```

**Linha problemática:**
```typescript
// hooks/use-simulados.ts:5
import { useConcursos } from "@/hooks/use-concursos"

// hooks/use-simulados.ts:12
const { concursos } = useConcursos()

// hooks/use-simulados.ts:71-72
const concurso = concursos.find((c) => c.id === concursoId)
```

## ✅ Solução Implementada

### 1. Context API Centralizado
Criado `lib/concursos-context.tsx` que:
- Centraliza estado de concursos e simulados
- Elimina dependência circular
- Mantém cache otimizado
- Fornece hooks especializados

### 2. Hooks de Compatibilidade
Criados novos hooks que mantêm a API existente:
- `hooks/use-concursos-new.ts`
- `hooks/use-simulados-new.ts`

### 3. Estrutura da Solução
```
lib/concursos-context.tsx
├── ConcursosProvider (Context Provider)
├── useConcursosContext (Hook principal)
├── useConcursos (Hook compatível)
└── useSimulados (Hook compatível)

hooks/
├── use-concursos-new.ts (Wrapper do contexto)
├── use-simulados-new.ts (Wrapper do contexto)
├── use-concursos.ts (Original - será depreciado)
└── use-simulados.ts (Original - será depreciado)
```

## 📋 Plano de Migração Gradual

### 🔄 **FASE 1 - Setup e Testes (1-2 dias)**

#### Passo 1.1: Configurar Provider
- [x] Criar `lib/concursos-context.tsx`
- [x] Criar hooks de compatibilidade
- [ ] Adicionar ConcursosProvider ao layout principal
- [ ] Testes básicos de funcionamento

#### Passo 1.2: Validação
- [ ] Verificar se contexto está funcionando
- [ ] Testar hooks de compatibilidade
- [ ] Validar que não há regressões

### 🔄 **FASE 2 - Migração Gradual (2-3 dias)**

#### Passo 2.1: Migrar Componentes Críticos
Migrar componentes que usam ambos hooks:
- [ ] `app/concursos/page.tsx`
- [ ] `app/estudos/simulado/page.tsx`
- [ ] `components/concurso-card.tsx`

#### Passo 2.2: Migrar Hooks Dependentes
- [ ] `hooks/use-simulation-history.ts`
- [ ] `hooks/use-simulation-statistics.ts`
- [ ] Outros hooks que dependem dos principais

#### Passo 2.3: Atualizar Imports
```typescript
// ANTES
import { useConcursos } from "@/hooks/use-concursos"
import { useSimulados } from "@/hooks/use-simulados"

// DEPOIS
import { useConcursos } from "@/hooks/use-concursos-new"
import { useSimulados } from "@/hooks/use-simulados-new"
```

### 🔄 **FASE 3 - Finalização (1 dia)**

#### Passo 3.1: Limpeza
- [ ] Remover hooks originais
- [ ] Renomear hooks novos para nomes originais
- [ ] Atualizar todos os imports

#### Passo 3.2: Validação Final
- [ ] Testes de regressão completos
- [ ] Verificar performance
- [ ] Validar que dependência circular foi resolvida

## 🧪 Testes de Validação

### Testes Unitários
```typescript
// Testar que hooks não causam loops infinitos
describe('useConcursos', () => {
  it('should not cause infinite re-renders', () => {
    // Test implementation
  })
})

describe('useSimulados', () => {
  it('should work without useConcursos dependency', () => {
    // Test implementation
  })
})
```

### Testes de Integração
- [ ] Fluxo completo: criar concurso → gerar simulado → salvar resultado
- [ ] Verificar que dados são compartilhados corretamente
- [ ] Validar performance sem loops infinitos

## 📊 Arquivos Afetados

### ✅ Criados
- [x] `lib/concursos-context.tsx`
- [x] `hooks/use-concursos-new.ts`
- [x] `hooks/use-simulados-new.ts`
- [ ] `app/layout.tsx` (atualizado)

### 🔄 Para Migrar
- [ ] `app/concursos/page.tsx`
- [ ] `app/estudos/simulado/page.tsx`
- [ ] `components/concurso-card.tsx`
- [ ] `components/simulado-loader.tsx`
- [ ] Todos os componentes que usam os hooks

### 🗑️ Para Remover (Fase 3)
- [ ] `hooks/use-concursos.ts` (original)
- [ ] `hooks/use-simulados.ts` (original)

## 🚧 Riscos e Mitigações

### 🔴 Riscos Altos
**Quebrar funcionalidade existente**
- *Mitigação:* Migração gradual com testes em cada etapa
- *Rollback:* Manter hooks originais até validação completa

**Performance degradada**
- *Mitigação:* Benchmarks antes/depois da migração
- *Rollback:* Otimizações específicas no contexto

### 🟡 Riscos Médios
**Conflitos de estado**
- *Mitigação:* Testes de integração abrangentes
- *Rollback:* Isolamento de estados se necessário

**Complexidade aumentada**
- *Mitigação:* Documentação clara e treinamento da equipe
- *Rollback:* Simplificação da API se necessário

## 📈 Métricas de Sucesso

### ✅ Critérios de Aceitação
- [ ] Zero dependências circulares detectadas
- [ ] Todos os testes passando
- [ ] Performance igual ou melhor
- [ ] Funcionalidade preservada
- [ ] Código mais limpo e manutenível

### 📊 Indicadores Técnicos
- [ ] Bundle size não aumentou significativamente
- [ ] Tempo de renderização mantido ou melhorado
- [ ] Memory leaks eliminados
- [ ] Re-renders desnecessários eliminados

## 🔗 Comandos Úteis

### Verificar Dependências Circulares
```bash
# Instalar ferramenta de detecção
npm install -g madge

# Verificar dependências circulares
madge --circular --extensions ts,tsx ./hooks/
madge --circular --extensions ts,tsx ./lib/
```

### Testes de Performance
```bash
# Executar testes de performance
npm run test:performance

# Benchmark de hooks
npm run benchmark:hooks
```

### Validação de Build
```bash
# Build de produção
npm run build

# Verificar se não há erros
npm run lint
npm run type-check
```

## 📋 Checklist de Migração

### Fase 1 - Setup
- [x] ✅ Criar contexto centralizado
- [x] ✅ Criar hooks de compatibilidade
- [ ] 🔄 Adicionar provider ao layout
- [ ] ⏳ Testes básicos

### Fase 2 - Migração
- [ ] ⏳ Migrar componentes críticos
- [ ] ⏳ Atualizar imports
- [ ] ⏳ Testes de integração

### Fase 3 - Finalização
- [ ] ⏳ Remover código antigo
- [ ] ⏳ Validação final
- [ ] ⏳ Documentação atualizada

## 🎯 Próximos Passos Imediatos

1. **Adicionar ConcursosProvider ao layout principal**
2. **Criar testes básicos para validar funcionamento**
3. **Migrar primeiro componente como prova de conceito**
4. **Validar que não há regressões**

---

**Responsável:** Rovo Dev  
**Revisor:** Tech Lead  
**Prazo:** 3-5 dias  
**Prioridade:** Crítica 🔴