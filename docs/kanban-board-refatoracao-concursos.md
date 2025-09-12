# 📋 Board Kanban - Refatoração Módulo Concursos

**Data:** 19/12/2024  
**Projeto Jira:** SUP  
**Épico Principal:** SUP-8  
**Meta:** Score 45 → 80+ pontos

---

## 🎯 Configuração do Board Kanban

### 📌 **Filtro JQL para o Board**
```jql
project = SUP AND labels = "refatoracao-concursos" ORDER BY priority DESC, created ASC
```

### 🏊‍♂️ **Swimlanes Sugeridas**
1. **🔴 Crítico** - Issues com prioridade Highest
2. **🟡 Importante** - Issues com prioridade High/Medium  
3. **🟢 Melhorias** - Issues com prioridade Low
4. **📋 Tracking** - Épico e documentação

---

## 📊 Colunas do Board

### 1. 📥 **BACKLOG**
**Critério:** Status = "Aberto" AND não atribuído  
**Objetivo:** Issues aguardando priorização e atribuição

**Issues Atuais:**
- Todos os SUP-1 até SUP-7 estão aqui inicialmente

### 2. 🔄 **READY**
**Critério:** Status = "Aberto" AND atribuído  
**Objetivo:** Issues prontas para desenvolvimento

**Ações necessárias:**
- Atribuir desenvolvedor responsável
- Definir sprint/milestone
- Validar critérios de aceitação

### 3. 🚧 **IN PROGRESS**
**Critério:** Status = "Work in progress"  
**Objetivo:** Issues sendo desenvolvidas ativamente

**Limite WIP:** 3 issues (para evitar multitasking)

### 4. 🧪 **CODE REVIEW**
**Critério:** Status = "Pending" OR custom status  
**Objetivo:** Issues aguardando revisão de código

**Critérios para entrada:**
- Pull request criado
- Testes passando
- Documentação atualizada

### 5. ✅ **TESTING**
**Critério:** Custom status "Testing"  
**Objetivo:** Issues em teste de qualidade

**Critérios para entrada:**
- Code review aprovado
- Deploy em ambiente de teste
- Testes de regressão iniciados

### 6. 🎉 **DONE**
**Critério:** Status = "Concluído"  
**Objetivo:** Issues completamente finalizadas

**Critérios para entrada:**
- Todos os testes passando
- Deploy em produção
- Documentação atualizada
- Métricas de sucesso validadas

---

## 🏷️ Sistema de Labels

### **Labels de Categoria**
- `refatoracao-concursos` - Identifica todas as issues do projeto
- `critico` - Problemas que podem causar bugs
- `media` - Melhorias importantes
- `baixa` - Padronizações e otimizações
- `epico` - Issue de tracking principal

### **Labels de Fase**
- `fase-1` - Estabilização (1-2 sprints)
- `fase-2` - Refatoração (2-3 sprints)  
- `fase-3` - Otimização (1-2 sprints)

### **Labels Técnicas**
- `dependencia-circular` - Problemas de dependência
- `tipos-duplicados` - Issues de tipagem
- `hook-refactor` - Refatoração de hooks
- `type-safety` - Melhorias de tipagem
- `async-states` - Padronização de estados
- `abstraction` - Camadas de abstração
- `padronizacao` - Melhorias de código

---

## 📈 Work Items Organizados

### 🔴 **FASE 1 - ESTABILIZAÇÃO (Crítico)**

#### SUP-1: Resolver Dependência Circular
- **Prioridade:** Highest 🔴
- **Labels:** `critico`, `fase-1`, `dependencia-circular`
- **Estimativa:** 3-5 dias
- **Desenvolvedor:** Senior/Tech Lead
- **Dependências:** Nenhuma
- **Bloqueadores:** Nenhum

#### SUP-2: Consolidar Tipos Duplicados  
- **Prioridade:** Highest 🔴
- **Labels:** `critico`, `fase-1`, `tipos-duplicados`
- **Estimativa:** 2-3 dias
- **Desenvolvedor:** Mid/Senior
- **Dependências:** Pode ser paralelo ao SUP-1
- **Bloqueadores:** Nenhum

