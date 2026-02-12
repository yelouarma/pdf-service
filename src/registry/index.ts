import { DocumentConfig } from './types';
import { contractConfig } from './contract.config';
import { handoverConfig } from './handover.config';

// Map of available documents: Key -> Config
const registry: Record<string, DocumentConfig> = {
    'CONTRACT': contractConfig,
    'INVOICE': contractConfig,
    'HANDOVER': handoverConfig,
};

export const getDocumentConfig = (key: string): DocumentConfig | undefined => {
    return registry[key];
};
