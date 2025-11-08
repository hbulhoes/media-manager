# Guia de Desenvolvimento de Plugins

## 📖 Visão Geral

O sistema de plugins do Media Manager permite que você adicione novos destinos de armazenamento de forma modular e independente. Cada plugin implementa a interface `DestinationPlugin` e pode sincronizar mídias para diferentes serviços.

## 🎯 Plugins Incluídos

- ✅ **S3 Plugin**: Armazenamento em AWS S3 (implementado)
- 🔜 **Google Drive Plugin**: Google Drive
- 🔜 **OneDrive Plugin**: Microsoft OneDrive
- 🔜 **Dropbox Plugin**: Dropbox
- 🔜 **iCloud Plugin**: Apple iCloud
- 🔜 **Local Storage Plugin**: Armazenamento local/NAS
- 🔜 **Backblaze B2 Plugin**: Backblaze B2
- 🔜 **Wasabi Plugin**: Wasabi Cloud Storage

## 🏗️ Arquitetura de Plugins

```
┌─────────────────────────────────────────┐
│         Media Manager Core              │
├─────────────────────────────────────────┤
│   ┌─────────────────────────────────┐  │
│   │    Plugin Factory               │  │
│   │  - Cria instâncias de plugins   │  │
│   │  - Gerencia registro            │  │
│   └─────────────────────────────────┘  │
│              ▲                          │
│              │                          │
│   ┌──────────┴──────────────────────┐  │
│   │    Plugin Interface             │  │
│   │  - initialize()                 │  │
│   │  - syncMedia()                  │  │
│   │  - deleteMedia()                │  │
│   │  - testConnection()             │  │
│   └─────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ S3 Plugin   │  │ GDrive Plugin│
│             │  │              │
└─────────────┘  └──────────────┘
```

## 📝 Criando um Novo Plugin

### 1. Estrutura Básica

Crie um novo arquivo em `backend/lambdas/plugins/`:

```typescript
import { 
  DestinationPlugin, 
  PluginConfig, 
  MediaFile, 
  SyncResult 
} from './interfaces';

export class MeuPlugin implements DestinationPlugin {
  public readonly id = 'meu-plugin';
  public readonly name = 'Meu Plugin';
  public readonly description = 'Descrição do plugin';
  public readonly version = '1.0.0';
  
  public readonly capabilities = {
    supportsStreaming: true,
    supportsResumable: false,
    supportsVersioning: false,
    supportsStorageClasses: false,
    supportsMetadata: true,
    supportsSharing: true
  };

  // Implementar métodos obrigatórios...
}
```

### 2. Implementar Inicialização

```typescript
private config: MeuPluginConfig | null = null;
private client: MeuServiceClient | null = null;

async initialize(config: PluginConfig): Promise<void> {
  this.config = config.config as MeuPluginConfig;
  
  // Inicializar cliente do serviço
  this.client = new MeuServiceClient({
    apiKey: this.config.apiKey,
    secret: this.config.secret
  });
}

async validateConfig(config: Record<string, any>): Promise<boolean> {
  // Validar se todas as chaves necessárias estão presentes
  return !!(config.apiKey && config.secret);
}

async testConnection(): Promise<boolean> {
  if (!this.client) return false;
  
  try {
    await this.client.ping();
    return true;
  } catch {
    return false;
  }
}
```

### 3. Implementar Sincronização

```typescript
async syncMedia(
  media: MediaFile, 
  options?: SyncOptions
): Promise<SyncResult> {
  if (!this.client || !this.config) {
    throw new Error('Plugin não inicializado');
  }

  const startTime = Date.now();

  try {
    // 1. Baixar o arquivo do S3
    const fileStream = await this.downloadFromS3(media.originalPath);
    
    // 2. Upload para o serviço
    const result = await this.client.upload({
      fileName: media.fileName,
      fileType: media.fileType,
      stream: fileStream,
      metadata: options?.preserveMetadata ? {
        captureDate: media.metadata.captureDate,
        location: media.metadata.gps?.location
      } : undefined,
      // Callback de progresso
      onProgress: (progress) => {
        options?.onProgress?.({
          bytesTransferred: progress.loaded,
          totalBytes: progress.total,
          percentage: (progress.loaded / progress.total) * 100
        });
      }
    });

    const duration = Date.now() - startTime;

    return {
      success: true,
      destinationPath: result.url,
      bytesTransferred: media.fileSize,
      duration,
      metadata: {
        fileId: result.id,
        version: result.version
      }
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      duration
    };
  }
}
```

### 4. Implementar Outras Operações