### 🟡 **FASE 2 - REFATORAÇÃO (Importante)**

#### SUP-3: Refatorar useConcursos
- **Prioridade:** Highest 🔴
- **Labels:** `critico`, `fase-2`, `hook-refactor`
- **Estimativa:** 5-8 dias
- **Desenvolvedor:** Senior
- **Dependências:** SUP-1, SUP-2
- **Bloqueadores:** Dependências circulares

#### SUP-4: Melhorar Tipagem de Utils
- **Prioridade:** Medium 🟡
- **Labels:** `media`, `fase-2`, `type-safety`
- **Estimativa:** 3-4 dias
- **Desenvolvedor:** Mid/Senior
- **Dependências:** SUP-2
- **Bloqueadores:** Tipos duplicados

#### SUP-5: Padronizar Estados Async
- **Prioridade:** Medium 🟡
- **Labels:** `media`, `fase-2`, `async-states`
- **Estimativa:** 2-3 dias
- **Desenvolvedor:** Mid
- **Dependências:** SUP-3
- **Bloqueadores:** Hook não refatorado

### 🟢 **FASE 3 - OTIMIZAÇÃO (Melhorias)**

#### SUP-6: Criar Abstração para Supabase
- **Prioridade:** Medium 🟡
- **Labels:** `media`, `fase-3`, `abstraction`
- **Estimativa:** 4-6 dias
- **Desenvolvedor:** Senior
- **Dependências:** SUP-3, SUP-5
- **Bloqueadores:** Hooks não refatorados

#### SUP-7: Melhorias de Padronização
- **Prioridade:** Low 🟢
- **Labels:** `baixa`, `fase-3`, `padronizacao`
- **Estimativa:** 2-3 dias
- **Desenvolvedor:** Mid
- **Dependências:** Todas as anteriores
- **Bloqueadores:** Refatoração não completa

### 📋 **TRACKING**

#### SUP-8: Épico Principal
- **Prioridade:** High 📋
- **Labels:** `epico`, `tracking`
- **Objetivo:** Acompanhar progresso geral
- **Status:** Sempre ativo

---

## 📊 Métricas do Board

### **Velocity Tracking**
- **Sprint 1:** SUP-1, SUP-2 (5-8 dias)
- **Sprint 2:** SUP-3 (5-8 dias)
- **Sprint 3:** SUP-4, SUP-5 (5-7 dias)
- **Sprint 4:** SUP-6 (4-6 dias)
- **Sprint 5:** SUP-7 (2-3 dias)

### **Burndown Esperado**
- **Semana 1:** 25% (SUP-1, SUP-2)
- **Semana 2:** 50% (SUP-3)
- **Semana 3:** 75% (SUP-4, SUP-5)
- **Semana 4:** 90% (SUP-6)
- **Semana 5:** 100% (SUP-7)

### **Indicadores de Qualidade**
- **Cycle Time:** < 5 dias por issue
- **Lead Time:** < 7 dias por issue
- **WIP Limit:** Máximo 3 issues em progresso
- **Blocked Time:** < 1 dia por issue

---

## 🚨 Alertas e Bloqueadores

### **Dependências Críticas**
1. **SUP-1 → SUP-3:** Dependência circular deve ser resolvida antes da refatoração
2. **SUP-2 → SUP-4:** Tipos duplicados devem ser consolidados antes da tipagem
3. **SUP-3 → SUP-5,6:** Hook principal deve ser refatorado primeiro

### **Riscos Identificados**
- **🔴 Alto:** SUP-1 pode quebrar funcionalidade existente
- **🟡 Médio:** SUP-3 pode impactar performance temporariamente
- **🟢 Baixo:** SUP-7 pode gerar conflitos de merge

