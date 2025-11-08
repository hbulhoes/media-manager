/**
 * API Service - Cliente para comunicação com backend
 */

import axios, { AxiosInstance } from 'axios';
import type { MediaItem } from '../types/media';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com';

class MediaApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado, redireciona para login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Lista mídias do usuário com paginação
   */
  async listMedia(
    userId: string,
    options?: {
      lastKey?: string;
      limit?: number;
      dateFrom?: string;
      dateTo?: string;
      tags?: string[];
      searchText?: string;
    }
  ): Promise<{ items: MediaItem[]; lastKey?: string }> {
    const response = await this.client.get(`/users/${userId}/media`, {
      params: options
    });
    return response.data;
  }

  /**
   * Obtém mídia específica
   */
  async getMedia(userId: string, mediaId: string): Promise<MediaItem> {
    const response = await this.client.get(`/users/${userId}/media/${mediaId}`);
    return response.data;
  }

  /**
   * Faz upload de nova mídia
   */
  async uploadMedia(
    userId: string,
    file: File,
    metadata?: Partial<MediaItem['metadata']>
  ): Promise<MediaItem> {
    // Primeiro, obtém presigned URL
    const { uploadUrl, mediaId } = await this.getUploadUrl(userId, file.name, file.type);

    // Upload direto para S3
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        // Pode emitir evento para mostrar progresso na UI
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });

    // Confirma upload e processa mídia
    return this.confirmUpload(userId, mediaId, metadata);
  }

  /**
   * Obtém URL presignada para upload
   */
  private async getUploadUrl(
    userId: string,
    fileName: string,
    fileType: string
  ): Promise<{ uploadUrl: string; mediaId: string }> {
    const response = await this.client.post(`/users/${userId}/media/upload-url`, {
      fileName,
      fileType
    });
    return response.data;
  }

  /**
   * Confirma upload e inicia processamento
   */
  private async confirmUpload(
    userId: string,
    mediaId: string,
    metadata?: Partial<MediaItem['metadata']>
  ): Promise<MediaItem> {
    const response = await this.client.post(
      `/users/${userId}/media/${mediaId}/confirm`,
      { metadata }
    );
    return response.data;
  }

  /**
   * Atualiza metadados de mídia
   */
  async updateMedia(
    userId: string,
    mediaId: string,
    updates: Partial<MediaItem>
  ): Promise<MediaItem> {
    const response = await this.client.patch(
      `/users/${userId}/media/${mediaId}`,
      updates
    );
    return response.data;
  }

  /**
   * Deleta mídia
   */
  async deleteMedia(userId: string, mediaId: string): Promise<void> {
    await this.client.delete(`/users/${userId}/media/${mediaId}`);
  }

  /**
   * Busca mídias por texto
   */
  async searchMedia(
    userId: string,
    query: string,
    options?: {
      lastKey?: string;
      limit?: number;
    }
  ): Promise<{ items: MediaItem[]; lastKey?: string }> {
    const response = await this.client.get(`/users/${userId}/media/search`, {
      params: { q: query, ...options }
    });
    return response.data;
  }

  /**
   * Sincroniza mídia com destino específico
   */
  async syncMedia(
    userId: string,
    mediaId: string,
    pluginId: string
  ): Promise<{ status: string }> {
    const response = await this.client.post(
      `/users/${userId}/media/${mediaId}/sync`,
      { pluginId }
    );
    return response.data;
  }

  /**
   * Inicia importação de dispositivo
   */
  async importFromDevice(
    userId: string,
    devicePath: string,
    options?: {
      skipDuplicates?: boolean;
      autoTag?: boolean;
    }
  ): Promise<{ jobId: string }> {
    const response = await this.client.post(`/users/${userId}/import`, {
      devicePath,
      ...options
    });
    return response.data;
  }

  /**
   * Obtém status de job de importação
   */
  async getImportJobStatus(
    userId: string,
    jobId: string
  ): Promise<{
    status: string;
    progress: number;
    totalFiles: number;
    processedFiles: number;
  }> {
    const response = await this.client.get(`/users/${userId}/import/${jobId}`);
    return response.data;
  }

  /**
   * Lista plugins disponíveis
   */
  async listPlugins(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }>> {
    const response = await this.client.get('/plugins');
    return response.data;
  }

  /**
   * Obtém configuração de plugin
   */
  async getPluginConfig(
    userId: string,
    pluginId: string
  ): Promise<any> {
    const response = await this.client.get(
      `/users/${userId}/plugins/${pluginId}/config`
    );
    return response.data;
  }

  /**
   * Atualiza configuração de plugin
   */
  async updatePluginConfig(
    userId: string,
    pluginId: string,
    config: any
  ): Promise<void> {
    await this.client.put(
      `/users/${userId}/plugins/${pluginId}/config`,
      config
    );
  }

  /**
   * Testa conexão com plugin
   */
  async testPluginConnection(
    userId: string,
    pluginId: string
  ): Promise<{ success: boolean; message?: string }> {
    const response = await this.client.post(
      `/users/${userId}/plugins/${pluginId}/test`
    );
    return response.data;
  }
}

export const mediaApi = new MediaApiService();
