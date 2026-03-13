import React from 'react';

export interface DocumentData {
    id: string;
    [key: string]: any;
}

export interface DocumentConfig<T = any> {
    /**
     * Unique key for the document type (e.g. 'CONTRACT', 'INVOICE')
     */
    key: string;

    /**
     * React component to render the PDF
     */
    template: React.ComponentType<T>;

    /**
     * Transform raw JSON body + lang into template props.
     * Used by POST /internal/generate — the backend sends all data in the body.
     */
    prepareData: (body: Record<string, any>, lang: string) => T;

    /**
     * @deprecated Use prepareData instead. Will be removed once frontend migrates to backend endpoints.
     * Function to fetch data from external sources (Backend API)
     */
    fetchData?: (id: string, context?: any) => Promise<T>;

    /**
     * Optional: Generate filename based on data
     */
    getFilename?: (data: T) => string;
}
