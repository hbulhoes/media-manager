# Guia de Deploy - Media Manager

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- AWS CLI configurado com credenciais válidas
- Conta AWS com permissões adequadas
- Docker (para build de Lambdas com sharp)

## 🚀 Deployment do Backend (AWS)

### 1. Configurar AWS CLI

```bash
aws configure
# Insira suas credenciais AWS
# AWS Access Key ID: [sua chave]
# AWS Secret Access Key: [sua chave secreta]
# Default region name: us-east-1 (ou sua região preferida)
# Default output format: json
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Bootstrap CDK (apenas primeira vez)

```bash
npm run cdk bootstrap
```

### 4. Fazer deploy da infraestrutura

```bash
npm run deploy
```

Este comando irá:
- Criar todas as tabelas DynamoDB
- Criar buckets S3
- Criar User Pool no Cognito
- Criar funções Lambda
- Criar API Gateway
- Configurar EventBridge

⏱️ Tempo estimado: 5-10 minutos

### 5. Anotar os outputs

Após o deploy, anote os seguintes valores que serão exibidos:

```
Outputs:
MediaManagerStack.UserPoolId = us-east-1_XXXXXXXXX
MediaManagerStack.UserPoolClientId = XXXXXXXXXXXXXXXXXXXXXXXXXX
MediaManagerStack.ApiEndpoint = https://XXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod/
```

## 🎨 Deployment do Frontend

### 1. Configurar variáveis de ambiente

Crie o arquivo `frontend/.env`:

```env
VITE_API_BASE_URL=https://XXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_REGION=us-east-1
```

### 2. Instalar dependências

```bash
cd frontend
npm install
```

### 3. Build de produção

```bash
npm run build
```

### 4. Deploy para hosting

#### Opção A: AWS Amplify

```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Inicializar
amplify init

# Adicionar hosting
amplify add hosting

# Publicar
amplify publish
```

#### Opção B: S3 + CloudFront

```bash
# Criar bucket
aws s3 mb s3://media-manager-frontend

# Configurar como website
aws s3 website s3://media-manager-frontend \
  --index-document index.html \
  --error-document index.html

# Upload dos arquivos
aws s3 sync dist/ s3://media-manager-frontend --delete

# Configurar CloudFront (recomendado para HTTPS)
# Use o console da AWS ou CloudFormation
```

#### Opção C: Vercel (mais simples)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔐 Configurar primeiro usuário

### Via AWS Console

1. Acesse o Cognito User Pool
2. Vá em "Users"
3. Clique em "Create user"
4. Preencha email e senha temporária
5. Usuário receberá email para confirmar

### Via AWS CLI

```bash
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_XXXXXXXXX \
  --username seu-email@exemplo.com \
  --user-attributes Name=email,Value=seu-email@exemplo.com \
  --temporary-password "SenhaTe mp123!" \
  --message-action SUPPRESS
```

## 🔌 Configurar Plugins

### Plugin S3 (incluído por padrão)

Já está configurado automaticamente. Parâmetros:

```json
{
  "bucketName": "media-manager-uploads-XXXXXXXXX",
  "region": "us-east-1",
  "prefix": "media",
  "defaultStorageClass": "STANDARD"
}
```

### Plugin Google Drive

1. Criar projeto no Google Cloud Console
2. Habilitar Google Drive API
3. Criar credenciais OAuth 2.0
4. Adicionar configuração via API:

```bash
POST /users/{userId}/plugins/google-drive/config
{
  "clientId": "seu-client-id.apps.googleusercontent.com",
  "clientSecret": "seu-client-secret",
  "redirectUri": "https://seu-dominio.com/auth/google/callback"
}
```

### Plugin OneDrive

Similar ao Google Drive, usando Microsoft Graph API.

## 📊 Monitoramento

### CloudWatch Logs

```bash
# Ver logs de uma função Lambda
aws logs tail /aws/lambda/MediaManagerStack-ListMediaFn --follow

# Ver logs de processamento
aws logs tail /aws/lambda/MediaManagerStack-ProcessUploadFn --follow
```

### CloudWatch Metrics

Acesse CloudWatch > Metrics para visualizar:
- Contagem de uploads
- Latência de APIs
- Erros de processamento
- Uso de DynamoDB

### X-Ray (rastreamento distribuído)

Já está habilitado nas Lambdas. Acesse AWS X-Ray para ver traces.

## 💰 Estimativa de Custos

Para 10.000 mídias e uso moderado:

| Serviço | Custo Mensal (USD) |
|---------|-------------------|
| DynamoDB | $4 |
| S3 Storage | $10 |
| Lambda | $5 |
| API Gateway | $3 |
| CloudFront | $1 |
| Cognito | $0 (grátis até 50k MAU) |
| **Total** | **~$23/mês** |

## 🧹 Limpeza (remover tudo)

```bash
cd backend

# Remove o stack
npm run destroy

# Remove buckets manualmente (se necessário)
aws s3 rb s3://media-manager-uploads-XXXXXXXXX --force
aws s3 rb s3://media-manager-thumbnails-XXXXXXXXX --force
```

## 🐛 Troubleshooting

### Erro: "Unable to resolve AWS account"

```bash
aws sts get-caller-identity
# Verifica se suas credenciais estão corretas
```

### Erro: "sharp" não funciona no Lambda

Certifique-se de que o Docker está rodando durante o build.

### Erro: CORS na API

Verifique se o frontend está usando a URL correta da API e se o CORS está configurado.

### Upload muito lento

- Use multipart upload para arquivos > 100MB
- Considere usar CloudFront para distribuir thumbnails
- Otimize compressão de imagens

## 📚 Próximos Passos

1. Configurar domínio customizado (Route 53)
2. Adicionar certificado SSL (ACM)
3. Configurar backup automático (AWS Backup)
4. Implementar análise de IA (Rekognition)
5. Adicionar mais plugins de destino
6. Configurar CI/CD (GitHub Actions)

## 🤝 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação AWS
- Verifique os logs no CloudWatch
