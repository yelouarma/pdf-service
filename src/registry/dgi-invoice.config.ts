import { DocumentConfig } from './types';
import { InvoiceDgiPdf, InvoiceDgiProps } from '../templates/InvoiceDgiPdf';

/**
 * Registry config for DGI-compliant invoices.
 *
 * Note: This document type is primarily used via the internal POST endpoint
 * (POST /internal/generate-invoice) where the backend sends full invoice data
 * directly. The fetchData here is a no-op placeholder since data comes from
 * the request body, not from an external API call.
 */
export const dgiInvoiceConfig: DocumentConfig<InvoiceDgiProps> = {
    key: 'DGI_INVOICE',
    template: InvoiceDgiPdf,
    fetchData: async (_id: string, _context?: any): Promise<InvoiceDgiProps> => {
        throw new Error('DGI_INVOICE does not support fetchData. Use POST /internal/generate-invoice instead.');
    },
    getFilename: (data: InvoiceDgiProps) => `${data.type === 'CREDIT_NOTE' ? 'Avoir' : 'Facture'}_${data.invoiceNumber}.pdf`,
};
