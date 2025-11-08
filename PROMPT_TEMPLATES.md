# 📝 Templates de Prompts para Claude Code

Este arquivo contém prompts prontos para usar com Claude Code no desenvolvimento do Media Manager.

---

## 🎯 Implementação de Features

### Nova Feature Completa

```
Vou implementar a feature de [NOME DA FEATURE].

Contexto:
- [Descrever o que a feature faz]
- [Requisitos principais]
- [Integrações necessárias]

Por favor:
1. Sugerir a arquitetura (backend + frontend)
2. Listar os arquivos que precisam ser criados/modificados
3. Identificar dependências necessárias
4. Criar um plano de implementação passo a passo

Depois implementaremos juntos seguindo o plano.
```

### Novo Plugin

```
Criar um novo plugin para [SERVIÇO] (ex: Google Drive, Dropbox).

Requisitos:
- Seguir o padrão da interface DestinationPlugin
- Implementar autenticação [OAuth2/API Key]
- Suportar upload de arquivos
- Suportar [listar outras funcionalidades]

Referência: backend/lambdas/plugins/s3-plugin.ts

Incluir:
- Implementação completa do plugin
- Tratamento de erros robusto
- Testes unitários
- Documentação de configuração
```

### Nova Lambda Function

```
Criar uma nova Lambda function para [PROPÓSITO].

Detalhes:
- Trigger: [S3, API Gateway, EventBridge, etc]
- Input: [descrever]
- Output: [descrever]
- Integrações: [DynamoDB, S3, outros serviços]

Padrão de referência: backend/lambdas/[arquivo-referencia].ts

Incluir:
- TypeScript types
- Error handling
- Logging adequado
- Métricas/observabilidade
```

### Novo Componente React

```
Criar componente React [NOME_COMPONENTE] para [PROPÓSITO].

Funcionalidades:
- [Listar funcionalidades]

Props esperadas:
- [Listar props]

Requisitos:
- TypeScript
- Tailwind CSS para estilização
- Responsivo (mobile + desktop)
- Hooks adequados (useState, useEffect, etc)
- Performance otimizada

Referência: frontend/src/components/[componente-similar].tsx
```

---

## 🐛 Debug e Correção

### Investigar Bug

```
Estou tendo um problema: [DESCREVER O PROBLEMA]

Comportamento esperado:
- [O que deveria acontecer]

Comportamento atual:
- [O que está acontecendo]

Contexto:
- Arquivos relacionados: [listar]
- Logs de erro: [colar logs se houver]
- Passos para reproduzir: [listar]

Por favor:
1. Analisar os arquivos relacionados
2. Identificar a causa raiz
3. Sugerir uma solução
4. Implementar a correção
5. Adicionar testes para prevenir regressão
```

### Performance Issue

```
Estou tendo problemas de performance em [COMPONENTE/FUNCAO].

Métricas atuais:
- [Tempo de resposta, uso de memória, etc]

Métricas desejadas:
- [Target de performance]

Por favor:
1. Analisar o código atual
2. Identificar gargalos
3. Sugerir otimizações
4. Implementar melhorias
5. Adicionar benchmarks/testes de performance
```

---

## 🔄 Refatoração

### Refatorar Código

```
Refatorar [ARQUIVO/COMPONENTE/MÓDULO].

Objetivos:
- [ ] Melhorar legibilidade
- [ ] Reduzir complexidade
- [ ] Melhorar performance
- [ ] Adicionar type safety
- [ ] Seguir best practices

Manter:
- Funcionalidade existente (sem breaking changes)
- Interface pública
- Testes passando

Adicionar:
- Documentação inline
- JSDoc/TSDoc
```

### Modernizar Código

```
Modernizar o código em [ARQUIVO] usando as práticas mais
atuais de [React/Node.js/TypeScript].

Aplicar:
- Hooks modernos (se React)
- Async/await em vez de callbacks
- Optional chaining (?.)
- Nullish coalescing (??)
- Template literals
- Destructuring
- Arrow functions onde apropriado

Melhorar type safety e remover any types.
```

---

## 🧪 Testes

### Adicionar Testes

```
Criar testes para [ARQUIVO/COMPONENTE].

Cobertura necessária:
- [ ] Testes unitários para todas as funções públicas
- [ ] Casos de sucesso
- [ ] Casos de erro
- [ ] Edge cases
- [ ] Mocks de dependências externas

Framework: Jest
Pattern: Arrange-Act-Assert

Referência: [arquivo-teste-similar].test.ts
```

### Testes de Integração

```
Criar testes de integração para o fluxo de [FLUXO].

Cenários:
1. [Cenário 1]
2. [Cenário 2]
3. [Cenário 3]

Incluir:
- Setup de ambiente de teste
- Mocks de serviços AWS
- Limpeza de recursos
- Asserções completas
```

---

## 📚 Documentação

### Documentar Feature

