# 🚀 Guia: Como Subir o Projeto para o Git

## Opção 1: Script Automático (Linux/Mac) ⚡

**Mais rápido e fácil!**

```bash
# 1. Baixe e extraia o projeto
cd media-manager

# 2. Torne o script executável
chmod +x setup-git.sh

# 3. Execute o script
./setup-git.sh
```

O script vai te guiar pelo processo! 🎯

---

## Opção 2: Manual (Windows/Linux/Mac) 📝

### Passo 1: Criar Repositório

1. Acesse [GitHub](https://github.com) (ou GitLab/Bitbucket)
2. Clique em **"New repository"**
3. Nome: `media-manager`
4. **NÃO** marque "Initialize with README"
5. Clique em **"Create repository"**
6. **Copie a URL** do repositório

### Passo 2: Configurar Git Local

Abra o terminal/cmd no diretório do projeto:

```bash
# Windows: Abra PowerShell ou Git Bash
# Mac/Linux: Abra Terminal

cd media-manager

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "🎉 Initial commit - Media Manager"

# Adicionar repositório remoto (substitua pela SUA URL)
git remote add origin https://github.com/SEU-USUARIO/media-manager.git

# Renomear branch para main
git branch -M main

# Fazer push
git push -u origin main
```

### Passo 3: Autenticação

#### GitHub (requer Personal Access Token)

1. Vá em: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Dê um nome: "Media Manager"
4. Marque: `repo` (todos os sub-itens)
5. Clique em **"Generate token"**
6. **COPIE o token** (você não verá ele novamente!)

Quando o Git pedir credenciais:
- **Username**: seu usuário do GitHub
- **Password**: cole o token (não sua senha!)

#### GitLab/Bitbucket

Use seu usuário e senha normalmente.

---

## Opção 3: GitHub Desktop (Interface Gráfica) 🖱️

**Mais fácil para quem não gosta de terminal!**

### Passo 1: Instalar GitHub Desktop

- Download: https://desktop.github.com/
- Instale e faça login com sua conta GitHub

### Passo 2: Adicionar Projeto

1. No GitHub Desktop, clique **"File" > "Add Local Repository"**
2. Selecione a pasta `media-manager`
3. Clique em **"Create a repository"**

### Passo 3: Fazer Commit

1. Veja todos os arquivos listados
2. Escreva uma mensagem: "Initial commit"
3. Clique em **"Commit to main"**

### Passo 4: Publicar

1. Clique em **"Publish repository"**
2. Escolha um nome: `media-manager`
3. **Desmarque** "Keep this code private" (se quiser público)
4. Clique em **"Publish Repository"**

**Pronto! 🎉**

---

## Opção 4: VS Code (para quem usa VS Code) 💻

### Passo 1: Abrir Projeto

1. Abra o VS Code
2. **File > Open Folder**
3. Selecione a pasta `media-manager`

### Passo 2: Inicializar Git

1. Clique no ícone **Source Control** (Ctrl+Shift+G)
2. Clique em **"Initialize Repository"**

### Passo 3: Fazer Commit

1. Digite a mensagem: "Initial commit"
2. Clique no ✓ para commit

### Passo 4: Publicar

1. Clique em **"Publish Branch"**
2. Selecione **"Publish to GitHub"**
3. Escolha público ou privado
4. Confirme

**Pronto! 🎉**

---

## ⚠️ Problemas Comuns

### "Permission denied"

```bash
# Linux/Mac - dar permissão ao script
chmod +x setup-git.sh
```

### "Authentication failed"

**GitHub**: Use Personal Access Token, não senha!
- Gere um em: https://github.com/settings/tokens

### "Repository not found"

1. Verifique se a URL está correta
2. Confirme que o repositório existe
3. Verifique se você tem permissão de acesso

### "fatal: not a git repository"

```bash
# Execute dentro da pasta do projeto
cd media-manager
git init
```

---

## 🔐 Dicas de Segurança

### ✅ FAÇA:
- Use Personal Access Tokens para GitHub
- Configure SSH keys (mais seguro)
- Adicione `.env` no `.gitignore`
- Revise o `.gitignore` antes do primeiro commit

### ❌ NÃO FAÇA:
- Nunca commite arquivos `.env`
- Nunca commite credenciais AWS
- Não commite `node_modules/`
- Não commite arquivos de build (`dist/`, `build/`)

---

## 🎓 Configurar SSH (Opcional, mais seguro)

### GitHub SSH

```bash
# 1. Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# 2. Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# 3. Adicionar no GitHub
# Vá em: https://github.com/settings/keys
# Clique em "New SSH key"
# Cole a chave e salve

# 4. Testar conexão
ssh -T git@github.com

# 5. Usar URL SSH em vez de HTTPS
git remote set-url origin git@github.com:SEU-USUARIO/media-manager.git
```

Agora você pode fazer push sem digitar senha! 🎉

---

## 📊 Verificar Status

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Ver repositório remoto
git remote -v

# Ver branch atual
git branch
```

---

## 🔄 Comandos Úteis

```bash
# Atualizar do remoto
git pull

# Criar nova branch
git checkout -b feature/nova-feature

# Ver diferenças
git diff

# Desfazer mudanças não commitadas
git checkout -- arquivo.txt

# Adicionar arquivo específico
git add backend/lambdas/api/nova-funcao.ts

# Commit com mensagem curta
git commit -m "Add: nova funcionalidade"
```

---

## 📝 Convenções de Commit (Recomendado)

Use prefixos para organizar commits:

```bash
git commit -m "Add: nova funcionalidade X"
git commit -m "Fix: corrigir bug Y"
git commit -m "Update: atualizar documentação"
git commit -m "Refactor: melhorar código Z"
git commit -m "Remove: remover código antigo"
git commit -m "Test: adicionar testes"
```

---

## 🎯 Próximos Passos Após Push

1. ✅ Adicione um README badge (opcional)
2. ✅ Configure GitHub Actions para CI/CD
3. ✅ Adicione proteção de branch `main`
4. ✅ Convide colaboradores
5. ✅ Configure Issues e Projects

---

## 🤝 Precisa de Ajuda?

- **Git**: https://git-scm.com/doc
- **GitHub**: https://docs.github.com
- **GitHub Desktop**: https://docs.github.com/desktop

---

**Escolha a opção que preferir e bora codar! 🚀**
