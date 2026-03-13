"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentConfig = void 0;
const contract_config_1 = require("./contract.config");
const handover_config_1 = require("./handover.config");
const spot_config_1 = require("./spot.config");
const dgi_invoice_config_1 = require("./dgi-invoice.config");
const commission_invoice_config_1 = require("./commission-invoice.config");
// Map of available documents: Key -> Config
const registry = {
    'CONTRACT': contract_config_1.contractConfig,
    'INVOICE': contract_config_1.contractConfig,
    'HANDOVER': handover_config_1.handoverConfig,
    'SPOT_TRANSPORT_LETTER': spot_config_1.spotTransportLetterConfig,
    'SPOT_INVOICE': spot_config_1.spotInvoiceConfig,
    'DGI_INVOICE': dgi_invoice_config_1.dgiInvoiceConfig,
    'CREDIT_NOTE': dgi_invoice_config_1.dgiInvoiceConfig, // Same template as DGI_INVOICE, type='CREDIT_NOTE'
    'COMMISSION_INVOICE': commission_invoice_config_1.commissionInvoiceConfig,
};
const getDocumentConfig = (key) => {
    return registry[key];
};
exports.getDocumentConfig = getDocumentConfig;
