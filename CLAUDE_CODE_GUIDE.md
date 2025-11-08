# 🤖 Guia: Desenvolvendo com Claude Code no VS Code

## 📖 O que é Claude Code?

**Claude Code** é uma ferramenta CLI da Anthropic que permite você trabalhar com o Claude diretamente do terminal, delegando tarefas de código de forma natural. É perfeito para desenvolvimento assistido por IA!

---

## 📦 Passo 1: Instalar Claude Code

### Pré-requisitos
- Node.js 18+ instalado
- VS Code instalado
- Conta Anthropic (ou chave de API)

### Instalação

```bash
# Instalar globalmente via npm
npm install -g @anthropic-ai/claude-code

# Verificar instalação
claude-code --version
```

---

## 🔑 Passo 2: Configurar API Key

### Opção A: Através do CLI

```bash
# O comando vai te guiar pela autenticação
claude-code auth
```

### Opção B: Variável de Ambiente

```bash
# Linux/Mac (adicione ao ~/.bashrc ou ~/.zshrc)
export ANTHROPIC_API_KEY="sua-chave-aqui"

# Windows PowerShell (adicione ao $PROFILE)
$env:ANTHROPIC_API_KEY="sua-chave-aqui"

# Windows CMD
set ANTHROPIC_API_KEY=sua-chave-aqui
```

### Obter API Key

1. Acesse: https://console.anthropic.com/
2. Vá em **API Keys**
3. Clique em **Create Key**
4. Copie e guarde a chave

---

## 🚀 Passo 3: Abrir Projeto no VS Code

```bash
# Navegue até o projeto
cd media-manager

# Abra no VS Code
code .
```

---

## 💻 Passo 4: Usar Claude Code

### Iniciar Sessão Interativa

```bash
# No terminal integrado do VS Code (Ctrl+` ou Cmd+`)
claude-code

# Ou especificando o diretório
claude-code --cwd .
```

Isso abre uma sessão interativa onde você pode conversar com o Claude e ele tem acesso aos arquivos do projeto!

---

## 🎯 Exemplos Práticos de Uso

### 1. Implementar Nova Feature

```bash
$ claude-code

You: Implementar a funcionalidade de importação de dispositivos USB.
Preciso detectar quando um dispositivo é conectado e escanear
os arquivos de mídia nele.

Claude: Vou implementar essa funcionalidade para você...
[Claude vai criar os arquivos necessários e explicar o que fez]
```

### 2. Adicionar Novo Plugin

```bash
You: Criar o plugin do Google Drive seguindo o padrão do S3 plugin.
Precisa incluir OAuth2 flow e upload de arquivos.

Claude: [Cria o arquivo google-drive-plugin.ts com toda implementação]
```

### 3. Corrigir Bugs

```bash
You: O upload de arquivos grandes está falhando. 
Revisar o código em backend/lambdas/api/upload-handler.ts
e implementar multipart upload.

Claude: [Analisa o código, identifica o problema e implementa a solução]
```

### 4. Adicionar Testes

```bash
You: Criar testes unitários para o S3 Plugin usando Jest.
Incluir testes para todos os métodos da interface.

Claude: [Cria arquivo de testes com cobertura completa]
```

### 5. Melhorar Documentação

```bash
You: Atualizar o README.md com instruções de como configurar
o Google Drive plugin quando ele estiver pronto.

Claude: [Atualiza a documentação]
```

### 6. Refatorar Código

```bash
You: Refatorar o componente MediaGrid.tsx para melhorar
a performance e adicionar lazy loading de imagens.

Claude: [Refatora o código mantendo a funcionalidade]
```

---

## 🛠️ Comandos Claude Code Úteis

### Modo Interativo (Recomendado)

```bash
# Iniciar sessão
claude-code

# Com diretório específico
claude-code --cwd ./backend

# Com modelo específico
claude-code --model claude-sonnet-4-5-20250929
```

### Modo One-Shot (Comando único)

```bash
# Executar um comando específico
claude-code "Adicionar validação de tipos de arquivo no upload"

# Executar e sair
claude-code --exec "Criar testes para o MediaCard component"
```

### Trabalhar com Arquivos Específicos

```bash
# Focar em arquivos específicos
claude-code --files "backend/lambdas/plugins/*.ts"

# Excluir arquivos
claude-code --ignore "node_modules,dist,build"
```

---

## 🎨 Integração com VS Code

