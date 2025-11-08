# ⚡ Quick Start: VS Code + Claude Code

Este guia te leva de zero a desenvolvendo em **menos de 10 minutos**!

---

## 🎯 Checklist Rápido

- [ ] Node.js 18+ instalado
- [ ] VS Code instalado
- [ ] Git configurado
- [ ] Conta Anthropic (para Claude Code)

---

## 🚀 5 Passos para Começar

### 1️⃣ Abrir Projeto (30 segundos)

```bash
# Extrair o projeto
unzip media-manager-project.zip
cd media-manager

# Abrir no VS Code
code .
```

### 2️⃣ Instalar Extensões (1 minuto)

O VS Code vai sugerir automaticamente. Clique em **"Install All"** ou:

1. Pressione `Ctrl+Shift+X` (ou `Cmd+Shift+X` no Mac)
2. Instale estas essenciais:
   - **ESLint** (dbaeumer.vscode-eslint)
   - **Prettier** (esbenp.prettier-vscode)
   - **Tailwind CSS** (bradlc.vscode-tailwindcss)
   - **Error Lens** (usernamehw.errorlens)
   - **AWS Toolkit** (amazonwebservices.aws-toolkit-vscode)

### 3️⃣ Instalar Dependências (2 minutos)

**Opção A: Usar Task do VS Code**
1. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P`)
2. Digite: `Tasks: Run Task`
3. Selecione: `📦 Install All Dependencies`

**Opção B: Terminal Manual**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4️⃣ Configurar Claude Code (1 minuto)

```bash
# Instalar
npm install -g @anthropic-ai/claude-code

# Configurar
claude-code auth
```

Siga as instruções para autenticar com sua conta Anthropic.

### 5️⃣ Começar a Desenvolver! (30 segundos)

**Opção A: Via Task (Recomendado)**
1. `Ctrl+Shift+P` → `Tasks: Run Task`
2. Selecione: `🤖 Start Claude Code`

**Opção B: Terminal**
```bash
# Abrir terminal integrado
Ctrl+` (ou Cmd+` no Mac)

# Iniciar Claude Code
claude-code
```

**Pronto! 🎉** Você está pronto para desenvolver!

---

## 💻 Layout Recomendado do VS Code

### Setup de 3 Painéis

```
┌────────────────────────────────────────────┐
│  Explorer  │  Editor Principal             │
│  (Ctrl+B)  │  (seus arquivos)              │
│            │                               │
│  📁 backend│  codigo-atual.ts              │
│  📁 frontend│                              │
│  📁 docs   │                               │
│  📄 README │                               │
├────────────┴───────────────────────────────┤
│  Terminal 1: Claude Code                   │
│  Terminal 2: npm run dev (frontend)        │
│  Terminal 3: logs AWS                      │
└────────────────────────────────────────────┘
```

**Como configurar:**
1. Barra lateral: `Ctrl+B`
2. Terminal: `Ctrl+\`` (backtick)
3. Dividir terminal: Clique no `+` dropdown → Split

---

## 🎯 Seu Primeiro Comando com Claude Code

Cole este prompt no Claude Code:

```
Olá! Sou novo neste projeto Media Manager. 
Pode me dar um tour pela estrutura do projeto e 
explicar brevemente cada pasta principal?

Depois, me ajude a planejar a implementação da 
feature de importação de dispositivos USB.
```

Claude vai:
1. ✅ Analisar a estrutura do projeto
2. ✅ Explicar cada componente
3. ✅ Sugerir arquitetura para a nova feature
4. ✅ Criar um plano de implementação

---

## ⌨️ Atalhos Essenciais do VS Code

### Navegação
- `Ctrl+P` - Buscar arquivo
- `Ctrl+Shift+F` - Buscar em todos os arquivos
- `Ctrl+G` - Ir para linha
- `Alt+←/→` - Navegar histórico

### Edição
- `Ctrl+D` - Selecionar próxima ocorrência
- `Alt+↑/↓` - Mover linha
- `Shift+Alt+↑/↓` - Copiar linha
- `Ctrl+/` - Comentar linha

### Terminal
- `Ctrl+\`` - Abrir/fechar terminal
- `Ctrl+Shift+\`` - Novo terminal
- `Ctrl+Tab` - Alternar terminais

### Tasks
- `Ctrl+Shift+P` → `Tasks: Run Task`
- Escolha a task que quiser executar

---

## 🛠️ Tasks Úteis Configuradas

Acesse via `Ctrl+Shift+P` → `Tasks: Run Task`:

