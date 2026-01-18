"use strict";
/**
 * useMediaItems - Hook para gerenciar estado e queries de mídias
 *
 * Usa React Query para cache, paginação e sincronização
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMediaItems = useMediaItems;
exports.useUploadMedia = useUploadMedia;
exports.useDeleteMedia = useDeleteMedia;
exports.useUpdateMediaMetadata = useUpdateMediaMetadata;
exports.useMediaItem = useMediaItem;
exports.useSyncMedia = useSyncMedia;
exports.useImportMedia = useImportMedia;
exports.useSearchMedia = useSearchMedia;
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("../services/api");
function useMediaItems(userId, filters) {
    var _a;
    var queryClient = (0, react_query_1.useQueryClient)();
    var _b = (0, react_query_1.useInfiniteQuery)({
        queryKey: ['media', userId, filters],
        queryFn: function (_a) {
            var pageParam = _a.pageParam;
            return api_1.mediaApi.listMedia(userId, __assign(__assign({}, filters), { lastKey: pageParam }));
        },
        getNextPageParam: function (lastPage) { return lastPage.lastKey; },
        initialPageParam: undefined,
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 30 // 30 minutos (anteriormente cacheTime)
    }), data = _b.data, isLoading = _b.isLoading, isError = _b.isError, error = _b.error, hasNextPage = _b.hasNextPage, fetchNextPage = _b.fetchNextPage, isFetchingNextPage = _b.isFetchingNextPage, refetch = _b.refetch;
    // Flatten todas as páginas em uma única lista
    var items = (_a = data === null || data === void 0 ? void 0 : data.pages.flatMap(function (page) { return page.items; })) !== null && _a !== void 0 ? _a : [];
    return {
        items: items,
        isLoading: isLoading,
        isError: isError,
        error: error,
        hasNextPage: hasNextPage !== null && hasNextPage !== void 0 ? hasNextPage : false,
        fetchNextPage: fetchNextPage,
        isFetchingNextPage: isFetchingNextPage,
        refetch: refetch
    };
}
/**
 * Hook para upload de novas mídias
 */
function useUploadMedia() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userId = _b.userId, file = _b.file, metadata = _b.metadata;
            return __generator(this, function (_c) {
                return [2 /*return*/, api_1.mediaApi.uploadMedia(userId, file, metadata)];
            });
        }); },
        onSuccess: function (_, variables) {
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
function useDeleteMedia() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userId = _b.userId, mediaId = _b.mediaId;
            return __generator(this, function (_c) {
                return [2 /*return*/, api_1.mediaApi.deleteMedia(userId, mediaId)];
            });
        }); },
        onSuccess: function (_, variables) {
            queryClient.invalidateQueries({
                queryKey: ['media', variables.userId]
            });
        }
    });
}
/**
 * Hook para atualizar metadados de mídia
 */
function useUpdateMediaMetadata() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userId = _b.userId, mediaId = _b.mediaId, updates = _b.updates;
            return __generator(this, function (_c) {
                return [2 /*return*/, api_1.mediaApi.updateMedia(userId, mediaId, updates)];
            });
        }); },
        onMutate: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var previousData;
            var userId = _b.userId, mediaId = _b.mediaId, updates = _b.updates;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: 
                    // Cancela queries em andamento
                    return [4 /*yield*/, queryClient.cancelQueries({
                            queryKey: ['media', userId]
                        })];
                    case 1:
                        // Cancela queries em andamento
                        _c.sent();
                        previousData = queryClient.getQueryData(['media', userId]);
                        // Atualização otimista
                        queryClient.setQueryData(['media', userId], function (old) {
                            if (!old)
                                return old;
                            return __assign(__assign({}, old), { pages: old.pages.map(function (page) { return (__assign(__assign({}, page), { items: page.items.map(function (item) {
                                        return item.mediaId === mediaId
                                            ? __assign(__assign({}, item), updates) : item;
                                    }) })); }) });
                        });
                        return [2 /*return*/, { previousData: previousData }];
                }
            });
        }); },
        onError: function (_, variables, context) {
            // Reverte em caso de erro
            if (context === null || context === void 0 ? void 0 : context.previousData) {
                queryClient.setQueryData(['media', variables.userId], context.previousData);
            }
        },
        onSettled: function (_, __, variables) {
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
function useMediaItem(userId, mediaId) {
    return useQuery({
        queryKey: ['media', userId, mediaId],
        queryFn: function () { return api_1.mediaApi.getMedia(userId, mediaId); },
        staleTime: 1000 * 60 * 5,
        enabled: !!mediaId
    });
}
/**
 * Hook para sincronizar mídia com destinos
 */
function useSyncMedia() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userId = _b.userId, mediaId = _b.mediaId, pluginId = _b.pluginId;
            return __generator(this, function (_c) {
                return [2 /*return*/, api_1.mediaApi.syncMedia(userId, mediaId, pluginId)];
            });
        }); },
        onSuccess: function (_, variables) {
            queryClient.invalidateQueries({
                queryKey: ['media', variables.userId, variables.mediaId]
            });
        }
    });
}
/**
 * Hook para importar mídias de dispositivo
 */
function useImportMedia() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var userId = _b.userId, devicePath = _b.devicePath, options = _b.options;
            return __generator(this, function (_c) {
                return [2 /*return*/, api_1.mediaApi.importFromDevice(userId, devicePath, options)];
            });
        }); },
        onSuccess: function (_, variables) {
            queryClient.invalidateQueries({
                queryKey: ['media', variables.userId]
            });
        }
    });
}
/**
 * Hook para busca de mídias
 */
function useSearchMedia(userId, searchQuery) {
    return (0, react_query_1.useInfiniteQuery)({
        queryKey: ['media', 'search', userId, searchQuery],
        queryFn: function (_a) {
            var pageParam = _a.pageParam;
            return api_1.mediaApi.searchMedia(userId, searchQuery, {
                lastKey: pageParam
            });
        },
        getNextPageParam: function (lastPage) { return lastPage.lastKey; },
        initialPageParam: undefined,
        enabled: searchQuery.length > 0,
        staleTime: 1000 * 60 * 2
    });
}
