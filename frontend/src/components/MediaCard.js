"use strict";
/**
 * MediaCard - Card individual para exibir thumbnail de mídia
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaCard = void 0;
var react_1 = __importStar(require("react"));
var lucide_react_1 = require("lucide-react");
var formatters_1 = require("../utils/formatters");
var MediaCard = function (_a) {
    var _b, _c, _d;
    var media = _a.media, onClick = _a.onClick;
    var _e = (0, react_1.useState)(false), imageLoaded = _e[0], setImageLoaded = _e[1];
    var _f = (0, react_1.useState)(false), imageError = _f[0], setImageError = _f[1];
    var isVideo = media.fileType.startsWith('video/');
    var hasLocation = (_b = media.metadata.gps) === null || _b === void 0 ? void 0 : _b.location;
    var hasSyncIssues = (_c = media.destinations) === null || _c === void 0 ? void 0 : _c.some(function (d) { return d.status === 'error'; });
    return (<div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden" onClick={onClick}>
      {/* Thumbnail */}
      <div className="aspect-square relative bg-gray-100">
        {!imageLoaded && !imageError && (<div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-gray-200"/>
          </div>)}
        
        {imageError ? (<div className="absolute inset-0 flex items-center justify-center">
            <lucide_react_1.AlertCircle className="w-12 h-12 text-gray-400"/>
          </div>) : (<img src={media.thumbnailPath} alt={media.fileName} className={"w-full h-full object-cover transition-opacity duration-300 ".concat(imageLoaded ? 'opacity-100' : 'opacity-0')} onLoad={function () { return setImageLoaded(true); }} onError={function () { return setImageError(true); }} loading="lazy"/>)}

        {/* Badge de vídeo */}
        {isVideo && (<div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
            <lucide_react_1.Play className="w-4 h-4 text-white"/>
          </div>)}

        {/* Badge de sync issues */}
        {hasSyncIssues && (<div className="absolute top-2 left-2 bg-red-500 rounded-full p-2">
            <lucide_react_1.AlertCircle className="w-4 h-4 text-white"/>
          </div>)}

        {/* Overlay ao hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"/>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Data e tamanho */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <lucide_react_1.Clock className="w-3 h-3"/>
            <span>{(0, formatters_1.formatDate)(media.captureDate)}</span>
          </div>
          <span>{(0, formatters_1.formatFileSize)(media.fileSize)}</span>
        </div>

        {/* Nome do arquivo (truncado) */}
        <p className="text-sm font-medium text-gray-900 truncate mb-2">
          {media.fileName}
        </p>

        {/* Tags e localização */}
        <div className="flex items-center gap-2 text-xs">
          {hasLocation && (<div className="flex items-center gap-1 text-blue-600">
              <lucide_react_1.MapPin className="w-3 h-3"/>
              <span className="truncate max-w-[100px]">
                {(_d = media.metadata.gps) === null || _d === void 0 ? void 0 : _d.location}
              </span>
            </div>)}
          
          {media.tags && media.tags.length > 0 && (<div className="flex items-center gap-1 text-gray-500">
              <lucide_react_1.Tag className="w-3 h-3"/>
              <span>{media.tags.length}</span>
            </div>)}
        </div>

        {/* Status de sincronização */}
        {media.destinations && media.destinations.length > 0 && (<div className="mt-2 flex gap-1">
            {media.destinations.map(function (dest, idx) { return (<div key={idx} className={"w-2 h-2 rounded-full ".concat(dest.status === 'synced'
                    ? 'bg-green-500'
                    : dest.status === 'error'
                        ? 'bg-red-500'
                        : dest.status === 'syncing'
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-gray-300')} title={"".concat(dest.pluginId, ": ").concat(dest.status)}/>); })}
          </div>)}
      </div>

      {/* Badge de seleção (para futuro multi-select) */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <input type="checkbox" className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer" onClick={function (e) { return e.stopPropagation(); }}/>
      </div>
    </div>);
};
exports.MediaCard = MediaCard;
