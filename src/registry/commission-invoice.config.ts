import { DocumentConfig } from './types';
import { CommissionInvoicePdf, CommissionInvoiceProps } from '../templates/CommissionInvoicePdf';

export const commissionInvoiceConfig: DocumentConfig<CommissionInvoiceProps> = {
    key: 'COMMISSION_INVOICE',
    template: CommissionInvoicePdf,
    prepareData: (body: Record<string, any>, _lang: string): CommissionInvoiceProps => body as CommissionInvoiceProps,
    getFilename: (data: CommissionInvoiceProps) => `Commission_${data.invoiceNumber}.pdf`,
};
