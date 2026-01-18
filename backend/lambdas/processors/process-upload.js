"use strict";
/**
 * Lambda: Process Media Upload
 *
 * Processa uploads de mídia:
 * - Extrai metadados EXIF
 * - Gera thumbnails
 * - Salva no DynamoDB
 * - Dispara eventos para plugins
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var client_s3_1 = require("@aws-sdk/client-s3");
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var client_eventbridge_1 = require("@aws-sdk/client-eventbridge");
var sharp_1 = __importDefault(require("sharp"));
var exif_parser_1 = __importDefault(require("exif-parser"));
var s3Client = new client_s3_1.S3Client({});
var dynamoClient = new client_dynamodb_1.DynamoDBClient({});
var docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
var eventBridgeClient = new client_eventbridge_1.EventBridgeClient({});
var MEDIA_TABLE = process.env.MEDIA_TABLE_NAME || 'media-items';
var THUMBNAIL_BUCKET = process.env.THUMBNAIL_BUCKET_NAME;
var EVENT_BUS_NAME = process.env.EVENT_BUS_NAME;
var THUMBNAIL_SIZES = {
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 }
};
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, record, bucket, key, pathParts, userId, fileNameWithExt, mediaId, getObjectCommand, s3Object, fileBuffer, fileType, fileSize, metadata, thumbnailPath, result, result, captureDate, mediaItem, geohash, putCommand, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log('Processing S3 Event:', JSON.stringify(event, null, 2));
                _b.label = 1;
            case 1:
                _b.trys.push([1, 14, , 15]);
                _i = 0, _a = event.Records;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 13];
                record = _a[_i];
                bucket = record.s3.bucket.name;
                key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
                console.log("Processing: s3://".concat(bucket, "/").concat(key));
                pathParts = key.split('/');
                userId = pathParts[1];
                fileNameWithExt = pathParts[pathParts.length - 1];
                mediaId = fileNameWithExt.split('.')[0];
                getObjectCommand = new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key });
                return [4 /*yield*/, s3Client.send(getObjectCommand)];
            case 3:
                s3Object = _b.sent();
                if (!s3Object.Body) {
                    throw new Error('Empty S3 object body');
                }
                return [4 /*yield*/, streamToBuffer(s3Object.Body)];
            case 4:
                fileBuffer = _b.sent();
                fileType = s3Object.ContentType || 'application/octet-stream';
                fileSize = s3Object.ContentLength || fileBuffer.length;
                metadata = {};
                thumbnailPath = '';
                if (!fileType.startsWith('image/')) return [3 /*break*/, 6];
                return [4 /*yield*/, processImage(fileBuffer, userId, mediaId, fileType)];
            case 5:
                result = _b.sent();
                metadata = result.metadata;
                thumbnailPath = result.thumbnailPath;
                return [3 /*break*/, 8];
            case 6:
                if (!fileType.startsWith('video/')) return [3 /*break*/, 8];
                return [4 /*yield*/, processVideo(fileBuffer, userId, mediaId, fileType)];
            case 7:
                result = _b.sent();
                metadata = result.metadata;
                thumbnailPath = result.thumbnailPath;
                _b.label = 8;
            case 8:
                captureDate = metadata.captureDate || new Date().toISOString();
                mediaItem = {
                    PK: "USER#".concat(userId),
                    SK: "MEDIA#".concat(captureDate, "#").concat(mediaId),
                    GSI1PK: "USER#".concat(userId),
                    GSI1SK: "DATE#".concat(captureDate),
                    mediaId: mediaId,
                    userId: userId,
                    fileName: fileNameWithExt,
                    fileType: fileType,
                    fileSize: fileSize,
                    originalPath: "s3://".concat(bucket, "/").concat(key),
                    thumbnailPath: thumbnailPath,
                    captureDate: captureDate,
                    uploadDate: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    metadata: metadata,
                    tags: [],
                    keywords: [],
                    destinations: [],
                    status: 'active',
                    deleted: false
                };
                // Adiciona GSIs para localização e tags se disponíveis
                if (metadata.gps) {
                    geohash = generateGeohash(metadata.gps.latitude, metadata.gps.longitude, 6);
                    mediaItem['GSI2PK'] = "USER#".concat(userId, "#LOCATION#").concat(geohash);
                    mediaItem['GSI2SK'] = "MEDIA#".concat(captureDate, "#").concat(mediaId);
                }
                putCommand = new lib_dynamodb_1.PutCommand({
                    TableName: MEDIA_TABLE,
                    Item: mediaItem
                });
                return [4 /*yield*/, docClient.send(putCommand)];
            case 9:
                _b.sent();
                console.log("Saved to DynamoDB: ".concat(mediaId));
                // Emite evento para processar plugins
                return [4 /*yield*/, emitMediaUploadedEvent(userId, mediaId, mediaItem)];
            case 10:
                // Emite evento para processar plugins
                _b.sent();
                // Emite evento para análise de IA (opcional)
                return [4 /*yield*/, emitAIAnalysisEvent(userId, mediaId, mediaItem)];
            case 11:
                // Emite evento para análise de IA (opcional)
                _b.sent();
                _b.label = 12;
            case 12:
                _i++;
                return [3 /*break*/, 2];
            case 13: return [2 /*return*/, { statusCode: 200, body: 'Processing completed' }];
            case 14:
                error_1 = _b.sent();
                console.error('Error processing upload:', error_1);
                throw error_1;
            case 15: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
