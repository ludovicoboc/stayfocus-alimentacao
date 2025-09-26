Atue como um arquiteto de software sênior especialista em Next.js 15 + Supabase + TypeScript. Sua missão é realizar uma auditoria completa e detalhada dos arquivos hooks, types e utils de um módulo específico da aplicação.

**CONTEXTO DA APLICAÇÃO:**
- Stack: Next.js 15 + Supabase + TypeScript
- Arquitetura: Hooks centralizados por módulo
- Desenvolvida via vibe coding com LLMs agênticas
- Objetivo: Padronização e identificação de inconsistências

**MÓDULO ALVO:** app/concursos

**INSTRUÇÕES DE AUDITORIA:**

## 🪝 1. ANÁLISE DE HOOKS

### 1.1 Identificação e Mapeamento
- Localize TODOS os hooks relacionados ao módulo
- Identifique hooks customizados vs hooks nativos do React
- Mapeie dependências entre hooks (qual hook usa qual)
- Verifique se seguem convenção de nomenclatura `use[Nome]`

### 1.2 Análise de Estrutura
Para cada hook identificado, analise:
- **Estados gerenciados**: Quais useState/useReducer existem?
- **Side effects**: Que useEffect/useCallback/useMemo são utilizados?
- **Retorno**: Qual a estrutura do objeto retornado?
- **Operações CRUD**: Quais operações com Supabase são realizadas?
- **Tratamento de erro**: Como erros são capturados e tratados?
- **Loading states**: Como é gerenciado o estado de carregamento?

### 1.3 Identificação de Problemas
- **Hooks duplicados**: Mesma funcionalidade em hooks diferentes
- **Responsabilidades misturadas**: Hook fazendo mais do que deveria
- **Estados inconsistentes**: Padrões diferentes de gerenciamento
- **Falta de cleanup**: useEffect sem cleanup adequado
- **Performance**: Dependências desnecessárias, re-renders excessivos
- **Nomenclatura**: Nomes não descritivos ou inconsistentes

---

## 📝 2. ANÁLISE DE TYPES

### 2.1 Identificação e Catalogação
- Localize TODOS os arquivos .types.ts relacionados ao módulo
- Identifique interfaces, types, enums utilizados
- Mapeie tipos importados de outros módulos
- Verifique tipos exportados para outros módulos

### 2.2 Análise de Definições
Para cada tipo identificado, analise:
- **Completude**: Todos os campos necessários estão tipados?
- **Consistência**: Nomenclatura segue padrão PascalCase?
- **Relacionamentos**: Como se relaciona com outros tipos?
- **Validação**: Há tipos para entrada vs saída de dados?
- **Flexibilidade**: Usa generics, unions, optionals adequadamente?

### 2.3 Identificação de Problemas
- **Tipos duplicados**: Mesma estrutura definida várias vezes
- **Any implícito**: Campos sem tipagem adequada
- **Inconsistência**: Mesma entidade tipada diferente em locais diferentes
- **Falta de tipos**: Dados importantes sem tipagem
- **Over-typing**: Tipagem excessivamente complexa desnecessariamente
- **Nomenclatura**: Nomes não descritivos ou sem padrão

---

## 🛠️ 3. ANÁLISE DE UTILS

### 3.1 Identificação e Catalogação
- Localize TODAS as funções utilitárias relacionadas ao módulo
- Identifique funções helpers, formatters, validators
- Mapeie dependências entre utils
- Verifique utils importados de bibliotecas externas

### 3.2 Análise de Funcionalidades
Para cada util identificado, analise:
- **Propósito**: O que a função faz exatamente?
- **Pureza**: É uma função pura (mesma entrada = mesma saída)?
- **Reutilização**: É usada em múltiplos lugares?
- **Testabilidade**: É facilmente testável?
- **Performance**: Há operações custosas desnecessárias?

### 3.3 Identificação de Problemas
- **Funções duplicadas**: Mesma lógica implementada várias vezes
- **Side effects**: Utils que não deveriam ter efeitos colaterais
- **Complexidade excessiva**: Funções fazendo muitas coisas
- **Falta de validação**: Inputs não validados
- **Nomenclatura**: Nomes não descritivos
- **Dependências**: Acoplamento desnecessário com outros módulos

---

## 📊 4. ANÁLISE DE RELACIONAMENTOS

### 4.1 Mapeamento de Interdependências
- Como hooks usam types?
- Como hooks usam utils?
- Como utils usam types?
- Há dependências circulares?
- Há acoplamento excessivo entre elementos?

### 4.2 Análise de Fluxo de Dados
- Trace o fluxo: Componente → Hook → Utils → Supabase
- Identifique transformações de dados no caminho
- Verifique se tipagem é mantida em todo fluxo
- Analise pontos de falha potencial

---

## 🎯 5. FORMATO DE RESPOSTA OBRIGATÓRIO