### Terminal Integrado

1. Abra o terminal no VS Code: `Ctrl+` \` (ou `Cmd+` \` no Mac)
2. Execute `claude-code`
3. Trabalhe com Claude diretamente no VS Code!

### Extensões Úteis

Instale essas extensões para melhor experiência:

- **Error Lens** - Destaca erros inline
- **GitLens** - Melhor visualização do Git
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formatação de código
- **AWS Toolkit** - Trabalhar com serviços AWS

---

## 💡 Melhores Práticas

### 1. Seja Específico

❌ Ruim:
```
"Melhorar o código"
```

✅ Bom:
```
"Refatorar o MediaGrid.tsx para usar React.memo e 
useMemo nas operações pesadas. Adicionar PropTypes 
e melhorar a tipagem TypeScript."
```

### 2. Contextualize

```
"Estou implementando a feature de compartilhamento.
Preciso criar um novo endpoint na API que gere links
públicos com expiração. Usar o padrão dos outros 
endpoints em backend/lambdas/api/"
```

### 3. Peça Explicações

```
"Implementar autenticação OAuth2 para Google Drive
e explicar cada passo da implementação"
```

### 4. Solicite Testes

```
"Adicionar testes unitários para a função que acabou
de criar, com cobertura de casos de sucesso e erro"
```

### 5. Revise o Código

```
"Revisar o código do plugin que acabou de criar
e sugerir melhorias de performance e segurança"
```

---

## 🎯 Workflows Recomendados

### Feature Completa (30-60min)

```bash
# 1. Planejar
You: Quero implementar a análise de imagens com AWS Rekognition.
Me ajude a planejar a arquitetura dessa feature.

# 2. Implementar Backend
You: Criar a Lambda function para análise de imagens com Rekognition.
Incluir extração de labels, faces e texto.

# 3. Atualizar Schema
You: Atualizar o schema do DynamoDB para incluir os dados de análise AI.

# 4. Criar API
You: Criar endpoint GET /media/{id}/ai-analysis e 
POST /media/{id}/analyze

# 5. Implementar Frontend
You: Criar componente React para exibir os resultados da análise AI.

# 6. Adicionar Testes
You: Criar testes unitários e de integração para a feature de análise.

# 7. Documentar
You: Atualizar a documentação com a nova feature de análise AI.
```

### Debug de Problema

```bash
# 1. Descrever o problema
You: Os thumbnails não estão sendo gerados para vídeos.
Quando faço upload de um .mp4, o processo falha.

# 2. Claude analisa
Claude: [Analisa os logs e código]

# 3. Implementar fix
You: Implementar a solução que você sugeriu

# 4. Testar
You: Adicionar testes para garantir que vídeos sejam processados corretamente
```

### Code Review

```bash
You: Revisar o código em backend/lambdas/plugins/google-drive-plugin.ts
Verificar:
- Segurança (tokens, secrets)
- Performance (uploads grandes)
- Error handling
- Code style
- Testes necessários
```

---

## 📂 Estrutura de Trabalho Sugerida

### Organizar por Features

```
1. Terminal 1: claude-code (sessão principal)
2. Terminal 2: npm run dev (frontend)
3. Terminal 3: aws logs tail (monitorar Lambda)
4. Terminal 4: git (version control)
```

### VS Code Layout

```
┌─────────────────────────────────────┐
│  Editor Principal                    │
│  (código que está desenvolvendo)     │
├──────────────┬──────────────────────┤
│  Terminal 1  │  Terminal 2          │
│  claude-code │  npm run dev         │
└──────────────┴──────────────────────┘
```

---

## 🔥 Dicas Pro

### 1. Use Contexto do Projeto

Claude Code já tem acesso aos arquivos do projeto. Você pode referenciar:

```bash
You: Olhe o arquivo backend/schemas/dynamodb-schema.md
e crie uma nova tabela seguindo o mesmo padrão para
armazenar comentários em mídias.
```

### 2. Trabalhe Iterativamente

```bash
You: Criar estrutura básica do plugin Dropbox

[Claude cria]

You: Agora implementar o método syncMedia

[Claude implementa]

You: Adicionar tratamento de erros e retry logic