/**
 * Processa imagem: extrai EXIF e gera thumbnails
 */
function processImage(buffer, userId, mediaId, fileType) {
    return __awaiter(this, void 0, void 0, function () {
        var image, imageMetadata, exifData, gpsData, parser, exifResult, thumbnailBuffer, thumbnailKey, thumbnailPath, metadata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    image = (0, sharp_1.default)(buffer);
                    return [4 /*yield*/, image.metadata()];
                case 1:
                    imageMetadata = _a.sent();
                    exifData = {};
                    gpsData = undefined;
                    try {
                        if (buffer.length > 65635) { // EXIF parser requer tamanho mínimo
                            parser = exif_parser_1.default.create(buffer);
                            exifResult = parser.parse();
                            exifData = exifResult.tags;
                            if (exifResult.tags.GPSLatitude && exifResult.tags.GPSLongitude) {
                                gpsData = {
                                    latitude: exifResult.tags.GPSLatitude,
                                    longitude: exifResult.tags.GPSLongitude,
                                    altitude: exifResult.tags.GPSAltitude
                                };
                            }
                        }
                    }
                    catch (error) {
                        console.warn('Could not extract EXIF:', error);
                    }
                    return [4 /*yield*/, image
                            .resize(THUMBNAIL_SIZES.medium.width, THUMBNAIL_SIZES.medium.height, {
                            fit: 'cover',
                            position: 'center'
                        })
                            .jpeg({ quality: 80 })
                            .toBuffer()];
                case 2:
                    thumbnailBuffer = _a.sent();
                    thumbnailKey = "thumbnails/".concat(userId, "/").concat(mediaId, "_thumb.jpg");
                    return [4 /*yield*/, s3Client.send(new client_s3_1.PutObjectCommand({
                            Bucket: THUMBNAIL_BUCKET,
                            Key: thumbnailKey,
                            Body: thumbnailBuffer,
                            ContentType: 'image/jpeg'
                        }))];
                case 3:
                    _a.sent();
                    thumbnailPath = "s3://".concat(THUMBNAIL_BUCKET, "/").concat(thumbnailKey);
                    metadata = {
                        width: imageMetadata.width,
                        height: imageMetadata.height,
                        format: imageMetadata.format,
                        colorSpace: imageMetadata.space,
                        orientation: imageMetadata.orientation,
                        captureDate: exifData.CreateDate
                            ? new Date(exifData.CreateDate * 1000).toISOString()
                            : new Date().toISOString(),
                        cameraMake: exifData.Make,
                        cameraModel: exifData.Model,
                        iso: exifData.ISO,
                        aperture: exifData.FNumber,
                        shutterSpeed: exifData.ExposureTime ? "1/".concat(Math.round(1 / exifData.ExposureTime)) : undefined,
                        focalLength: exifData.FocalLength,
                        flash: exifData.Flash === 1,
                        gps: gpsData
                    };
                    return [2 /*return*/, { metadata: metadata, thumbnailPath: thumbnailPath }];
            }
        });
    });
}
/**
 * Processa vídeo: extrai metadados e gera thumbnail do primeiro frame
 */
