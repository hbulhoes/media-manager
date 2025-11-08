/**
 * Utility Functions - Media Manager
 */

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Hoje
  if (diffDays === 0) {
    return `Hoje às ${date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  // Ontem
  if (diffDays === 1) {
    return 'Ontem';
  }
  
  // Esta semana
  if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  }
  
  // Mesmo ano
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long' 
    });
  }
  
  // Ano diferente
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

/**
 * Formata duração de vídeo
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula hash MD5 de arquivo (para detecção de duplicatas)
 */
export async function calculateFileMD5(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida se arquivo é uma imagem suportada
 */
export function isValidImage(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  return validTypes.includes(file.type);
}

/**
 * Valida se arquivo é um vídeo suportado
 */
export function isValidVideo(file: File): boolean {
  const validTypes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-matroska', // .mkv
    'video/webm'
  ];
  return validTypes.includes(file.type);
}

/**
 * Extrai coordenadas GPS de metadados EXIF
 */
export function extractGPSFromExif(exif: any): { lat: number; lon: number } | null {
  if (!exif.GPSLatitude || !exif.GPSLongitude) {
    return null;
  }
  
  const lat = convertDMSToDD(
    exif.GPSLatitude[0],
    exif.GPSLatitude[1],
    exif.GPSLatitude[2],
    exif.GPSLatitudeRef
  );
  
  const lon = convertDMSToDD(
    exif.GPSLongitude[0],
    exif.GPSLongitude[1],
    exif.GPSLongitude[2],
    exif.GPSLongitudeRef
  );
  
  return { lat, lon };
}

/**
 * Converte coordenadas DMS (Degrees Minutes Seconds) para DD (Decimal Degrees)
 */
function convertDMSToDD(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
): number {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    dd = dd * -1;
  }
  return dd;
}

/**
 * Gera URL do Google Maps para coordenadas
 */
export function getGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

/**
 * Comprime imagem antes do upload
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Redimensiona se necessário
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Debounce function para otimizar buscas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function para otimizar scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Download de arquivo
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copia texto para clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Gera cores para tags baseado em hash
 */
export function getTagColor(tag: string): string {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800'
  ];
  
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Formata coordenadas para exibição
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}

/**
 * Agrupa mídias por data
 */
export function groupMediaByDate(
  items: Array<{ captureDate: string }>
): Map<string, typeof items> {
  const groups = new Map<string, typeof items>();
  
  for (const item of items) {
    const date = new Date(item.captureDate);
    const key = date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }
  
  return groups;
}

/**
 * Calcula estatísticas de uma coleção de mídias
 */
export function calculateMediaStats(items: Array<{
  fileSize: number;
  fileType: string;
  captureDate: string;
}>) {
  const totalSize = items.reduce((sum, item) => sum + item.fileSize, 0);
  
  const byType = items.reduce((acc, item) => {
    const type = item.fileType.split('/')[0]; // 'image' ou 'video'
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byMonth = items.reduce((acc, item) => {
    const date = new Date(item.captureDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: items.length,
    totalSize,
    averageSize: totalSize / items.length,
    byType,
    byMonth
  };
}

/**
 * Verifica se browser suporta feature
 */
export const browserSupports = {
  webp: () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  },
  
  serviceWorker: () => 'serviceWorker' in navigator,
  
  fileSystemAccess: () => 'showOpenFilePicker' in window,
  
  webShare: () => 'share' in navigator
};

/**
 * Compartilha via Web Share API
 */
export async function shareMedia(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (!browserSupports.webShare()) {
    return false;
  }
  
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}
