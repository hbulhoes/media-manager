/**
 * MediaGrid - Grid virtualizado de thumbnails de mídias
 * 
 * Usa TanStack Virtual para renderização eficiente de milhares de itens
 */

import React, { useRef, useMemo, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMediaItems } from '../hooks/useMediaItems';
import { MediaCard } from './MediaCard';
import { MediaModal } from './MediaModal';
import { Loader } from './Loader';
import type { MediaItem } from '../types/media';

interface MediaGridProps {
  userId: string;
  filters?: MediaFilters;
  columnWidth?: number;
  gap?: number;
}

export interface MediaFilters {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  location?: string;
  searchText?: string;
  fileTypes?: string[];
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  userId,
  filters,
  columnWidth = 250,
  gap = 16
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [parentWidth, setParentWidth] = useState(0);

  // Hook customizado para buscar mídias
  const {
    items,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useMediaItems(userId, filters);

  // Calcula quantas colunas cabem
  const columnsCount = useMemo(() => {
    if (parentWidth === 0) return 4;
    return Math.floor((parentWidth + gap) / (columnWidth + gap));
  }, [parentWidth, columnWidth, gap]);

  // Organiza items em linhas
  const rows = useMemo(() => {
    const result: MediaItem[][] = [];
    for (let i = 0; i < items.length; i += columnsCount) {
      result.push(items.slice(i, i + columnsCount));
    }
    return result;
  }, [items, columnsCount]);

  // Virtualizer para as linhas
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => columnWidth + gap,
    overscan: 3,
    onChange: (virtualizer) => {
      // Carrega mais quando chegar perto do fim
      const lastItem = virtualizer.getVirtualItems().at(-1);
      if (
        lastItem &&
        lastItem.index >= rows.length - 3 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }
  });

  // Observer para medir largura do container
  React.useEffect(() => {
    if (!parentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setParentWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(parentRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Erro ao carregar mídias</p>
        <p className="text-gray-600">{error?.message}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-2">Nenhuma mídia encontrada</p>
        <p className="text-gray-400 text-sm">
          Importe mídias de um dispositivo ou faça upload de arquivos
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={parentRef}
        className="h-screen overflow-auto bg-gray-50"
        style={{ padding: `${gap}px` }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <div
                  className="flex"
                  style={{ gap: `${gap}px` }}
                >
                  {row.map((item) => (
                    <div
                      key={item.mediaId}
                      style={{ width: `${columnWidth}px` }}
                    >
                      <MediaCard
                        media={item}
                        onClick={() => setSelectedMedia(item)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        )}
      </div>

      {/* Modal para visualização */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onNext={() => {
            const currentIndex = items.findIndex(
              (item) => item.mediaId === selectedMedia.mediaId
            );
            if (currentIndex < items.length - 1) {
              setSelectedMedia(items[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = items.findIndex(
              (item) => item.mediaId === selectedMedia.mediaId
            );
            if (currentIndex > 0) {
              setSelectedMedia(items[currentIndex - 1]);
            }
          }}
        />
      )}
    </>
  );
};