[Claude adiciona]
```

### 3. Peça Alternativas

```bash
You: Me dê 3 opções de como implementar o cache de thumbnails.
Pros e contras de cada uma.
```

### 4. Aprenda com Claude

```bash
You: Explicar o padrão de design usado no sistema de plugins
e por que é uma boa escolha para este projeto.
```

### 5. Use para Pesquisa

```bash
You: Qual a melhor forma de implementar upload resumable
no AWS S3? Mostrar exemplo de código.
```

---

## 🚫 Limitações

### O que Claude Code PODE fazer:
- ✅ Criar e editar arquivos
- ✅ Analisar código existente
- ✅ Sugerir arquiteturas
- ✅ Escrever testes
- ✅ Debugar problemas
- ✅ Refatorar código
- ✅ Explicar conceitos

### O que Claude Code NÃO PODE fazer:
- ❌ Executar comandos arbitrários
- ❌ Fazer deploy direto
- ❌ Acessar sua conta AWS
- ❌ Fazer commits no Git (você faz isso)
- ❌ Instalar pacotes (você faz npm install)

---

## 📊 Monitorando Uso

```bash
# Ver histórico de sessões
claude-code history

# Ver uso de tokens
claude-code usage

# Limpar histórico
claude-code clear
```

---

## 🎓 Recursos de Aprendizado

- **Docs Oficiais**: https://docs.claude.com/claude-code
- **Exemplos**: https://github.com/anthropics/claude-code-examples
- **Community**: Discord da Anthropic

---

## 🎯 Próximos Passos

### Sessão de Setup Inicial

```bash
# 1. Abrir projeto
cd media-manager
code .

# 2. Instalar dependências
npm install # no backend
cd frontend && npm install

# 3. Iniciar Claude Code
claude-code

# 4. Primeira tarefa
You: Vou começar implementando a importação de dispositivos.
Me ajude a planejar a arquitetura dessa feature considerando
o que já existe no projeto.
```

### Primeiras Features Recomendadas

1. **Importação de Dispositivos** (Médio)
2. **Plugin Google Drive** (Médio)
3. **Análise com IA** (Fácil - usa Rekognition)
4. **Editor de Imagens** (Difícil)
5. **Compartilhamento** (Médio)

---

## 💬 Exemplo de Sessão Completa

```bash
$ claude-code

You: Olá! Vou começar a desenvolver a feature de análise de 
imagens com AWS Rekognition. Primeiro, me ajude a entender 
a arquitetura atual revisando os arquivos em backend/lambdas/.

Claude: [Analisa a estrutura e explica]

You: Ótimo! Agora crie a Lambda function para análise de imagens.
Deve usar Rekognition para detectar labels, faces e texto.
Siga o padrão dos outros processadores.

Claude: [Cria o arquivo processor/analyze-media.ts]

You: Perfeito! Agora atualizar o schema do DynamoDB para 
incluir os campos de análise AI. Adicionar na tabela MediaItems.

Claude: [Atualiza dynamodb-schema.md]

You: Ótimo! Criar os endpoints da API:
- GET /media/{id}/ai-features
- POST /media/{id}/analyze

Claude: [Cria api/ai-analysis.ts]

You: Agora adicionar essa Lambda no CDK stack.

Claude: [Atualiza infrastructure/media-manager-stack.ts]

You: Excelente! Criar testes unitários para o processador.

Claude: [Cria __tests__/analyze-media.test.ts]

You: Por fim, atualizar o README.md com a nova feature.

Claude: [Atualiza README.md]

You: Revisar todo o código que criamos e sugerir melhorias.

Claude: [Faz code review e sugere otimizações]

You: Implementar as melhorias sugeridas.

Claude: [Aplica as melhorias]

You: Perfeito! Obrigado. Vou fazer commit e testar.
```

---

## 🎉 Pronto para Começar!

Agora você tem tudo que precisa para desenvolver o Media Manager 
com a ajuda do Claude Code!

**Boa codificação! 🚀**

---

## ❓ FAQ

**P: Preciso pagar para usar Claude Code?**
R: Sim, você precisa de créditos da API da Anthropic. Consulte preços em anthropic.com/pricing

**P: Claude Code substitui o GitHub Copilot?**
R: Não, são complementares! Copilot ajuda com autocompletar, Claude Code com tarefas maiores.

**P: Posso usar com outros editores?**
R: Sim! Claude Code é CLI, funciona com qualquer editor.

**P: É seguro? Claude vê meu código?**
R: Sim, é seguro. Claude só acessa o que você explicitamente compartilha na sessão.

**P: Funciona offline?**
R: Não, precisa de conexão com a API da Anthropic.
