"use strict";
/**
 * Lambda: List Media
 *
 * Lista mídias de um usuário com paginação e filtros
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
exports.handler = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var dynamoClient = new client_dynamodb_1.DynamoDBClient({});
var docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
var MEDIA_TABLE = process.env.MEDIA_TABLE_NAME || 'media-items';
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, authorizedUserId, params, limit, lastKey, command, result, items, error_1;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log('Event:', JSON.stringify(event, null, 2));
                _d.label = 1;
            case 1:
                _d.trys.push([1, 7, , 8]);
                userId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            headers: corsHeaders(),
                            body: JSON.stringify({ error: 'userId é obrigatório' })
                        }];
                }
                authorizedUserId = (_c = (_b = event.requestContext.authorizer) === null || _b === void 0 ? void 0 : _b.claims) === null || _c === void 0 ? void 0 : _c.sub;
                if (authorizedUserId !== userId) {
                    return [2 /*return*/, {
                            statusCode: 403,
                            headers: corsHeaders(),
                            body: JSON.stringify({ error: 'Não autorizado' })
                        }];
                }
                params = event.queryStringParameters || {};
                limit = parseInt(params.limit || '50');
                lastKey = params.lastKey ? JSON.parse(params.lastKey) : undefined;
                if (!(params.dateFrom || params.dateTo)) return [3 /*break*/, 3];
                return [4 /*yield*/, queryByDateRange(userId, params, limit, lastKey)];
            case 2: return [2 /*return*/, _d.sent()];
            case 3:
                if (!params.tags) return [3 /*break*/, 5];
                return [4 /*yield*/, queryByTags(userId, params.tags, limit, lastKey)];
            case 4: return [2 /*return*/, _d.sent()];
            case 5:
                command = new lib_dynamodb_1.QueryCommand({
                    TableName: MEDIA_TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                    ExpressionAttributeValues: {
                        ':pk': "USER#".concat(userId),
                        ':sk': 'MEDIA#'
                    },
                    ScanIndexForward: false, // Ordena por data decrescente
                    Limit: limit,
                    ExclusiveStartKey: lastKey
                });
                return [4 /*yield*/, docClient.send(command)];
            case 6:
                result = _d.sent();
                items = (result.Items || [])
                    .filter(function (item) { return !item.deleted; })
                    .map(function (item) { return formatMediaItem(item); });
                return [2 /*return*/, {
                        statusCode: 200,
                        headers: corsHeaders(),
                        body: JSON.stringify({
                            items: items,
                            lastKey: result.LastEvaluatedKey,
                            count: items.length
                        })
                    }];
            case 7:
                error_1 = _d.sent();
                console.error('Error:', error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        headers: corsHeaders(),
                        body: JSON.stringify({
                            error: 'Erro interno ao buscar mídias',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        })
                    }];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
/**
 * Query por range de datas usando GSI1
 */
function queryByDateRange(userId, params, limit, lastKey) {
    return __awaiter(this, void 0, void 0, function () {
        var dateFrom, dateTo, command, result, items;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dateFrom = params.dateFrom || '1900-01-01';
                    dateTo = params.dateTo || '2100-12-31';
                    command = new lib_dynamodb_1.QueryCommand({
                        TableName: MEDIA_TABLE,
                        IndexName: 'GSI1-SearchByDate',
                        KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK BETWEEN :dateFrom AND :dateTo',
                        ExpressionAttributeValues: {
                            ':pk': "USER#".concat(userId),
                            ':dateFrom': "DATE#".concat(dateFrom),
                            ':dateTo': "DATE#".concat(dateTo)
                        },
                        ScanIndexForward: false,
                        Limit: limit,
                        ExclusiveStartKey: lastKey
                    });
                    return [4 /*yield*/, docClient.send(command)];
                case 1:
                    result = _a.sent();
                    items = (result.Items || [])
                        .filter(function (item) { return !item.deleted; })
                        .map(function (item) { return formatMediaItem(item); });
                    return [2 /*return*/, {
                            statusCode: 200,
                            headers: corsHeaders(),
                            body: JSON.stringify({
                                items: items,
                                lastKey: result.LastEvaluatedKey,
                                count: items.length
                            })
                        }];
            }
        });
    });
}
/**
 * Query por tags usando GSI3
 */
function queryByTags(userId, tags, limit, lastKey) {
    return __awaiter(this, void 0, void 0, function () {
        var tagList, allItems, _i, tagList_1, tag, command, result, items;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tagList = tags.split(',');
                    allItems = new Set();
                    _i = 0, tagList_1 = tagList;
                    _a.label = 1;
                case 1:
                    if (!(_i < tagList_1.length)) return [3 /*break*/, 4];
                    tag = tagList_1[_i];
                    command = new lib_dynamodb_1.QueryCommand({
                        TableName: MEDIA_TABLE,
                        IndexName: 'GSI3-SearchByTag',
                        KeyConditionExpression: 'GSI3PK = :pk',
                        ExpressionAttributeValues: {
                            ':pk': "USER#".concat(userId, "#TAG#").concat(tag.trim())
                        },
                        ScanIndexForward: false,
                        Limit: limit
                    });
                    return [4 /*yield*/, docClient.send(command)];
                case 2:
                    result = _a.sent();
                    (result.Items || []).forEach(function (item) { return allItems.add(item); });
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    items = Array.from(allItems)
                        .filter(function (item) { return !item.deleted; })
                        .map(function (item) { return formatMediaItem(item); })
                        .slice(0, limit);
                    return [2 /*return*/, {
                            statusCode: 200,
                            headers: corsHeaders(),
                            body: JSON.stringify({
                                items: items,
                                count: items.length
                            })
                        }];
            }
        });
    });
}
/**
 * Formata item do DynamoDB para resposta
 */
function formatMediaItem(item) {
    return {
        mediaId: item.mediaId,
        userId: item.userId,
        fileName: item.fileName,
        fileType: item.fileType,
        fileSize: item.fileSize,
        originalPath: item.originalPath,
        thumbnailPath: item.thumbnailPath,
        captureDate: item.captureDate,
        uploadDate: item.uploadDate,
        lastModified: item.lastModified,
        metadata: item.metadata,
        tags: item.tags,
        keywords: item.keywords,
        description: item.description,
        aiFeatures: item.aiFeatures,
        destinations: item.destinations,
        status: item.status
    };
}
/**
 * CORS headers
 */
function corsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
}