```json
{
  "modulo": "[NOME_DO_MODULO]",
  "data_auditoria": "[DATA_ATUAL]",
  
  "hooks": {
    "identificados": [
      {
        "nome": "string",
        "arquivo": "string",
        "responsabilidades": ["array", "de", "responsabilidades"],
        "estados_gerenciados": ["array", "de", "estados"],
        "operacoes_crud": ["array", "de", "operacoes"],
        "dependencias": ["array", "de", "dependencias"],
        "problemas_identificados": ["array", "de", "problemas"]
      }
    ],
    "problemas_gerais": ["array", "de", "problemas", "gerais"],
    "padroes_inconsistentes": ["array", "de", "inconsistencias"]
  },
  
  "types": {
    "identificados": [
      {
        "nome": "string",
        "arquivo": "string",
        "tipo": "interface|type|enum",
        "finalidade": "string",
        "campos": ["array", "de", "campos"],
        "relacionamentos": ["array", "de", "relacionamentos"],
        "problemas_identificados": ["array", "de", "problemas"]
      }
    ],
    "problemas_gerais": ["array", "de", "problemas", "gerais"],
    "tipos_duplicados": ["array", "de", "tipos", "duplicados"]
  },
  
  "utils": {
    "identificados": [
      {
        "nome": "string",
        "arquivo": "string",
        "finalidade": "string",
        "parametros": ["array", "de", "parametros"],
        "retorno": "string",
        "eh_pura": "boolean",
        "usado_em": ["array", "de", "locais"],
        "problemas_identificados": ["array", "de", "problemas"]
      }
    ],
    "problemas_gerais": ["array", "de", "problemas", "gerais"],
    "funcoes_duplicadas": ["array", "de", "funcoes", "duplicadas"]
  },
  
  "relacionamentos": {
    "hooks_types": {
      "como_se_relacionam": "string",
      "problemas": ["array", "de", "problemas"]
    },
    "hooks_utils": {
      "como_se_relacionam": "string", 
      "problemas": ["array", "de", "problemas"]
    },
    "utils_types": {
      "como_se_relacionam": "string",
      "problemas": ["array", "de", "problemas"]
    },
    "dependencias_circulares": ["array", "de", "dependencias", "circulares"],
    "acoplamento_excessivo": ["array", "de", "casos", "de", "acoplamento"]
  },
  
  "fluxo_dados": {
    "entrada": "como dados entram no modulo",
    "transformacoes": ["array", "de", "transformacoes"],
    "saida": "como dados saem do modulo",
    "pontos_falha": ["array", "de", "pontos", "de", "falha"]
  },
  
  "recomendacoes_prioritarias": [
    {
      "categoria": "hooks|types|utils|relacionamentos",
      "prioridade": "alta|media|baixa", 
      "problema": "string descrevendo o problema",
      "solucao_sugerida": "string com solução",
      "impacto": "string descrevendo impacto se não corrigido"
    }
  ],
  
  "metricas": {
    "total_hooks": "number",
    "total_types": "number", 
    "total_utils": "number",
    "nivel_complexidade": "baixo|medio|alto",
    "nivel_padronizacao": "baixo|medio|alto",
    "problemas_criticos": "number",
    "score_qualidade": "number de 0 a 100"
  }
}
```

---

## 🔍 6. INSTRUÇÕES ESPECÍFICAS DE BUSCA

### 6.1 Locais para Procurar Hooks:
- `hooks/use[ModuleName].ts`
- `hooks/use[ModuleName]*.ts`  
- Dentro de componentes (hooks inline)
- `lib/hooks/`
- `utils/hooks/`

### 6.2 Locais para Procurar Types:
- `types/[modulename].types.ts`
- `@/types/`
- Dentro dos próprios hooks (interfaces inline)
- `lib/types/`
- Imports de `database.types.ts` (Supabase)

### 6.3 Locais para Procurar Utils:
- `utils/[modulename].utils.ts`
- `lib/utils/`
- `helpers/`
- Funções dentro de hooks que deveriam ser utils
- `constants/`

---

## ⚠️ 7. CRITÉRIOS DE QUALIDADE

### 7.1 Hook de Qualidade:
- ✅ Responsabilidade única bem definida
- ✅ Estados e operações coesas
- ✅ Tratamento adequado de erros e loading
- ✅ Cleanup apropriado
- ✅ Performance otimizada
- ✅ Tipagem completa

### 7.2 Types de Qualidade:
- ✅ Nomenclatura consistente
- ✅ Estrutura bem definida
- ✅ Reutilização adequada
- ✅ Relacionamentos claros
- ✅ Validação apropriada

### 7.3 Utils de Qualidade:
- ✅ Função pura
- ✅ Responsabilidade única
- ✅ Testável independentemente
- ✅ Nomenclatura descritiva
- ✅ Performance adequada

---

## 🎯 8. EXEMPLOS DE PROBLEMAS A PROCURAR

### Hooks:
- `const [loading, setLoading] = useState(false)` sem uso
- `useEffect` sem array de dependências ou cleanup
- Estados duplicados em hooks diferentes
- Lógica de negócio misturada com lógica de apresentação

### Types:
- `any` sendo usado desnecessariamente
- Interfaces duplicadas com nomes diferentes
- Campos obrigatórios que deveriam ser opcionais
- Falta de tipos para respostas da API

### Utils:
- Funções que fazem múltiplas coisas não relacionadas
- Utils que dependem de estado do React
- Formatters que não são reutilizáveis
- Validadores inconsistentes

**IMPORTANTE:** Seja extremamente detalhado e específico. Esta auditoria é a base para a padronização completa do módulo.
