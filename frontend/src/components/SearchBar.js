"use strict";
/**
 * SearchBar - Barra de busca avançada com filtros
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchBar = void 0;
var react_1 = __importStar(require("react"));
var lucide_react_1 = require("lucide-react");
var SearchBar = function (_a) {
    var _b, _c, _d, _e;
    var onSearch = _a.onSearch, onClear = _a.onClear;
    var _f = (0, react_1.useState)(''), searchText = _f[0], setSearchText = _f[1];
    var _g = (0, react_1.useState)(false), showFilters = _g[0], setShowFilters = _g[1];
    var _h = (0, react_1.useState)({}), filters = _h[0], setFilters = _h[1];
    var handleSearch = function () {
        onSearch(__assign(__assign({}, filters), { searchText: searchText || undefined }));
    };
    var handleClear = function () {
        setSearchText('');
        setFilters({});
        onClear();
    };
    var updateFilter = function (key, value) {
        setFilters(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    var activeFiltersCount = Object.values(filters).filter(Boolean).length;
    return (<div className="bg-white rounded-lg shadow-sm p-4">
      {/* Barra de busca principal */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
          <input type="text" placeholder="Buscar por nome, tag, local..." value={searchText} onChange={function (e) { return setSearchText(e.target.value); }} onKeyDown={function (e) { return e.key === 'Enter' && handleSearch(); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
        </div>

        <button onClick={function () { return setShowFilters(!showFilters); }} className={"flex items-center gap-2 px-4 py-2 rounded-lg border ".concat(showFilters || activeFiltersCount > 0
            ? 'bg-blue-50 border-blue-500 text-blue-700'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50')}>
          <lucide_react_1.Filter className="w-5 h-5"/>
          Filtros
          {activeFiltersCount > 0 && (<span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>)}
        </button>

        <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Buscar
        </button>

        {(searchText || activeFiltersCount > 0) && (<button onClick={handleClear} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <lucide_react_1.X className="w-5 h-5"/>
          </button>)}
      </div>

      {/* Painel de filtros avançados */}
      {showFilters && (<div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <lucide_react_1.Calendar className="w-4 h-4"/>
              Período
            </label>
            <div className="space-y-2">
              <input type="date" value={filters.dateFrom || ''} onChange={function (e) { return updateFilter('dateFrom', e.target.value); }} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="De"/>
              <input type="date" value={filters.dateTo || ''} onChange={function (e) { return updateFilter('dateTo', e.target.value); }} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Até"/>
            </div>
          </div>

          {/* Filtro de localização */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <lucide_react_1.MapPin className="w-4 h-4"/>
              Localização
            </label>
            <input type="text" value={filters.location || ''} onChange={function (e) { return updateFilter('location', e.target.value); }} placeholder="Ex: São Paulo, Brasil" className="w-full px-3 py-2 border border-gray-300 rounded text-sm"/>
          </div>

          {/* Filtro de tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <lucide_react_1.Tag className="w-4 h-4"/>
              Tags
            </label>
            <input type="text" value={((_b = filters.tags) === null || _b === void 0 ? void 0 : _b.join(', ')) || ''} onChange={function (e) {
                return updateFilter('tags', e.target.value.split(',').map(function (t) { return t.trim(); }));
            }} placeholder="Ex: férias, família" className="w-full px-3 py-2 border border-gray-300 rounded text-sm"/>
          </div>

          {/* Filtro de tipo de arquivo */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipo de Mídia
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(_c = filters.fileTypes) === null || _c === void 0 ? void 0 : _c.includes('image/*')} onChange={function (e) {
                var types = filters.fileTypes || [];
                if (e.target.checked) {
                    updateFilter('fileTypes', __spreadArray(__spreadArray([], types, true), ['image/*'], false));
                }
                else {
                    updateFilter('fileTypes', types.filter(function (t) { return t !== 'image/*'; }));
                }
            }} className="rounded"/>
                Fotos
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(_d = filters.fileTypes) === null || _d === void 0 ? void 0 : _d.includes('video/*')} onChange={function (e) {
                var types = filters.fileTypes || [];
                if (e.target.checked) {
                    updateFilter('fileTypes', __spreadArray(__spreadArray([], types, true), ['video/*'], false));
                }
                else {
                    updateFilter('fileTypes', types.filter(function (t) { return t !== 'video/*'; }));
                }
            }} className="rounded"/>
                Vídeos
              </label>
            </div>
          </div>
        </div>)}

      {/* Tags ativas */}
      {activeFiltersCount > 0 && !showFilters && (<div className="mt-3 flex flex-wrap gap-2">
          {filters.dateFrom && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              De: {filters.dateFrom}
              <button onClick={function () { return updateFilter('dateFrom', undefined); }} className="hover:text-gray-900">
                <lucide_react_1.X className="w-3 h-3"/>
              </button>
            </span>)}
          {filters.dateTo && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              Até: {filters.dateTo}
              <button onClick={function () { return updateFilter('dateTo', undefined); }} className="hover:text-gray-900">
                <lucide_react_1.X className="w-3 h-3"/>
              </button>
            </span>)}
          {filters.location && (<span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              📍 {filters.location}
              <button onClick={function () { return updateFilter('location', undefined); }} className="hover:text-gray-900">
                <lucide_react_1.X className="w-3 h-3"/>
              </button>
            </span>)}
          {(_e = filters.tags) === null || _e === void 0 ? void 0 : _e.map(function (tag, idx) { return (<span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
              #{tag}
              <button onClick={function () { var _a; return updateFilter('tags', (_a = filters.tags) === null || _a === void 0 ? void 0 : _a.filter(function (_, i) { return i !== idx; })); }} className="hover:text-blue-900">
                <lucide_react_1.X className="w-3 h-3"/>
              </button>
            </span>); })}
        </div>)}
    </div>);
};
exports.SearchBar = SearchBar;
