"use strict";
/**
 * Sistema de Plugins - Media Manager
 *
 * Interface base para todos os plugins de destino de armazenamento
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageClass = exports.PluginStatus = void 0;
var PluginStatus;
(function (PluginStatus) {
    PluginStatus["IDLE"] = "idle";
    PluginStatus["SYNCING"] = "syncing";
    PluginStatus["SYNCED"] = "synced";
    PluginStatus["ERROR"] = "error";
    PluginStatus["PENDING"] = "pending";
})(PluginStatus || (exports.PluginStatus = PluginStatus = {}));
var StorageClass;
(function (StorageClass) {
    // S3
    StorageClass["STANDARD"] = "STANDARD";
    StorageClass["INTELLIGENT_TIERING"] = "INTELLIGENT_TIERING";
    StorageClass["STANDARD_IA"] = "STANDARD_IA";
    StorageClass["ONEZONE_IA"] = "ONEZONE_IA";
    StorageClass["GLACIER_INSTANT"] = "GLACIER_INSTANT";
    StorageClass["GLACIER_FLEXIBLE"] = "GLACIER_FLEXIBLE";
    StorageClass["DEEP_ARCHIVE"] = "DEEP_ARCHIVE";
    // Genérico
    StorageClass["HOT"] = "HOT";
    StorageClass["COOL"] = "COOL";
    StorageClass["ARCHIVE"] = "ARCHIVE";
})(StorageClass || (exports.StorageClass = StorageClass = {}));
