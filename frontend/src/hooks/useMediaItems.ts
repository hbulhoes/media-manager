/**
 * useMediaItems - Hook para gerenciar estado e queries de mídias
 * 
 * Usa React Query para cache, paginação e sincronização
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MediaItem } from '../types/media';
import type { MediaFilters } from '../components/MediaGrid';
import { mediaApi } from '../services/api';

interface UseMediaItemsResult {
  items: MediaItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  refetch: () => void;
}

export function useMediaItems(
  userId: string,
  filters?: MediaFilters
): UseMediaItemsResult {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['media', userId, filters],
    queryFn: ({ pageParam }) => 
      mediaApi.listMedia(userId, {
        ...filters,
        lastKey: pageParam
      }),
    getNextPageParam: (lastPage) => lastPage.lastKey,
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30 // 30 minutos (anteriormente cacheTime)
  });

  // Flatten todas as páginas em uma única lista
  const items = data?.pages.flatMap(page => page.items) ?? [];

  return {
    items,
    isLoading,
    isError,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage,
    refetch
  };
}

/**
 * Hook para upload de novas mídias
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      file, 
      metadata 
    }: { 
      userId: string; 
      file: File; 
      metadata?: Partial<MediaItem['metadata']>;
    }) => {
      return mediaApi.uploadMedia(userId, file, metadata);
    },
    onSuccess: (_, variables) => {
      // Invalida cache para forçar reload
      queryClient.invalidateQueries({ 
        queryKey: ['media', variables.userId] 
      });
    }
  });
}

/**
 * Hook para deletar mídia
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      mediaId 
    }: { 
      userId: string; 
      mediaId: string;
    }) => {
      return mediaApi.deleteMedia(userId, mediaId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['media', variables.userId] 
      });
    }
  });
}

/**
 * Hook para atualizar metadados de mídia
 */
export function useUpdateMediaMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      mediaId, 
      updates 
    }: { 
      userId: string; 
      mediaId: string;
      updates: Partial<MediaItem>;
    }) => {
      return mediaApi.updateMedia(userId, mediaId, updates);
    },
    onMutate: async ({ userId, mediaId, updates }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ 
        queryKey: ['media', userId] 
      });

      // Snapshot do estado anterior
      const previousData = queryClient.getQueryData(['media', userId]);

      // Atualização otimista
      queryClient.setQueryData(
        ['media', userId],
        (old: any) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: MediaItem) =>
                item.mediaId === mediaId
                  ? { ...item, ...updates }
                  : item
              )
            }))
          };
        }
      );

      return { previousData };
    },
    onError: (_, variables, context) => {
      // Reverte em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(
          ['media', variables.userId],
          context.previousData
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Revalida após mutação
      queryClient.invalidateQueries({ 
        queryKey: ['media', variables.userId] 
      });
    }
  });
}

/**
 * Hook para buscar mídia individual
 */
export function useMediaItem(userId: string, mediaId: string) {
  return useQuery({
    queryKey: ['media', userId, mediaId],
    queryFn: () => mediaApi.getMedia(userId, mediaId),
    staleTime: 1000 * 60 * 5,
    enabled: !!mediaId
  });
}

/**
 * Hook para sincronizar mídia com destinos
 */
export function useSyncMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      mediaId, 
      pluginId 
    }: { 
      userId: string; 
      mediaId: string;
      pluginId: string;
    }) => {
      return mediaApi.syncMedia(userId, mediaId, pluginId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['media', variables.userId, variables.mediaId] 
      });
    }
  });
}

/**
 * Hook para importar mídias de dispositivo
 */
export function useImportMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      devicePath,
      options
    }: { 
      userId: string; 
      devicePath: string;
      options?: {
        skipDuplicates?: boolean;
        autoTag?: boolean;
      };
    }) => {
      return mediaApi.importFromDevice(userId, devicePath, options);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['media', variables.userId] 
      });
    }
  });
}

/**
 * Hook para busca de mídias
 */
export function useSearchMedia(userId: string, searchQuery: string) {
  return useInfiniteQuery({
    queryKey: ['media', 'search', userId, searchQuery],
    queryFn: ({ pageParam }) => 
      mediaApi.searchMedia(userId, searchQuery, {
        lastKey: pageParam
      }),
    getNextPageParam: (lastPage) => lastPage.lastKey,
    initialPageParam: undefined,
    enabled: searchQuery.length > 0,
    staleTime: 1000 * 60 * 2
  });
}
