"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentConfig = void 0;
const contract_config_1 = require("./contract.config");
const handover_config_1 = require("./handover.config");
// Map of available documents: Key -> Config
const registry = {
    'CONTRACT': contract_config_1.contractConfig,
    'INVOICE': contract_config_1.contractConfig,
    'HANDOVER': handover_config_1.handoverConfig,
};
const getDocumentConfig = (key) => {
    return registry[key];
};
exports.getDocumentConfig = getDocumentConfig;
