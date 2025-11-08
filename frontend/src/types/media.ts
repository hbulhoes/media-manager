/**
 * TypeScript Types - Media Manager Frontend
 */

export interface MediaItem {
  mediaId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  originalPath: string;
  thumbnailPath: string;
  
  captureDate: string;
  uploadDate: string;
  lastModified: string;
  
  metadata: MediaMetadata;
  
  tags?: string[];
  keywords?: string[];
  description?: string;
  
  aiFeatures?: AIFeatures;
  destinations?: DestinationStatus[];
  
  status: 'active' | 'processing' | 'error';
  deleted: boolean;
  deletedAt?: string;
}

export interface MediaMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace?: string;
  orientation?: number;
  duration?: number; // Para vídeos (em segundos)
  
  cameraMake?: string;
  cameraModel?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  focalLength?: number;
  flash?: boolean;
  
  gps?: GpsData;
}

export interface GpsData {
  latitude: number;
  longitude: number;
  altitude?: number;
  location?: string;
}

export interface AIFeatures {
  objects?: string[];
  faces?: FaceDetection[];
  scenes?: string[];
  colors?: string[];
  text?: string[];
  landmarks?: string[];
  analyzed: boolean;
  analyzedAt?: string;
  confidence?: number;
}

export interface FaceDetection {
  faceId: string;
  boundingBox: BoundingBox;
  confidence?: number;
  emotions?: {
    [emotion: string]: number;
  };
  age?: number;
  gender?: string;
}

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DestinationStatus {
  pluginId: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  path?: string;
  syncedAt?: string;
  error?: string;
  retryCount?: number;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  config?: PluginConfig;
  capabilities: PluginCapabilities;
}

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginCapabilities {
  supportsStreaming: boolean;
  supportsResumable: boolean;
  supportsVersioning: boolean;
  supportsStorageClasses: boolean;
  supportsMetadata: boolean;
  supportsSharing: boolean;
  maxFileSize?: number;
  supportedFormats?: string[];
}

export interface ImportJob {
  jobId: string;
  userId: string;
  status: 'pending' | 'scanning' | 'processing' | 'completed' | 'failed';
  deviceName: string;
  devicePath: string;
  totalFiles: number;
  processedFiles: number;
  successfulImports: number;
  failedImports: number;
  duplicates: number;
  startedAt: string;
  completedAt?: string;
  errors?: ImportError[];
}

export interface ImportError {
  filePath: string;
  error: string;
  timestamp: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    storageLimit: number;
    storageUsed: number;
  };
}

export interface SearchResult {
  items: MediaItem[];
  total: number;
  lastKey?: string;
  facets?: {
    [key: string]: Array<{
      value: string;
      count: number;
    }>;
  };
}

export interface MediaFilters {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  location?: string;
  searchText?: string;
  fileTypes?: string[];
  hasGPS?: boolean;
  hasAIFeatures?: boolean;
  syncStatus?: 'all' | 'synced' | 'pending' | 'error';
}

export interface UploadProgress {
  mediaId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface Statistics {
  totalMedias: number;
  totalSize: number;
  byFileType: {
    [type: string]: number;
  };
  byMonth: Array<{
    month: string;
    count: number;
  }>;
  topLocations: Array<{
    location: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Event types para WebSocket/SSE
export type MediaEvent =
  | { type: 'upload.started'; data: { mediaId: string } }
  | { type: 'upload.progress'; data: { mediaId: string; progress: number } }
  | { type: 'upload.completed'; data: { mediaId: string; media: MediaItem } }
  | { type: 'sync.started'; data: { mediaId: string; pluginId: string } }
  | { type: 'sync.completed'; data: { mediaId: string; pluginId: string } }
  | { type: 'sync.failed'; data: { mediaId: string; pluginId: string; error: string } }
  | { type: 'import.progress'; data: { jobId: string; progress: number } }
  | { type: 'import.completed'; data: { jobId: string } };