function processVideo(buffer, userId, mediaId, fileType) {
    return __awaiter(this, void 0, void 0, function () {
        var metadata, thumbnailPath;
        return __generator(this, function (_a) {
            metadata = {
                width: 1920,
                height: 1080,
                format: fileType.split('/')[1],
                duration: 0, // segundos
                captureDate: new Date().toISOString()
            };
            thumbnailPath = "s3://".concat(THUMBNAIL_BUCKET, "/thumbnails/").concat(userId, "/").concat(mediaId, "_thumb.jpg");
            return [2 /*return*/, { metadata: metadata, thumbnailPath: thumbnailPath }];
        });
    });
}
/**
 * Emite evento de upload concluído para processamento de plugins
 */
function emitMediaUploadedEvent(userId, mediaId, mediaItem) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!EVENT_BUS_NAME)
                        return [2 /*return*/];
                    return [4 /*yield*/, eventBridgeClient.send(new client_eventbridge_1.PutEventsCommand({
                            Entries: [{
                                    Source: 'media-manager.upload',
                                    DetailType: 'MediaUploaded',
                                    Detail: JSON.stringify({
                                        userId: userId,
                                        mediaId: mediaId,
                                        mediaItem: mediaItem
                                    }),
                                    EventBusName: EVENT_BUS_NAME
                                }]
                        }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Emite evento para análise de IA
 */
function emitAIAnalysisEvent(userId, mediaId, mediaItem) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!EVENT_BUS_NAME)
                        return [2 /*return*/];
                    return [4 /*yield*/, eventBridgeClient.send(new client_eventbridge_1.PutEventsCommand({
                            Entries: [{
                                    Source: 'media-manager.ai',
                                    DetailType: 'MediaReadyForAnalysis',
                                    Detail: JSON.stringify({
                                        userId: userId,
                                        mediaId: mediaId,
                                        fileType: mediaItem.fileType,
                                        originalPath: mediaItem.originalPath
                                    }),
                                    EventBusName: EVENT_BUS_NAME
                                }]
                        }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Converte stream para buffer
 */
function streamToBuffer(stream) {
    return __awaiter(this, void 0, void 0, function () {
        var chunks, chunk, e_1_1;
        var _a, stream_1, stream_1_1;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    chunks = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _e.label = 2;
                case 2: return [4 /*yield*/, stream_1.next()];
                case 3:
                    if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = stream_1_1.value;
                    _a = false;
                    chunk = _d;
                    chunks.push(chunk);
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, Buffer.concat(chunks)];
            }
        });
    });
}
/**
 * Gera geohash para localização
 * Implementação simplificada - usar biblioteca geohash completa em produção
 */
function generateGeohash(lat, lon, precision) {
    var base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    var hash = '';
    var bits = 0;
    var bitsTotal = 0;
    var latRange = [-90, 90];
    var lonRange = [-180, 180];
    while (hash.length < precision) {
        if (bitsTotal % 2 === 0) {
            var mid = (lonRange[0] + lonRange[1]) / 2;
            if (lon > mid) {
                bits |= (1 << (4 - (bitsTotal % 5)));
                lonRange[0] = mid;
            }
            else {
                lonRange[1] = mid;
            }
        }
        else {
            var mid = (latRange[0] + latRange[1]) / 2;
            if (lat > mid) {
                bits |= (1 << (4 - (bitsTotal % 5)));
                latRange[0] = mid;
            }
            else {
                latRange[1] = mid;
            }
        }
        bitsTotal++;
        if (bitsTotal % 5 === 0) {
            hash += base32[bits];
            bits = 0;
        }
    }
    return hash;
}
