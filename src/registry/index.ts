import { DocumentConfig } from './types';
import { contractConfig } from './contract.config';
import { handoverConfig } from './handover.config';
import { spotTransportLetterConfig, spotInvoiceConfig } from './spot.config';
import { dgiInvoiceConfig } from './dgi-invoice.config';

// Map of available documents: Key -> Config
const registry: Record<string, DocumentConfig> = {
    'CONTRACT': contractConfig,
    'INVOICE': contractConfig,
    'HANDOVER': handoverConfig,
    'SPOT_TRANSPORT_LETTER': spotTransportLetterConfig,
    'SPOT_INVOICE': spotInvoiceConfig,
    'DGI_INVOICE': dgiInvoiceConfig,
};

export const getDocumentConfig = (key: string): DocumentConfig | undefined => {
    return registry[key];
};
