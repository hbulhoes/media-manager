#!/bin/bash

# Script para configurar Git e fazer push do Media Manager
# Execute este script DEPOIS de baixar o projeto

echo "🚀 Media Manager - Git Setup"
echo "=============================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "README.md" ]; then
    echo "❌ Erro: Execute este script dentro do diretório media-manager/"
    exit 1
fi

# Pedir informações do repositório
echo "📝 Primeiro, crie um repositório no GitHub/GitLab/Bitbucket"
echo ""
read -p "Cole a URL do seu repositório (ex: https://github.com/seu-usuario/media-manager.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL do repositório é obrigatória!"
    exit 1
fi

echo ""
echo "⚙️  Configurando Git..."

# Inicializar Git se ainda não estiver
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git inicializado"
fi

# Criar .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# CDK
cdk.out/
.cdk.staging/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# AWS
.aws/

# Temporary files
*.tmp
.cache/
EOF
    echo "✅ .gitignore criado"
fi

# Adicionar todos os arquivos
echo ""
echo "📦 Adicionando arquivos..."
git add .

# Fazer commit inicial
echo ""
echo "💾 Fazendo commit inicial..."
git commit -m "🎉 Initial commit - Media Manager

- Backend serverless completo (AWS Lambda, DynamoDB, S3)
- Sistema de plugins extensível
- Plugin S3 implementado
- Frontend React com grid virtualizado
- Documentação completa
- IaC com AWS CDK"

# Adicionar remote
echo ""
echo "🔗 Conectando ao repositório remoto..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

# Renomear branch para main se necessário
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -M main
fi

echo ""
echo "🚀 Fazendo push para o repositório..."
echo ""
echo "⚠️  IMPORTANTE: Você será solicitado a autenticar."
echo "   - GitHub: Use um Personal Access Token (não senha)"
echo "   - GitLab/Bitbucket: Use suas credenciais normais"
echo ""
read -p "Pressione ENTER para continuar..."

# Fazer push
if git push -u origin main; then
    echo ""
    echo "✅ Push concluído com sucesso!"
    echo ""
    echo "🎉 Seu projeto está no repositório:"
    echo "   $REPO_URL"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Acesse o repositório no navegador"
    echo "   2. Configure GitHub Actions (opcional)"
    echo "   3. Adicione colaboradores (se necessário)"
    echo "   4. Comece a desenvolver! 🚀"
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "🔧 Possíveis soluções:"
    echo "   1. Verifique se o repositório existe"
    echo "   2. Confirme suas credenciais de acesso"
    echo "   3. Para GitHub, use um Personal Access Token:"
    echo "      https://github.com/settings/tokens"
    echo ""
    echo "Tente novamente com:"
    echo "   git push -u origin main"
fi
