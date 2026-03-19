import { DocumentConfig } from './types';
import { SpotTransportLetterPdf } from '../templates/SpotTransportLetterPdf';
import { SpotInvoicePdf } from '../templates/SpotInvoicePdf';
import { Shipment } from '../templates/types';

interface SpotData {
    shipment: Shipment;
    t: (key: string) => string;
}

/** Prepare spot data from pre-fetched body */
function prepareSpotData(body: Record<string, any>, lang: string): SpotData {
    const { shipment } = body;
    const t = (key: string) => key; // Labels come from backend
    return { shipment, t };
}

export const spotTransportLetterConfig: DocumentConfig<SpotData> = {
    key: 'SPOT_TRANSPORT_LETTER',
    template: SpotTransportLetterPdf,
    prepareData: prepareSpotData,
    getFilename: (data) => `Lettre_Transport_${data.shipment.trackingNumber || data.shipment.id}.pdf`
};

export const spotInvoiceConfig: DocumentConfig<SpotData> = {
    key: 'SPOT_INVOICE',
    template: SpotInvoicePdf,
    prepareData: prepareSpotData,
    getFilename: (data) => `Facture_${data.shipment.trackingNumber || data.shipment.id}.pdf`
};