```
Documentar a feature [NOME] que acabamos de implementar.

Incluir:
1. Visão geral da funcionalidade
2. Arquitetura (diagrama se possível)
3. Como usar (exemplos de código)
4. Configuração necessária
5. APIs/endpoints
6. Troubleshooting comum

Atualizar:
- README.md
- docs/[arquivo-relevante].md
- Comentários no código (JSDoc)
```

### Documentar API

```
Criar documentação completa para os endpoints da API
em [ARQUIVO].

Para cada endpoint incluir:
- Método HTTP e path
- Parâmetros (path, query, body)
- Headers necessários
- Autenticação
- Request example
- Response example (sucesso e erro)
- Status codes possíveis
- Rate limits (se aplicável)

Formato: OpenAPI/Swagger ou Markdown
```

---

## 🏗️ Arquitetura

### Design de Sistema

```
Preciso implementar [FUNCIONALIDADE COMPLEXA].

Requisitos:
- [Requisito 1]
- [Requisito 2]
- [Requisitos não-funcionais: performance, escalabilidade, etc]

Por favor:
1. Propor 2-3 arquiteturas diferentes
2. Comparar pros/cons de cada uma
3. Recomendar a melhor opção
4. Criar diagrama/descrição detalhada
5. Listar serviços AWS necessários
6. Estimar custos
```

### Code Review

```
Fazer code review completo de [ARQUIVO/PR/FEATURE].

Aspectos a revisar:
- [ ] Corretude e funcionalidade
- [ ] Qualidade do código
- [ ] Performance
- [ ] Segurança
- [ ] Type safety
- [ ] Error handling
- [ ] Testes
- [ ] Documentação
- [ ] Boas práticas
- [ ] Possíveis bugs

Sugerir melhorias concretas com exemplos de código.
```

---

## 🔐 Segurança

### Security Audit

```
Auditar segurança de [COMPONENTE/FEATURE].

Verificar:
- [ ] Validação de inputs
- [ ] Sanitização de dados
- [ ] Autenticação e autorização
- [ ] Gestão de secrets/credenciais
- [ ] SQL injection (se aplicável)
- [ ] XSS (se aplicável)
- [ ] CSRF (se aplicável)
- [ ] Rate limiting
- [ ] Logging de eventos sensíveis

Identificar vulnerabilidades e propor correções.
```

---

## 📊 Análise

### Análise de Código

```
Analisar o código em [ARQUIVO/DIRETÓRIO].

Métricas a calcular:
- Complexidade ciclomática
- Duplicação de código
- Cobertura de testes
- Linhas de código
- Número de dependências

Identificar:
- Code smells
- Anti-patterns
- Oportunidades de refatoração
- Riscos técnicos
```

### Análise de Dependências

```
Analisar as dependências do projeto.

Verificar:
- [ ] Versões desatualizadas
- [ ] Vulnerabilidades conhecidas
- [ ] Dependências não utilizadas
- [ ] Conflitos de versão
- [ ] Licenças problemáticas
- [ ] Tamanho do bundle

Sugerir atualizações e limpezas.
```

---

## 🎨 UI/UX

### Melhorar UI

```
Melhorar a interface do componente [COMPONENTE].

Objetivos:
- [ ] Melhor usabilidade
- [ ] Design mais moderno
- [ ] Responsividade
- [ ] Acessibilidade (a11y)
- [ ] Feedback visual
- [ ] Loading states
- [ ] Error states

Manter:
- Funcionalidade existente
- Paleta de cores atual (ou sugerir nova)
```

---

## 🚀 Deploy e CI/CD

### Setup CI/CD

```
Configurar CI/CD para o projeto usando GitHub Actions.

Pipeline necessário:
- [ ] Lint (ESLint)
- [ ] Type check (TypeScript)
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Build
- [ ] Deploy (staging e production)
- [ ] Notificações

Branches:
- main → production
- develop → staging
- feature/* → CI apenas

Criar arquivo .github/workflows/ci.yml
```

---

## 💡 Dicas de Uso

### Como Usar Estes Templates

1. **Copie o template** que mais se adequa à sua necessidade
2. **Preencha os campos** entre [COLCHETES]
3. **Cole no Claude Code** e pressione Enter
4. **Trabalhe iterativamente** com o Claude
5. **Revise o resultado** e solicite ajustes se necessário

### Customização

Sinta-se livre para:
- Adicionar mais detalhes
- Combinar múltiplos templates
- Criar seus próprios templates
- Adaptar para seu estilo de trabalho

### Próximos Passos Após Implementação

Sempre lembre de:
```bash
# 1. Testar localmente
npm test

# 2. Commit
git add .
git commit -m "Add: [descrição]"

# 3. Push
git push

# 4. Documentar
# Atualizar docs se necessário
```

---

## 📌 Templates Salvos (Seus Favoritos)

Adicione aqui seus prompts favoritos ou mais usados:

### [Seu Template 1]
```
[Seu prompt personalizado]
```

### [Seu Template 2]
```
[Seu prompt personalizado]
```

---

**Bora codar com Claude Code! 🚀**
