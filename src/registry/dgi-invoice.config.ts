import { DocumentConfig } from './types';
import { InvoiceDgiPdf, InvoiceDgiProps } from '../templates/InvoiceDgiPdf';

export const dgiInvoiceConfig: DocumentConfig<InvoiceDgiProps> = {
    key: 'DGI_INVOICE',
    template: InvoiceDgiPdf,
    prepareData: (body: Record<string, any>, _lang: string): InvoiceDgiProps => body as InvoiceDgiProps,
    getFilename: (data: InvoiceDgiProps) => `${data.type === 'CREDIT_NOTE' ? 'Avoir' : 'Facture'}_${data.invoiceNumber}.pdf`,
};
