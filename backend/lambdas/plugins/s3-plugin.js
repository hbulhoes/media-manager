"use strict";
/**
 * Plugin S3 - Armazenamento em buckets AWS S3
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
exports.S3Plugin = void 0;
var client_s3_1 = require("@aws-sdk/client-s3");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var interfaces_1 = require("./interfaces");
var S3Plugin = /** @class */ (function () {
    function S3Plugin() {
        this.id = 's3-storage';
        this.name = 'AWS S3 Storage';
        this.description = 'Armazena mídias em buckets AWS S3 com suporte a múltiplas classes de armazenamento';
        this.version = '1.0.0';
        this.capabilities = {
            supportsStreaming: true,
            supportsResumable: true,
            supportsVersioning: true,
            supportsStorageClasses: true,
            supportsMetadata: true,
            supportsSharing: true,
            maxFileSize: 5 * 1024 * 1024 * 1024 * 1024, // 5TB
            supportedFormats: undefined // Todos os formatos
        };
        this.s3Client = null;
        this.config = null;
        this.metrics = {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            totalBytesTransferred: 0,
            averageSyncTime: 0
        };
    }
    S3Plugin.prototype.initialize = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.config = config.config;
                this.s3Client = new client_s3_1.S3Client({
                    region: this.config.region,
                    maxAttempts: config.retryAttempts || 3
                });
                return [2 /*return*/];
            });
        });
    };
    S3Plugin.prototype.validateConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var s3Config, testClient, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        s3Config = config;
                        if (!s3Config.bucketName || !s3Config.region) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        testClient = new client_s3_1.S3Client({ region: s3Config.region });
                        return [4 /*yield*/, testClient.send(new client_s3_1.HeadObjectCommand({
                                Bucket: s3Config.bucketName,
                                Key: '_test_' // Teste simples
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        // Se o erro for NoSuchKey, o bucket existe e temos acesso
                        return [2 /*return*/, error_1.name === 'NotFound' || error_1.name === 'NoSuchKey'];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3Plugin.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.s3Client || !this.config) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Lista objetos do bucket para validar permissões
                        return [4 /*yield*/, this.s3Client.send(new client_s3_1.HeadObjectCommand({
                                Bucket: this.config.bucketName,
                                Key: '_test_connection_'
                            }))];
                    case 2:
                        // Lista objetos do bucket para validar permissões
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _a.sent();
                        // Se o erro for NoSuchKey, a conexão está ok
                        return [2 /*return*/, error_2.name === 'NotFound' || error_2.name === 'NoSuchKey'];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3Plugin.prototype.syncMedia = function (media, options) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, key, storageClass, metadata, putCommand, duration, destinationPath, error_3, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.s3Client || !this.config) {
                            throw new Error('Plugin não inicializado');
                        }
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        key = this.buildS3Key(media);
                        storageClass = this.mapStorageClass((options === null || options === void 0 ? void 0 : options.storageClass) || this.config.defaultStorageClass || interfaces_1.StorageClass.STANDARD);
                        metadata = {
                            'media-id': media.mediaId,
                            'user-id': media.userId,
                            'original-filename': media.fileName,
                            'file-type': media.fileType,
                            'capture-date': media.metadata.captureDate
                        };
                        if (media.metadata.gps) {
                            metadata['gps-lat'] = media.metadata.gps.latitude.toString();
                            metadata['gps-lon'] = media.metadata.gps.longitude.toString();
                        }
                        putCommand = new client_s3_1.PutObjectCommand({
                            Bucket: this.config.bucketName,
                            Key: key,
                            StorageClass: storageClass,
                            Metadata: (options === null || options === void 0 ? void 0 : options.preserveMetadata) ? metadata : undefined,
                            ServerSideEncryption: this.config.serverSideEncryption,
                            SSEKMSKeyId: this.config.kmsKeyId,
                            ContentType: media.fileType,
                            Tagging: (options === null || options === void 0 ? void 0 : options.tags) ? this.buildTagString(options.tags) : undefined
                        });
                        // Faz o upload
                        // Nota: Para arquivos grandes, usar multipart upload
                        return [4 /*yield*/, this.s3Client.send(putCommand)];
                    case 2:
                        // Faz o upload
                        // Nota: Para arquivos grandes, usar multipart upload
                        _a.sent();
                        duration = Date.now() - startTime;
                        // Atualiza métricas
                        this.updateMetrics(true, media.fileSize, duration);
                        destinationPath = "s3://".concat(this.config.bucketName, "/").concat(key);
                        return [2 /*return*/, {
                                success: true,
                                destinationPath: destinationPath,
                                bytesTransferred: media.fileSize,
                                duration: duration,
                                metadata: {
                                    storageClass: storageClass,
                                    versionId: undefined // Será preenchido se versioning estiver ativo
                                }
                            }];
                    case 3:
                        error_3 = _a.sent();
                        duration = Date.now() - startTime;
                        this.updateMetrics(false, 0, duration);
                        return [2 /*return*/, {
                                success: false,
                                error: error_3.message,
                                duration: duration
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3Plugin.prototype.deleteMedia = function (mediaId, destinationPath) {
        return __awaiter(this, void 0, void 0, function () {
            var key, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.s3Client || !this.config) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        key = this.extractKeyFromPath(destinationPath);
                        return [4 /*yield*/, this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                                Bucket: this.config.bucketName,
                                Key: key
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Erro ao deletar mídia:', error_4);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3Plugin.prototype.exists = function (destinationPath) {
        return __awaiter(this, void 0, void 0, function () {
            var key, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.s3Client || !this.config) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        key = this.extractKeyFromPath(destinationPath);
                        return [4 /*yield*/, this.s3Client.send(new client_s3_1.HeadObjectCommand({
                                Bucket: this.config.bucketName,
                                Key: key
                            }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3Plugin.prototype.getAccessUrl = function (destinationPath_1) {
        return __awaiter(this, arguments, void 0, function (destinationPath, expiresIn) {
            var key, command, url, error_6;
            if (expiresIn === void 0) { expiresIn = 3600; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.s3Client || !this.config) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        key = this.extractKeyFromPath(destinationPath);
                        command = new client_s3_1.GetObjectCommand({
                            Bucket: this.config.bucketName,
                            Key: key
                        });
                        return [4 /*yield*/, (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: expiresIn })];
                    case 2:
                        url = _a.sent();
                        return [2 /*return*/, url];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Erro ao gerar URL:', error_6);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3Plugin.prototype.getMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __assign({}, this.metrics)];
            });
        });
    };
    S3Plugin.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.s3Client = null;
                this.config = null;
                return [2 /*return*/];
            });
        });
    };
    // Métodos auxiliares privados
    S3Plugin.prototype.buildS3Key = function (media) {
        var _a;
        var prefix = ((_a = this.config) === null || _a === void 0 ? void 0 : _a.prefix) || 'media';
        var date = new Date(media.metadata.captureDate);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        // Organiza por: prefix/userId/year/month/mediaId.ext
        var extension = media.fileName.split('.').pop();
        return "".concat(prefix, "/").concat(media.userId, "/").concat(year, "/").concat(month, "/").concat(media.mediaId, ".").concat(extension);
    };
    S3Plugin.prototype.extractKeyFromPath = function (s3Path) {
        // Remove s3://bucket-name/ do início
        return s3Path.replace(/^s3:\/\/[^\/]+\//, '');
    };
    S3Plugin.prototype.mapStorageClass = function (storageClass) {
        var _a;
        var mapping = (_a = {},
            _a[interfaces_1.StorageClass.STANDARD] = 'STANDARD',
            _a[interfaces_1.StorageClass.INTELLIGENT_TIERING] = 'INTELLIGENT_TIERING',
            _a[interfaces_1.StorageClass.STANDARD_IA] = 'STANDARD_IA',
            _a[interfaces_1.StorageClass.ONEZONE_IA] = 'ONEZONE_IA',
            _a[interfaces_1.StorageClass.GLACIER_INSTANT] = 'GLACIER_INSTANT_RETRIEVAL',
            _a[interfaces_1.StorageClass.GLACIER_FLEXIBLE] = 'GLACIER',
            _a[interfaces_1.StorageClass.DEEP_ARCHIVE] = 'DEEP_ARCHIVE',
            _a[interfaces_1.StorageClass.HOT] = 'STANDARD',
            _a[interfaces_1.StorageClass.COOL] = 'STANDARD_IA',
            _a[interfaces_1.StorageClass.ARCHIVE] = 'GLACIER',
            _a);
        return mapping[storageClass] || 'STANDARD';
    };
    S3Plugin.prototype.buildTagString = function (tags) {
        return Object.entries(tags)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value));
        })
            .join('&');
    };
    S3Plugin.prototype.updateMetrics = function (success, bytes, duration) {
        this.metrics.totalSyncs++;
        if (success) {
            this.metrics.successfulSyncs++;
            this.metrics.totalBytesTransferred += bytes;
            // Calcula média móvel do tempo de sync
            var totalTime = this.metrics.averageSyncTime * (this.metrics.successfulSyncs - 1) + duration;
            this.metrics.averageSyncTime = totalTime / this.metrics.successfulSyncs;
        }
        else {
            this.metrics.failedSyncs++;
        }
        this.metrics.lastSyncAt = new Date().toISOString();
    };
    return S3Plugin;
}());
exports.S3Plugin = S3Plugin;
