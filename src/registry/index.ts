import { DocumentConfig } from './types';
import { contractConfig } from './contract.config';

// Map of available documents: Key -> Config
const registry: Record<string, DocumentConfig> = {
    'CONTRACT': contractConfig,
    'INVOICE': contractConfig, // Reuse same config/template for now, distinguishing via type prop
};

export const getDocumentConfig = (key: string): DocumentConfig | undefined => {
    return registry[key];
};
