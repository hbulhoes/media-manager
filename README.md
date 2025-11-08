# Media Manager - Gerenciador de Mídias Serverless

Sistema de gerenciamento de fotos e vídeos com arquitetura serverless na AWS.

## 🎯 Funcionalidades

- ✅ Catálogo de mídias com metadados enriquecidos
- 📥 Importação de dispositivos (cartões SD, etc)
- ☁️ Múltiplos destinos configuráveis (local, cloud providers, S3)
- 🔌 Sistema de plugins para destinos customizados
- 🖼️ UI web responsiva com grid de thumbnails
- 🔍 Busca avançada por data, local, tags, features IA
- 🔐 Autenticação multi-usuário (Cognito)
- 📱 Acesso de qualquer dispositivo

## 🏗️ Arquitetura

### Backend (AWS)
- **DynamoDB**: Metadados e catálogo
- **S3**: Armazenamento de originais e thumbnails
- **Lambda**: APIs REST e processamento assíncrono
- **Cognito**: Autenticação e autorização
- **EventBridge**: Event bus para plugins
- **Step Functions**: Orquestração de workflows

### Frontend
- **React 18** + TypeScript
- **TanStack Query** (React Query) para cache
- **TanStack Virtual** para virtualização da grid
- **Tailwind CSS** para estilização
- **Vite** como build tool

## 📁 Estrutura do Projeto

```
media-manager/
├── backend/
│   ├── infrastructure/        # IaC (CDK/Terraform)
│   ├── lambdas/               # Funções Lambda
│   │   ├── api/              # REST APIs
│   │   ├── processors/       # Processamento de mídia
│   │   └── plugins/          # Sistema de plugins
│   ├── layers/               # Lambda layers compartilhados
│   └── schemas/              # Schemas DynamoDB
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # APIs e serviços
│   │   └── types/           # TypeScript types
│   └── public/
└── docs/                    # Documentação
```

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run deploy
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔌 Sistema de Plugins

Plugins podem ser criados para adicionar novos destinos de armazenamento:

- Google Drive
- OneDrive
- iCloud
- Dropbox
- S3 com diferentes classes de armazenamento
- NAS local
- Backup externo

Cada plugin implementa a interface `DestinationPlugin`.

## 📊 Modelo de Dados

### Tabela Principal: MediaItems
- PK: `USER#{userId}`
- SK: `MEDIA#{timestamp}#{mediaId}`
- GSI1: Por data de captura
- GSI2: Por localização
- GSI3: Por tags/keywords

## 🔐 Segurança

- Autenticação via Cognito
- Isolamento de dados por usuário
- Presigned URLs para acesso a S3
- Criptografia em repouso (S3) e em trânsito (HTTPS)

## 📈 Roadmap

- [ ] v0.1: MVP com upload básico e grid
- [ ] v0.2: Sistema de plugins
- [ ] v0.3: Importação de dispositivos
- [ ] v0.4: Features de IA (reconhecimento)
- [ ] v0.5: Busca avançada
- [ ] v0.6: Compartilhamento
