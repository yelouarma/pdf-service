import React from 'react';
import { Text } from '@react-pdf/renderer';

interface ParameterPdfTextProps {
    domain: string;
    value: string | undefined;
    style?: any;
    fallback?: string;
    /** Labels map { functionalId: localizedLabel } */
    labels?: Record<string, string>;
}

/**
 * Server-side compatible ParameterPdfText.
 * Relies exclusively on provided labels or fallback.
 */
export const ParameterPdfText: React.FC<ParameterPdfTextProps> = ({
    domain,
    value,
    style,
    fallback,
    labels
}) => {
    if (!value) {
        return <Text style={style}>{fallback || '—'}</Text>;
    }

    // Try to use provided labels map
    if (labels && labels[value]) {
        return <Text style={style}>{labels[value]}</Text>;
    }

    // Fallback simply to value if no label provided (server-side has no i18n global)
    return <Text style={style}>{fallback || value}</Text>;
};
