"use strict";
/**
 * Utility Functions - Media Manager
 */
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
exports.browserSupports = void 0;
exports.formatFileSize = formatFileSize;
exports.formatDate = formatDate;
exports.formatDuration = formatDuration;
exports.calculateFileMD5 = calculateFileMD5;
exports.isValidImage = isValidImage;
exports.isValidVideo = isValidVideo;
exports.extractGPSFromExif = extractGPSFromExif;
exports.getGoogleMapsUrl = getGoogleMapsUrl;
exports.compressImage = compressImage;
exports.debounce = debounce;
exports.throttle = throttle;
exports.downloadFile = downloadFile;
exports.copyToClipboard = copyToClipboard;
exports.getTagColor = getTagColor;
exports.formatCoordinates = formatCoordinates;
exports.groupMediaByDate = groupMediaByDate;
exports.calculateMediaStats = calculateMediaStats;
exports.shareMedia = shareMedia;
/**
 * Formata tamanho de arquivo para exibição
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return "".concat((bytes / Math.pow(k, i)).toFixed(1), " ").concat(sizes[i]);
}
/**
 * Formata data para exibição
 */
function formatDate(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffMs = now.getTime() - date.getTime();
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    // Hoje
    if (diffDays === 0) {
        return "Hoje \u00E0s ".concat(date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }));
    }
    // Ontem
    if (diffDays === 1) {
        return 'Ontem';
    }
    // Esta semana
    if (diffDays < 7) {
        return "".concat(diffDays, " dias atr\u00E1s");
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
function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor(seconds % 60);
    if (hours > 0) {
        return "".concat(hours, ":").concat(minutes.toString().padStart(2, '0'), ":").concat(secs.toString().padStart(2, '0'));
    }
    return "".concat(minutes, ":").concat(secs.toString().padStart(2, '0'));
}
/**
 * Calcula hash MD5 de arquivo (para detecção de duplicatas)
 */
function calculateFileMD5(file) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, hashBuffer, hashArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, file.arrayBuffer()];
                case 1:
                    buffer = _a.sent();
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', buffer)];
                case 2:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    return [2 /*return*/, hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('')];
            }
        });
    });
}
/**
 * Valida se arquivo é uma imagem suportada
 */
function isValidImage(file) {
    var validTypes = [
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
function isValidVideo(file) {
    var validTypes = [
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
function extractGPSFromExif(exif) {
    if (!exif.GPSLatitude || !exif.GPSLongitude) {
        return null;
    }
    var lat = convertDMSToDD(exif.GPSLatitude[0], exif.GPSLatitude[1], exif.GPSLatitude[2], exif.GPSLatitudeRef);
    var lon = convertDMSToDD(exif.GPSLongitude[0], exif.GPSLongitude[1], exif.GPSLongitude[2], exif.GPSLongitudeRef);
    return { lat: lat, lon: lon };
}
/**
 * Converte coordenadas DMS (Degrees Minutes Seconds) para DD (Decimal Degrees)
 */
function convertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        dd = dd * -1;
    }
    return dd;
}
/**
 * Gera URL do Google Maps para coordenadas
 */
function getGoogleMapsUrl(lat, lon) {
    return "https://www.google.com/maps?q=".concat(lat, ",").concat(lon);
}
/**
 * Comprime imagem antes do upload
 */
function compressImage(file_1) {
    return __awaiter(this, arguments, void 0, function (file, maxWidth, quality) {
        if (maxWidth === void 0) { maxWidth = 1920; }
        if (quality === void 0) { quality = 0.8; }
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var img = new Image();
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context not available'));
                        return;
                    }
                    img.onload = function () {
                        var width = img.width;
                        var height = img.height;
                        // Redimensiona se necessário
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        canvas.toBlob(function (blob) {
                            if (blob) {
                                resolve(blob);
                            }
                            else {
                                reject(new Error('Failed to compress image'));
                            }
                        }, file.type, quality);
                    };
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                })];
        });
    });
}
/**
 * Debounce function para otimizar buscas
 */
function debounce(func, wait) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
}
/**
 * Throttle function para otimizar scroll/resize events
 */
function throttle(func, limit) {
    var inThrottle;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!inThrottle) {
            func.apply(void 0, args);
            inThrottle = true;
            setTimeout(function () { return (inThrottle = false); }, limit);
        }
    };
}
/**
 * Download de arquivo
 */
function downloadFile(url, filename) {
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
/**
 * Copia texto para clipboard
 */
function copyToClipboard(text) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, textarea, success;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    success = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    return [2 /*return*/, success];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gera cores para tags baseado em hash
 */
function getTagColor(tag) {
    var colors = [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-yellow-100 text-yellow-800',
        'bg-red-100 text-red-800',
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-indigo-100 text-indigo-800',
        'bg-gray-100 text-gray-800'
    ];
    var hash = 0;
    for (var i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
/**
 * Formata coordenadas para exibição
 */
function formatCoordinates(lat, lon) {
    var latDir = lat >= 0 ? 'N' : 'S';
    var lonDir = lon >= 0 ? 'E' : 'W';
    return "".concat(Math.abs(lat).toFixed(6), "\u00B0 ").concat(latDir, ", ").concat(Math.abs(lon).toFixed(6), "\u00B0 ").concat(lonDir);
}
/**
 * Agrupa mídias por data
 */
function groupMediaByDate(items) {
    var groups = new Map();
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var date = new Date(item.captureDate);
        var key = date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(item);
    }
    return groups;
}
/**
 * Calcula estatísticas de uma coleção de mídias
 */
function calculateMediaStats(items) {
    var totalSize = items.reduce(function (sum, item) { return sum + item.fileSize; }, 0);
    var byType = items.reduce(function (acc, item) {
        var type = item.fileType.split('/')[0]; // 'image' ou 'video'
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    var byMonth = items.reduce(function (acc, item) {
        var date = new Date(item.captureDate);
        var key = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'));
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    return {
        total: items.length,
        totalSize: totalSize,
        averageSize: totalSize / items.length,
        byType: byType,
        byMonth: byMonth
    };
}
/**
 * Verifica se browser suporta feature
 */
exports.browserSupports = {
    webp: function () {
        var canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    },
    serviceWorker: function () { return 'serviceWorker' in navigator; },
    fileSystemAccess: function () { return 'showOpenFilePicker' in window; },
    webShare: function () { return 'share' in navigator; }
};
/**
 * Compartilha via Web Share API
 */
function shareMedia(title, text, url) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!exports.browserSupports.webShare()) {
                        return [2 /*return*/, false];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.share({ title: title, text: text, url: url })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, true];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
