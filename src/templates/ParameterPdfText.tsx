import React from 'react';
import { Text } from '@react-pdf/renderer';

import type { ParameterReference } from './types';

interface ParameterPdfTextProps {
    domain: string;
    value?: string;
    parameterReference?: ParameterReference;
    style?: any;
    fallback?: string;
    /** Labels map { functionalId: localizedLabel } */
    labels?: Record<string, string>;
    /** Language code (e.g. 'fr', 'en') to pick label/description from parameterReference.labelsByLanguage / descriptionsByLanguage */
    language?: string;
}

/**
 * Server-side compatible ParameterPdfText.
 * Relies explicitly on provided parameterReference, labels map or fallback.
 */
export const ParameterPdfText: React.FC<ParameterPdfTextProps> = ({
    domain,
    value,
    parameterReference,
    style,
    fallback,
    labels,
    language
}) => {
    // 1. If language requested and parameterReference has labelsByLanguage, use it first
    if (language && parameterReference?.labelsByLanguage?.[language]) {
        return <Text style={style}>{parameterReference.labelsByLanguage[language]}</Text>;
    }

    // 2. Use localizedLabel from parameterReference if available
    if (parameterReference?.localizedLabel) {
        return <Text style={style}>{parameterReference.localizedLabel}</Text>;
    }

    const functionalId = value || parameterReference?.functionalId;

    if (!functionalId) {
        return <Text style={style}>{fallback || '—'}</Text>;
    }

    // 3. Try to use provided labels map
    if (labels && labels[functionalId]) {
        return <Text style={style}>{labels[functionalId]}</Text>;
    }

    // 4. Fallback to fallback string or functionalId
    return <Text style={style}>{fallback || functionalId}</Text>;
};
