/**
 * Sistema de Plugins - Media Manager
 * 
 * Interface base para todos os plugins de destino de armazenamento
 */

export enum PluginStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  ERROR = 'error',
  PENDING = 'pending'
}

export enum StorageClass {
  // S3
  STANDARD = 'STANDARD',
  INTELLIGENT_TIERING = 'INTELLIGENT_TIERING',
  STANDARD_IA = 'STANDARD_IA',
  ONEZONE_IA = 'ONEZONE_IA',
  GLACIER_INSTANT = 'GLACIER_INSTANT',
  GLACIER_FLEXIBLE = 'GLACIER_FLEXIBLE',
  DEEP_ARCHIVE = 'DEEP_ARCHIVE',
  
  // Genérico
  HOT = 'HOT',
  COOL = 'COOL',
  ARCHIVE = 'ARCHIVE'
}

export interface PluginConfig {
  pluginId: string;
  enabled: boolean;
  autoSync: boolean;
  priority: number; // Ordem de sincronização (menor = maior prioridade)
  retryAttempts: number;
  retryDelay: number; // em segundos
  config: Record<string, any>; // Configurações específicas do plugin
}

export interface MediaFile {
  mediaId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  originalPath: string;
  thumbnailPath?: string;
  metadata: MediaMetadata;
}

export interface MediaMetadata {
  width: number;
  height: number;
  format: string;
  captureDate: string;
  gps?: GpsData;
  camera?: CameraData;
}

export interface GpsData {
  latitude: number;
  longitude: number;
  altitude?: number;
  location?: string;
}

export interface CameraData {
  make?: string;
  model?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  focalLength?: number;
}

export interface SyncResult {
  success: boolean;
  destinationPath?: string;
  error?: string;
  metadata?: Record<string, any>;
  bytesTransferred?: number;
  duration?: number; // em ms
}

export interface PluginCapabilities {
  supportsStreaming: boolean;
  supportsResumable: boolean;
  supportsVersioning: boolean;
  supportsStorageClasses: boolean;
  supportsMetadata: boolean;
  supportsSharing: boolean;
  maxFileSize?: number; // em bytes
  supportedFormats?: string[]; // MIME types
}

export interface PluginMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalBytesTransferred: number;
  averageSyncTime: number; // em ms
  lastSyncAt?: string;
}

/**
 * Interface principal que todos os plugins devem implementar
 */
export interface DestinationPlugin {
  /** Identificador único do plugin */
  readonly id: string;
  
  /** Nome amigável do plugin */
  readonly name: string;
  
  /** Descrição do plugin */
  readonly description: string;
  
  /** Versão do plugin */
  readonly version: string;
  
  /** Capacidades do plugin */
  readonly capabilities: PluginCapabilities;
  
  /**
   * Inicializa o plugin com configurações do usuário
   */
  initialize(config: PluginConfig): Promise<void>;
  
  /**
   * Valida se as configurações são válidas
   */
  validateConfig(config: Record<string, any>): Promise<boolean>;
  
  /**
   * Testa a conexão com o destino
   */
  testConnection(): Promise<boolean>;
  
  /**
   * Sincroniza um arquivo de mídia para o destino
   */
  syncMedia(media: MediaFile, options?: SyncOptions): Promise<SyncResult>;
  
  /**
   * Remove um arquivo de mídia do destino
   */
  deleteMedia(mediaId: string, destinationPath: string): Promise<boolean>;
  
  /**
   * Verifica se um arquivo existe no destino
   */
  exists(destinationPath: string): Promise<boolean>;
  
  /**
   * Obtém URL de acesso ao arquivo (se aplicável)
   */
  getAccessUrl(destinationPath: string, expiresIn?: number): Promise<string | null>;
  
  /**
   * Obtém métricas do plugin
   */
  getMetrics(): Promise<PluginMetrics>;
  
  /**
   * Limpa recursos e fecha conexões
   */
  cleanup(): Promise<void>;
}

export interface SyncOptions {
  storageClass?: StorageClass;
  compress?: boolean;
  encrypt?: boolean;
  overwrite?: boolean;
  preserveMetadata?: boolean;
  tags?: Record<string, string>;
  onProgress?: (progress: SyncProgress) => void;
}

export interface SyncProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  speed?: number; // bytes por segundo
  estimatedTimeRemaining?: number; // em segundos
}

/**
 * Factory para criar instâncias de plugins
 */
export interface PluginFactory {
  createPlugin(pluginId: string): DestinationPlugin;
  listAvailablePlugins(): string[];
  getPluginInfo(pluginId: string): {
    id: string;
    name: string;
    description: string;
    version: string;
  };
}

/**
 * Event bus para comunicação entre plugins e sistema
 */
export interface PluginEvent {
  eventType: 'sync.started' | 'sync.progress' | 'sync.completed' | 'sync.failed' | 'plugin.error';
  pluginId: string;
  mediaId: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface PluginEventBus {
  emit(event: PluginEvent): void;
  on(eventType: string, handler: (event: PluginEvent) => void): void;
  off(eventType: string, handler: (event: PluginEvent) => void): void;
}
