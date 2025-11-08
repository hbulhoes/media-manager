/**
 * SearchBar - Barra de busca avançada com filtros
 */

import React, { useState } from 'react';
import { Search, Filter, X, Calendar, MapPin, Tag } from 'lucide-react';
import type { MediaFilters } from './MediaGrid';

interface SearchBarProps {
  onSearch: (filters: MediaFilters) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear }) => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MediaFilters>({});

  const handleSearch = () => {
    onSearch({
      ...filters,
      searchText: searchText || undefined
    });
  };

  const handleClear = () => {
    setSearchText('');
    setFilters({});
    onClear();
  };

  const updateFilter = <K extends keyof MediaFilters>(
    key: K,
    value: MediaFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Barra de busca principal */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, tag, local..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            showFilters || activeFiltersCount > 0
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>

        {(searchText || activeFiltersCount > 0) && (
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Painel de filtros avançados */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Período
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="De"
              />
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Até"
              />
            </div>
          </div>

          {/* Filtro de localização */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Localização
            </label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Ex: São Paulo, Brasil"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Filtro de tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => 
                updateFilter('tags', e.target.value.split(',').map(t => t.trim()))
              }
              placeholder="Ex: férias, família"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Filtro de tipo de arquivo */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipo de Mídia
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.fileTypes?.includes('image/*')}
                  onChange={(e) => {
                    const types = filters.fileTypes || [];
                    if (e.target.checked) {
                      updateFilter('fileTypes', [...types, 'image/*']);
                    } else {
                      updateFilter('fileTypes', types.filter(t => t !== 'image/*'));
                    }
                  }}
                  className="rounded"
                />
                Fotos
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.fileTypes?.includes('video/*')}
                  onChange={(e) => {
                    const types = filters.fileTypes || [];
                    if (e.target.checked) {
                      updateFilter('fileTypes', [...types, 'video/*']);
                    } else {
                      updateFilter('fileTypes', types.filter(t => t !== 'video/*'));
                    }
                  }}
                  className="rounded"
                />
                Vídeos
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tags ativas */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              De: {filters.dateFrom}
              <button
                onClick={() => updateFilter('dateFrom', undefined)}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              Até: {filters.dateTo}
              <button
                onClick={() => updateFilter('dateTo', undefined)}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              📍 {filters.location}
              <button
                onClick={() => updateFilter('location', undefined)}
                className="hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
            >
              #{tag}
              <button
                onClick={() => 
                  updateFilter('tags', filters.tags?.filter((_, i) => i !== idx))
                }
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