- **📦 Install All Dependencies** - Instala tudo
- **🚀 Start Frontend Dev Server** - Inicia frontend
- **☁️ CDK Deploy** - Deploy na AWS
- **🤖 Start Claude Code** - Inicia Claude Code
- **🧹 Clean All** - Limpa node_modules e builds
- **🔍 Lint Frontend** - Executa linter

---

## 🎨 Temas Recomendados (Opcional)

```bash
# No VS Code, pressione Ctrl+K Ctrl+T para mudar tema

Temas populares:
- One Dark Pro
- Dracula Official
- Night Owl
- GitHub Dark
- Material Theme
```

---

## 📚 Próximos Passos

### 1. Explorar o Código (5 minutos)
```
📂 Arquivos importantes para começar:
├── README.md                    # Visão geral
├── GETTING_STARTED.md           # Setup inicial
├── CLAUDE_CODE_GUIDE.md         # Como usar Claude Code
├── PROMPT_TEMPLATES.md          # Prompts prontos
├── backend/
│   ├── infrastructure/          # AWS CDK
│   └── lambdas/                # Funções Lambda
└── frontend/
    └── src/                    # Código React
```

### 2. Primeira Feature (30 minutos)

**Com Claude Code:**
```
Vamos implementar a detecção de dispositivos USB conectados.

Requisitos:
- Detectar quando um dispositivo é conectado
- Listar arquivos de mídia no dispositivo
- Permitir seleção de arquivos para importar

Qual a melhor abordagem para isso?
```

### 3. Testar Localmente (10 minutos)

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend (se testar localmente)
cd backend
# (Geralmente testamos direto na AWS)

# Terminal 3: Claude Code
claude-code
```

Acesse: http://localhost:5173

### 4. Deploy na AWS (10 minutos)

```bash
cd backend

# Primeira vez
npm run cdk bootstrap

# Deploy
npm run deploy
```

---

## 🆘 Troubleshooting Rápido

### Claude Code não inicia
```bash
# Verificar instalação
claude-code --version

# Reinstalar se necessário
npm install -g @anthropic-ai/claude-code

# Verificar autenticação
claude-code auth
```

### Erro "Cannot find module"
```bash
# Reinstalar dependências
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Frontend não inicia
```bash
cd frontend

# Limpar e reinstalar
rm -rf node_modules
npm install

# Iniciar
npm run dev
```

### ESLint/Prettier não funcionam
1. Reload VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`
2. Verifique se extensões estão instaladas
3. Verifique `settings.json` está correto

---

## 💡 Dicas Pro

### 1. Multi-cursor
`Alt+Click` em vários lugares para editar simultaneamente

### 2. Snippets
Digite `cl` → Tab = `console.log()`
Digite `imp` → Tab = `import ... from ...`

### 3. Bracket Pair Colorizer
Já configurado! Colchetes coloridos para facilitar leitura

### 4. Auto Import
TypeScript/JavaScript importam automaticamente quando você usa

### 5. Git Integration
- Ver mudanças: `Ctrl+Shift+G`
- Commit: Digite mensagem e `Ctrl+Enter`
- Push: Clique no ícone de sync

---

## 🎓 Recursos de Aprendizado

### VS Code
- Docs oficiais: https://code.visualstudio.com/docs
- Atalhos: https://code.visualstudio.com/shortcuts

### Claude Code
- Guia completo: `CLAUDE_CODE_GUIDE.md` neste projeto
- Prompts prontos: `PROMPT_TEMPLATES.md`

### Projeto
- Arquitetura: `README.md`
- Deploy: `docs/DEPLOYMENT.md`
- Plugins: `docs/PLUGIN_DEVELOPMENT.md`
- Roadmap: `docs/ROADMAP.md`

---

## ✅ Checklist de Setup Completo

Marque conforme avança:

- [ ] VS Code aberto no projeto
- [ ] Extensões recomendadas instaladas
- [ ] Dependências instaladas (backend + frontend)
- [ ] Claude Code instalado e autenticado
- [ ] Terminal integrado funcionando
- [ ] Primeiro comando com Claude executado
- [ ] Frontend rodando localmente
- [ ] Git configurado

**Tudo marcado? Você está pronto! 🚀**

---

## 🎯 Sua Primeira Sessão (Sugestão de 1 hora)

```
[00:00-00:10] Setup e configuração
[00:10-00:20] Explorar código com Claude
[00:20-00:50] Implementar primeira feature
[00:50-01:00] Commit e push para Git
```

---

**Pronto para começar? Bora codar! 🚀**

Dúvidas? Pergunte ao Claude Code! Ele conhece todo o projeto.