```typescript
async deleteMedia(
  mediaId: string, 
  destinationPath: string
): Promise<boolean> {
  if (!this.client) return false;

  try {
    // Extrair ID do arquivo do path
    const fileId = this.extractFileId(destinationPath);
    await this.client.delete(fileId);
    return true;
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return false;
  }
}

async exists(destinationPath: string): Promise<boolean> {
  if (!this.client) return false;

  try {
    const fileId = this.extractFileId(destinationPath);
    const metadata = await this.client.getMetadata(fileId);
    return !!metadata;
  } catch {
    return false;
  }
}

async getAccessUrl(
  destinationPath: string, 
  expiresIn: number = 3600
): Promise<string | null> {
  if (!this.client) return null;

  try {
    const fileId = this.extractFileId(destinationPath);
    return await this.client.createShareLink(fileId, expiresIn);
  } catch {
    return null;
  }
}
```

### 5. Implementar Métricas

```typescript
private metrics: PluginMetrics = {
  totalSyncs: 0,
  successfulSyncs: 0,
  failedSyncs: 0,
  totalBytesTransferred: 0,
  averageSyncTime: 0
};

async getMetrics(): Promise<PluginMetrics> {
  return { ...this.metrics };
}

private updateMetrics(
  success: boolean, 
  bytes: number, 
  duration: number
): void {
  this.metrics.totalSyncs++;
  
  if (success) {
    this.metrics.successfulSyncs++;
    this.metrics.totalBytesTransferred += bytes;
    
    const totalTime = 
      this.metrics.averageSyncTime * (this.metrics.successfulSyncs - 1) + 
      duration;
    this.metrics.averageSyncTime = totalTime / this.metrics.successfulSyncs;
  } else {
    this.metrics.failedSyncs++;
  }
  
  this.metrics.lastSyncAt = new Date().toISOString();
}
```

### 6. Limpeza de Recursos

```typescript
async cleanup(): Promise<void> {
  // Fechar conexões
  if (this.client) {
    await this.client.disconnect();
  }
  
  this.client = null;
  this.config = null;
}
```

## 🔐 Tratamento de Credenciais

### Armazenamento Seguro

```typescript
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

async function getSecureCredential(key: string): Promise<string> {
  const ssm = new SSMClient({});
  
  const response = await ssm.send(new GetParameterCommand({
    Name: key,
    WithDecryption: true
  }));
  
  return response.Parameter?.Value || '';
}

// Uso
async initialize(config: PluginConfig): Promise<void> {
  this.config = config.config as GoogleDriveConfig;
  
  // Buscar credentials do SSM Parameter Store
  const clientSecret = await getSecureCredential(
    `/media-manager/plugins/google-drive/${this.config.userId}/secret`
  );
  
  this.client = new GoogleDriveClient({
    clientId: this.config.clientId,
    clientSecret: clientSecret,
    refreshToken: this.config.refreshToken
  });
}
```

## 🔄 OAuth 2.0 Flow

Para serviços que usam OAuth (Google Drive, OneDrive, Dropbox):

```typescript
export class GoogleDrivePlugin implements DestinationPlugin {
  // ... código anterior ...

  /**
   * Inicia o fluxo OAuth
   */
  async getAuthorizationUrl(userId: string): Promise<string> {
    const state = generateRandomState();
    
    // Salvar state no DynamoDB para validar callback
    await saveOAuthState(userId, state);
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.config.clientId}&` +
      `redirect_uri=${this.config.redirectUri}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/drive.file&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
  }

  /**
   * Processa o callback OAuth
   */
  async handleOAuthCallback(
    userId: string,
    code: string,
    state: string
  ): Promise<void> {
    // Validar state
    const isValid = await validateOAuthState(userId, state);
    if (!isValid) {
      throw new Error('Estado OAuth inválido');
    }

    // Trocar código por tokens
    const tokens = await this.exchangeCodeForTokens(code);
    
    // Salvar refresh token de forma segura
    await saveRefreshToken(userId, 'google-drive', tokens.refreshToken);
    
    // Atualizar config do plugin
    await updatePluginConfig(userId, 'google-drive', {
      refreshToken: tokens.refreshToken,
      enabled: true
    });
  }

  private async exchangeCodeForTokens(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code'
      })
    });

    return await response.json();
  }
}
```

## 📊 Event Bus Integration

Os plugins emitem eventos para o EventBridge:

```typescript
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

async function emitPluginEvent(
  eventType: string,
  pluginId: string,
  mediaId: string,
  data: any
) {
  const eventBridge = new EventBridgeClient({});
  
  await eventBridge.send(new PutEventsCommand({
    Entries: [{
      Source: 'media-manager.plugin',
      DetailType: eventType,
      Detail: JSON.stringify({
        pluginId,
        mediaId,
        timestamp: new Date().toISOString(),
        ...data
      }),
      EventBusName: process.env.EVENT_BUS_NAME
    }]
  }));
}

// Uso no plugin
async syncMedia(media: MediaFile): Promise<SyncResult> {
  await emitPluginEvent('sync.started', this.id, media.mediaId, {});
  
  try {
    const result = await this.doSync(media);
    
    await emitPluginEvent('sync.completed', this.id, media.mediaId, {
      bytesTransferred: result.bytesTransferred,
      duration: result.duration
    });
    
    return result;
  } catch (error) {
    await emitPluginEvent('sync.failed', this.id, media.mediaId, {
      error: error.message
    });
    throw error;
  }
}
```

