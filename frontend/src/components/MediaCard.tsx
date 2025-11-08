/**
 * MediaCard - Card individual para exibir thumbnail de mídia
 */

import React, { useState } from 'react';
import { Play, MapPin, Clock, Tag, AlertCircle } from 'lucide-react';
import type { MediaItem } from '../types/media';
import { formatDate, formatFileSize } from '../utils/formatters';

interface MediaCardProps {
  media: MediaItem;
  onClick: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isVideo = media.fileType.startsWith('video/');
  const hasLocation = media.metadata.gps?.location;
  const hasSyncIssues = media.destinations?.some(d => d.status === 'error');

  return (
    <div
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="aspect-square relative bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-gray-200" />
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={media.thumbnailPath}
            alt={media.fileName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Badge de vídeo */}
        {isVideo && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
            <Play className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Badge de sync issues */}
        {hasSyncIssues && (
          <div className="absolute top-2 left-2 bg-red-500 rounded-full p-2">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Overlay ao hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Data e tamanho */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(media.captureDate)}</span>
          </div>
          <span>{formatFileSize(media.fileSize)}</span>
        </div>

        {/* Nome do arquivo (truncado) */}
        <p className="text-sm font-medium text-gray-900 truncate mb-2">
          {media.fileName}
        </p>

        {/* Tags e localização */}
        <div className="flex items-center gap-2 text-xs">
          {hasLocation && (
            <div className="flex items-center gap-1 text-blue-600">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">
                {media.metadata.gps?.location}
              </span>
            </div>
          )}
          
          {media.tags && media.tags.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <Tag className="w-3 h-3" />
              <span>{media.tags.length}</span>
            </div>
          )}
        </div>

        {/* Status de sincronização */}
        {media.destinations && media.destinations.length > 0 && (
          <div className="mt-2 flex gap-1">
            {media.destinations.map((dest, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  dest.status === 'synced'
                    ? 'bg-green-500'
                    : dest.status === 'error'
                    ? 'bg-red-500'
                    : dest.status === 'syncing'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-300'
                }`}
                title={`${dest.pluginId}: ${dest.status}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Badge de seleção (para futuro multi-select) */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
