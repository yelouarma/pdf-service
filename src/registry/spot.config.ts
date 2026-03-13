import { DocumentConfig } from './types';
import { SpotTransportLetterPdf } from '../templates/SpotTransportLetterPdf';
import { SpotInvoicePdf } from '../templates/SpotInvoicePdf';
import axios from 'axios';
import { Shipment, Organization } from '../templates/types';

interface SpotData {
    shipment: Shipment;
    t: (key: string) => string;
}

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

/** Prepare spot data from pre-fetched body */
function prepareSpotData(body: Record<string, any>, lang: string): SpotData {
    const { shipment } = body;
    const t = (key: string) => key; // Labels come from backend
    return { shipment, t };
}

/** @deprecated — fetch from backend API (used by GET /generate) */
const fetchShipmentData = async (id: string, token?: string): Promise<SpotData> => {
    const authHeader = token ? {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
    } : {};
    let shipment: Shipment;

    try {
        const response = await axios.get(`${BACKEND_API_URL}/shipments/${id}`, {
            headers: authHeader
        });
        const shipmentData = response.data.data || response.data;

        let client: Organization | undefined;
        if (shipmentData.organizationId) {
            try {
                const clientRes = await axios.get(`${BACKEND_API_URL}/organizations/${shipmentData.organizationId}`, {
                    headers: authHeader
                });
                client = clientRes.data.data || clientRes.data;
            } catch (e) {
                console.warn('[PDF Service] Failed to fetch client organization', e);
            }
        }

        let provider: Organization | undefined;
        if (shipmentData.selectedProviderId) {
            try {
                const providerRes = await axios.get(`${BACKEND_API_URL}/organizations/${shipmentData.selectedProviderId}`, {
                    headers: authHeader
                });
                provider = providerRes.data.data || providerRes.data;
            } catch (e) {
                console.warn('[PDF Service] Failed to fetch provider organization', e);
            }
        }

        shipment = { ...shipmentData, client, provider };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('[PDF Service] Backend Fetch Error:', error.response?.status, error.response?.data);
            throw new Error(`Failed to fetch shipment ${id} from backend: Request failed with status code ${error.response?.status}`);
        }
        throw new Error(`Failed to fetch shipment ${id} from backend: ${(error as any).message}`);
    }

    const t = (key: string) => key;
    return { shipment, t };
};

export const spotTransportLetterConfig: DocumentConfig<SpotData> = {
    key: 'SPOT_TRANSPORT_LETTER',
    template: SpotTransportLetterPdf,
    prepareData: prepareSpotData,
    fetchData: async (id, context) => fetchShipmentData(id, context?.token),
    getFilename: (data) => `Lettre_Transport_${data.shipment.trackingNumber || data.shipment.id}.pdf`
};

export const spotInvoiceConfig: DocumentConfig<SpotData> = {
    key: 'SPOT_INVOICE',
    template: SpotInvoicePdf,
    prepareData: prepareSpotData,
    fetchData: async (id, context) => fetchShipmentData(id, context?.token),
    getFilename: (data) => `Facture_${data.shipment.trackingNumber || data.shipment.id}.pdf`
};
