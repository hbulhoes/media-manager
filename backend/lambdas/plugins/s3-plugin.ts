/**
 * Plugin S3 - Armazenamento em buckets AWS S3
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  DestinationPlugin,
  PluginConfig,
  MediaFile,
  SyncResult,
  SyncOptions,
  PluginCapabilities,
  PluginMetrics,
  StorageClass,
  SyncProgress
} from './interfaces';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface S3PluginConfig {
  bucketName: string;
  region: string;
  prefix?: string; // Prefixo para organizar arquivos (ex: "media/")
  defaultStorageClass?: StorageClass;
  serverSideEncryption?: 'AES256' | 'aws:kms';
  kmsKeyId?: string;
  enableVersioning?: boolean;
  lifecycleRules?: boolean;
}

export class S3Plugin implements DestinationPlugin {
  public readonly id = 's3-storage';
  public readonly name = 'AWS S3 Storage';
  public readonly description = 'Armazena mídias em buckets AWS S3 com suporte a múltiplas classes de armazenamento';
  public readonly version = '1.0.0';
  
  public readonly capabilities: PluginCapabilities = {
    supportsStreaming: true,
    supportsResumable: true,
    supportsVersioning: true,
    supportsStorageClasses: true,
    supportsMetadata: true,
    supportsSharing: true,
    maxFileSize: 5 * 1024 * 1024 * 1024 * 1024, // 5TB
    supportedFormats: undefined // Todos os formatos
  };

  private s3Client: S3Client | null = null;
  private config: S3PluginConfig | null = null;
  private metrics: PluginMetrics = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    totalBytesTransferred: 0,
    averageSyncTime: 0
  };

  async initialize(config: PluginConfig): Promise<void> {
    this.config = config.config as S3PluginConfig;
    
    this.s3Client = new S3Client({
      region: this.config.region,
      maxAttempts: config.retryAttempts || 3
    });
  }

  async validateConfig(config: Record<string, any>): Promise<boolean> {
    const s3Config = config as S3PluginConfig;
    
    if (!s3Config.bucketName || !s3Config.region) {
      return false;
    }

    // Testa se o bucket existe e se temos permissão
    try {
      const testClient = new S3Client({ region: s3Config.region });
      await testClient.send(new HeadObjectCommand({
        Bucket: s3Config.bucketName,
        Key: '_test_' // Teste simples
      }));
      return true;
    } catch (error: any) {
      // Se o erro for NoSuchKey, o bucket existe e temos acesso
      return error.name === 'NotFound' || error.name === 'NoSuchKey';
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.s3Client || !this.config) {
      return false;
    }

    try {
      // Lista objetos do bucket para validar permissões
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: '_test_connection_'
      }));
      return true;
    } catch (error: any) {
      // Se o erro for NoSuchKey, a conexão está ok
      return error.name === 'NotFound' || error.name === 'NoSuchKey';
    }
  }

  async syncMedia(media: MediaFile, options?: SyncOptions): Promise<SyncResult> {
    if (!this.s3Client || !this.config) {
      throw new Error('Plugin não inicializado');
    }

    const startTime = Date.now();
    
    try {
      // Determina o caminho de destino
      const key = this.buildS3Key(media);
      
      // Determina a classe de armazenamento
      const storageClass = this.mapStorageClass(
        options?.storageClass || this.config.defaultStorageClass || StorageClass.STANDARD
      );

      // Prepara os metadados
      const metadata: Record<string, string> = {
        'media-id': media.mediaId,
        'user-id': media.userId,
        'original-filename': media.fileName,
        'file-type': media.fileType,
        'capture-date': media.metadata.captureDate
      };

      if (media.metadata.gps) {
        metadata['gps-lat'] = media.metadata.gps.latitude.toString();
        metadata['gps-lon'] = media.metadata.gps.longitude.toString();
      }

      // Prepara o comando de upload
      const putCommand = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        StorageClass: storageClass,
        Metadata: options?.preserveMetadata ? metadata : undefined,
        ServerSideEncryption: this.config.serverSideEncryption,
        SSEKMSKeyId: this.config.kmsKeyId,
        ContentType: media.fileType,
        Tagging: options?.tags ? this.buildTagString(options.tags) : undefined
      });

      // Faz o upload
      // Nota: Para arquivos grandes, usar multipart upload
      await this.s3Client.send(putCommand);

      const duration = Date.now() - startTime;
      
      // Atualiza métricas
      this.updateMetrics(true, media.fileSize, duration);

      const destinationPath = `s3://${this.config.bucketName}/${key}`;

      return {
        success: true,
        destinationPath,
        bytesTransferred: media.fileSize,
        duration,
        metadata: {
          storageClass,
          versionId: undefined // Será preenchido se versioning estiver ativo
        }
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.updateMetrics(false, 0, duration);

      return {
        success: false,
        error: error.message,
        duration
      };
    }
  }

  async deleteMedia(mediaId: string, destinationPath: string): Promise<boolean> {
    if (!this.s3Client || !this.config) {
      return false;
    }

    try {
      const key = this.extractKeyFromPath(destinationPath);
      
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      }));

      return true;
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      return false;
    }
  }

  async exists(destinationPath: string): Promise<boolean> {
    if (!this.s3Client || !this.config) {
      return false;
    }

    try {
      const key = this.extractKeyFromPath(destinationPath);
      
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      }));

      return true;
    } catch (error) {
      return false;
    }
  }

  async getAccessUrl(destinationPath: string, expiresIn: number = 3600): Promise<string | null> {
    if (!this.s3Client || !this.config) {
      return null;
    }

    try {
      const key = this.extractKeyFromPath(destinationPath);
      
      const command = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Erro ao gerar URL:', error);
      return null;
    }
  }

  async getMetrics(): Promise<PluginMetrics> {
    return { ...this.metrics };
  }

  async cleanup(): Promise<void> {
    this.s3Client = null;
    this.config = null;
  }

  // Métodos auxiliares privados

  private buildS3Key(media: MediaFile): string {
    const prefix = this.config?.prefix || 'media';
    const date = new Date(media.metadata.captureDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Organiza por: prefix/userId/year/month/mediaId.ext
    const extension = media.fileName.split('.').pop();
    return `${prefix}/${media.userId}/${year}/${month}/${media.mediaId}.${extension}`;
  }

  private extractKeyFromPath(s3Path: string): string {
    // Remove s3://bucket-name/ do início
    return s3Path.replace(/^s3:\/\/[^\/]+\//, '');
  }

  private mapStorageClass(storageClass: StorageClass): string {
    const mapping: Record<StorageClass, string> = {
      [StorageClass.STANDARD]: 'STANDARD',
      [StorageClass.INTELLIGENT_TIERING]: 'INTELLIGENT_TIERING',
      [StorageClass.STANDARD_IA]: 'STANDARD_IA',
      [StorageClass.ONEZONE_IA]: 'ONEZONE_IA',
      [StorageClass.GLACIER_INSTANT]: 'GLACIER_INSTANT_RETRIEVAL',
      [StorageClass.GLACIER_FLEXIBLE]: 'GLACIER',
      [StorageClass.DEEP_ARCHIVE]: 'DEEP_ARCHIVE',
      [StorageClass.HOT]: 'STANDARD',
      [StorageClass.COOL]: 'STANDARD_IA',
      [StorageClass.ARCHIVE]: 'GLACIER'
    };

    return mapping[storageClass] || 'STANDARD';
  }

  private buildTagString(tags: Record<string, string>): string {
    return Object.entries(tags)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  private updateMetrics(success: boolean, bytes: number, duration: number): void {
    this.metrics.totalSyncs++;
    
    if (success) {
      this.metrics.successfulSyncs++;
      this.metrics.totalBytesTransferred += bytes;
      
      // Calcula média móvel do tempo de sync
      const totalTime = this.metrics.averageSyncTime * (this.metrics.successfulSyncs - 1) + duration;
      this.metrics.averageSyncTime = totalTime / this.metrics.successfulSyncs;
    } else {
      this.metrics.failedSyncs++;
    }
    
    this.metrics.lastSyncAt = new Date().toISOString();
  }
}