### **Planos de Mitigação**
- **Feature flags** para rollback rápido
- **Testes abrangentes** antes de cada deploy
- **Branches pequenos** para reduzir conflitos
- **Code review obrigatório** para issues críticas

---

## 🎯 Configuração Manual do Board

### **Passo 1: Criar Board**
1. Ir para Jira → Boards → Create Board
2. Escolher "Kanban Board"
3. Nome: "Refatoração Módulo Concursos"
4. Filtro JQL: `project = SUP AND labels = "refatoracao-concursos"`

### **Passo 2: Configurar Colunas**
1. Board Settings → Columns
2. Adicionar colunas: Backlog, Ready, In Progress, Code Review, Testing, Done
3. Mapear status para colunas apropriadas

### **Passo 3: Configurar Swimlanes**
1. Board Settings → Swimlanes
2. Escolher "Queries"
3. Adicionar swimlanes por prioridade:
   - Crítico: `priority = Highest`
   - Importante: `priority in (High, Medium)`
   - Melhorias: `priority = Low`

### **Passo 4: Configurar WIP Limits**
1. Board Settings → Columns
2. Definir limite de 3 para "In Progress"
3. Definir limite de 2 para "Code Review"

### **Passo 5: Configurar Quick Filters**
1. Board Settings → Quick Filters
2. Adicionar filtros:
   - Fase 1: `labels = "fase-1"`
   - Fase 2: `labels = "fase-2"`
   - Fase 3: `labels = "fase-3"`
   - Crítico: `labels = "critico"`

---

## 📋 Checklist de Setup

### ✅ **Issues Organizadas**
- [x] SUP-1: Labels e prioridade configurados
- [x] SUP-2: Labels e prioridade configurados
- [x] SUP-3: Labels e prioridade configurados
- [x] SUP-4: Labels e prioridade configurados
- [x] SUP-5: Labels e prioridade configurados
- [x] SUP-6: Labels e prioridade configurados
- [x] SUP-7: Labels e prioridade configurados
- [x] SUP-8: Labels e prioridade configurados

### 🔄 **Próximos Passos**
- [ ] Criar board Kanban no Jira
- [ ] Configurar colunas e swimlanes
- [ ] Definir WIP limits
- [ ] Atribuir responsáveis
- [ ] Configurar automações
- [ ] Treinar equipe no board

### 📊 **Monitoramento**
- [ ] Dashboard de métricas
- [ ] Relatórios de velocity
- [ ] Alertas de bloqueadores
- [ ] Reviews semanais de progresso

---

## 🔗 Links Úteis

### **Jira Issues**
- [SUP-1: Dependência Circular](https://claudio-vinicius.atlassian.net/browse/SUP-1)
- [SUP-2: Tipos Duplicados](https://claudio-vinicius.atlassian.net/browse/SUP-2)
- [SUP-3: Refatorar useConcursos](https://claudio-vinicius.atlassian.net/browse/SUP-3)
- [SUP-4: Tipagem Utils](https://claudio-vinicius.atlassian.net/browse/SUP-4)
- [SUP-5: Estados Async](https://claudio-vinicius.atlassian.net/browse/SUP-5)
- [SUP-6: Abstração Supabase](https://claudio-vinicius.atlassian.net/browse/SUP-6)
- [SUP-7: Padronização](https://claudio-vinicius.atlassian.net/browse/SUP-7)
- [SUP-8: Épico Principal](https://claudio-vinicius.atlassian.net/browse/SUP-8)

### **Documentação**
- [Auditoria Completa](./auditoria-modulo-concursos.json)
- [Resumo Executivo](./auditoria-modulo-concursos-resumo.md)
- [Plano de Refatoração](./plano-refatoracao-modulo-concursos.md)

### **Board Kanban**
- URL será gerada após criação manual: `https://claudio-vinicius.atlassian.net/jira/software/c/projects/SUP/boards/[ID]`

---

**Documento mantido por:** Rovo Dev  
**Última atualização:** 19/12/2024  
**Próxima revisão:** 26/12/2024