## 🧪 Testes

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MeuPlugin } from './meu-plugin';

describe('MeuPlugin', () => {
  let plugin: MeuPlugin;

  beforeEach(() => {
    plugin = new MeuPlugin();
  });

  it('deve validar configuração correta', async () => {
    const config = {
      apiKey: 'test-key',
      secret: 'test-secret'
    };
    
    const isValid = await plugin.validateConfig(config);
    expect(isValid).toBe(true);
  });

  it('deve rejeitar configuração inválida', async () => {
    const config = { apiKey: 'test-key' }; // falta secret
    
    const isValid = await plugin.validateConfig(config);
    expect(isValid).toBe(false);
  });

  it('deve sincronizar mídia com sucesso', async () => {
    await plugin.initialize({
      pluginId: 'meu-plugin',
      enabled: true,
      autoSync: true,
      priority: 1,
      retryAttempts: 3,
      retryDelay: 5,
      config: {
        apiKey: 'test-key',
        secret: 'test-secret'
      }
    });

    const media: MediaFile = {
      mediaId: 'test-123',
      userId: 'user-456',
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024000,
      originalPath: 's3://bucket/test.jpg',
      metadata: {
        width: 1920,
        height: 1080,
        format: 'JPEG',
        captureDate: '2024-01-15T10:00:00Z'
      }
    };

    const result = await plugin.syncMedia(media);
    
    expect(result.success).toBe(true);
    expect(result.destinationPath).toBeDefined();
  });
});
```

## 📦 Registrar Plugin

Adicione seu plugin ao `PluginFactory`:

```typescript
// backend/lambdas/plugins/factory.ts

import { S3Plugin } from './s3-plugin';
import { GoogleDrivePlugin } from './google-drive-plugin';
import { MeuPlugin } from './meu-plugin'; // <-- Adicione aqui

export class PluginFactory {
  private plugins = new Map<string, DestinationPlugin>();

  constructor() {
    this.registerPlugins();
  }

  private registerPlugins() {
    this.register(new S3Plugin());
    this.register(new GoogleDrivePlugin());
    this.register(new MeuPlugin()); // <-- E aqui
  }

  private register(plugin: DestinationPlugin) {
    this.plugins.set(plugin.id, plugin);
  }

  createPlugin(pluginId: string): DestinationPlugin {
    const PluginClass = this.plugins.get(pluginId);
    if (!PluginClass) {
      throw new Error(`Plugin não encontrado: ${pluginId}`);
    }
    return PluginClass;
  }

  listAvailablePlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
```

## 🎨 UI para Configuração

Crie um componente React para configurar o plugin:

```typescript
// frontend/src/components/plugins/MeuPluginConfig.tsx

export const MeuPluginConfig = ({ userId, onSave }: Props) => {
  const [apiKey, setApiKey] = useState('');
  const [secret, setSecret] = useState('');
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    const result = await mediaApi.testPluginConnection(userId, 'meu-plugin');
    setTesting(false);
    
    if (result.success) {
      alert('Conexão bem-sucedida!');
    } else {
      alert(`Erro: ${result.message}`);
    }
  };

  const handleSave = async () => {
    await mediaApi.updatePluginConfig(userId, 'meu-plugin', {
      apiKey,
      secret
    });
    onSave();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Meu Plugin</h3>
      
      <div>
        <label>API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label>Secret</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleTest} disabled={testing}>
          {testing ? 'Testando...' : 'Testar Conexão'}
        </button>
        <button onClick={handleSave}>Salvar</button>
      </div>
    </div>
  );
};
```

## ✅ Checklist de Desenvolvimento

- [ ] Implementar todos os métodos da interface
- [ ] Adicionar tratamento de erros robusto
- [ ] Implementar retry logic para operações de rede
- [ ] Armazenar credenciais de forma segura
- [ ] Emitir eventos para o EventBridge
- [ ] Adicionar logging adequado
- [ ] Escrever testes unitários
- [ ] Documentar configuração necessária
- [ ] Criar UI para configuração
- [ ] Testar com arquivos grandes (>100MB)
- [ ] Validar performance (uploads paralelos)
- [ ] Adicionar métricas e monitoring

## 🚀 Contribuindo

Quer adicionar um novo plugin? Siga estes passos:

1. Fork o repositório
2. Crie uma branch para seu plugin
3. Implemente seguindo este guia
4. Adicione testes
5. Atualize a documentação
6. Abra um Pull Request

Plugins mais requisitados pela comunidade:
- Backblaze B2
- Wasabi
- DigitalOcean Spaces
- Azure Blob Storage
- FTP/SFTP
- WebDAV
- Synology NAS
