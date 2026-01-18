"use strict";
/**
 * MediaGrid - Grid virtualizado de thumbnails de mídias
 *
 * Usa TanStack Virtual para renderização eficiente de milhares de itens
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
exports.MediaGrid = void 0;
var react_1 = __importStar(require("react"));
var react_virtual_1 = require("@tanstack/react-virtual");
var useMediaItems_1 = require("../hooks/useMediaItems");
var MediaCard_1 = require("./MediaCard");
var MediaModal_1 = require("./MediaModal");
var Loader_1 = require("./Loader");
var MediaGrid = function (_a) {
    var userId = _a.userId, filters = _a.filters, _b = _a.columnWidth, columnWidth = _b === void 0 ? 250 : _b, _c = _a.gap, gap = _c === void 0 ? 16 : _c;
    var parentRef = (0, react_1.useRef)(null);
    var _d = (0, react_1.useState)(null), selectedMedia = _d[0], setSelectedMedia = _d[1];
    var _e = (0, react_1.useState)(0), parentWidth = _e[0], setParentWidth = _e[1];
    // Hook customizado para buscar mídias
    var _f = (0, useMediaItems_1.useMediaItems)(userId, filters), items = _f.items, isLoading = _f.isLoading, isError = _f.isError, error = _f.error, hasNextPage = _f.hasNextPage, fetchNextPage = _f.fetchNextPage, isFetchingNextPage = _f.isFetchingNextPage;
    // Calcula quantas colunas cabem
    var columnsCount = (0, react_1.useMemo)(function () {
        if (parentWidth === 0)
            return 4;
        return Math.floor((parentWidth + gap) / (columnWidth + gap));
    }, [parentWidth, columnWidth, gap]);
    // Organiza items em linhas
    var rows = (0, react_1.useMemo)(function () {
        var result = [];
        for (var i = 0; i < items.length; i += columnsCount) {
            result.push(items.slice(i, i + columnsCount));
        }
        return result;
    }, [items, columnsCount]);
    // Virtualizer para as linhas
    var rowVirtualizer = (0, react_virtual_1.useVirtualizer)({
        count: rows.length,
        getScrollElement: function () { return parentRef.current; },
        estimateSize: function () { return columnWidth + gap; },
        overscan: 3,
        onChange: function (virtualizer) {
            // Carrega mais quando chegar perto do fim
            var lastItem = virtualizer.getVirtualItems().at(-1);
            if (lastItem &&
                lastItem.index >= rows.length - 3 &&
                hasNextPage &&
                !isFetchingNextPage) {
                fetchNextPage();
            }
        }
    });
    // Observer para medir largura do container
    react_1.default.useEffect(function () {
        if (!parentRef.current)
            return;
        var resizeObserver = new ResizeObserver(function (entries) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                setParentWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(parentRef.current);
        return function () { return resizeObserver.disconnect(); };
    }, []);
    if (isLoading) {
        return (<div className="flex items-center justify-center h-screen">
        <Loader_1.Loader size="large"/>
      </div>);
    }
    if (isError) {
        return (<div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">Erro ao carregar mídias</p>
        <p className="text-gray-600">{error === null || error === void 0 ? void 0 : error.message}</p>
      </div>);
    }
    if (items.length === 0) {
        return (<div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-2">Nenhuma mídia encontrada</p>
        <p className="text-gray-400 text-sm">
          Importe mídias de um dispositivo ou faça upload de arquivos
        </p>
      </div>);
    }
    return (<>
      <div ref={parentRef} className="h-screen overflow-auto bg-gray-50" style={{ padding: "".concat(gap, "px") }}>
        <div style={{
            height: "".concat(rowVirtualizer.getTotalSize(), "px"),
            width: '100%',
            position: 'relative'
        }}>
          {rowVirtualizer.getVirtualItems().map(function (virtualRow) {
            var row = rows[virtualRow.index];
            return (<div key={virtualRow.key} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: "".concat(virtualRow.size, "px"),
                    transform: "translateY(".concat(virtualRow.start, "px)")
                }}>
                <div className="flex" style={{ gap: "".concat(gap, "px") }}>
                  {row.map(function (item) { return (<div key={item.mediaId} style={{ width: "".concat(columnWidth, "px") }}>
                      <MediaCard_1.MediaCard media={item} onClick={function () { return setSelectedMedia(item); }}/>
                    </div>); })}
                </div>
              </div>);
        })}
        </div>

        {isFetchingNextPage && (<div className="flex justify-center py-8">
            <Loader_1.Loader />
          </div>)}
      </div>

      {/* Modal para visualização */}
      {selectedMedia && (<MediaModal_1.MediaModal media={selectedMedia} onClose={function () { return setSelectedMedia(null); }} onNext={function () {
                var currentIndex = items.findIndex(function (item) { return item.mediaId === selectedMedia.mediaId; });
                if (currentIndex < items.length - 1) {
                    setSelectedMedia(items[currentIndex + 1]);
                }
            }} onPrevious={function () {
                var currentIndex = items.findIndex(function (item) { return item.mediaId === selectedMedia.mediaId; });
                if (currentIndex > 0) {
                    setSelectedMedia(items[currentIndex - 1]);
                }
            }}/>)}
    </>);
};
exports.MediaGrid = MediaGrid;
