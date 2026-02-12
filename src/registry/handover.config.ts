import { DocumentConfig } from './types';
import { VehicleHandoverPdf } from '../templates/VehicleHandoverPdf';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export const handoverConfig: DocumentConfig<any> = {
    key: 'HANDOVER',
    template: VehicleHandoverPdf,
    fetchData: async (id: string, context: { token?: string; language?: string }) => {
        const authHeader = context.token ? { Authorization: context.token } : {};
        const language = context.language || 'fr';

        let booking;
        let handovers = [];

        try {
            // 1. Fetch Booking
            const bookingResponse = await axios.get(`${BACKEND_API_URL}/providers/fleet-bookings/${id}`, {
                headers: authHeader
            });
            booking = bookingResponse.data.data || bookingResponse.data;

            // 2. Fetch Handovers
            const handoversResponse = await axios.get(`${BACKEND_API_URL}/providers/fleet-bookings/${id}/handovers`, {
                headers: authHeader
            });
            handovers = handoversResponse.data.data || handoversResponse.data;

        } catch (error) {
            console.error('[PDF Service] Backend Fetch Error:', error);
            throw new Error(`Failed to fetch data for booking ${id}: ${(error as any).message}`);
        }

        // 3. Fetch Schemas for all unique vehicle types in assignments to support vehicles without handovers
        const vehicleAssignments = booking.assignments?.filter((a: any) => a.resourceType === 'VEHICLE') || [];
        const vehicleTypes = Array.from(new Set(vehicleAssignments.map((a: any) => a.vehicleType).filter(Boolean)));
        const schemas: Record<string, any> = {};

        for (const vt of vehicleTypes as string[]) {
            try {
                const schemaResponse = await axios.get(`${BACKEND_API_URL}/parameters/VEHICLE_TYPES/${vt}`, {
                    headers: authHeader
                });
                if (schemaResponse.data.data?.additionalFields?.handover_schema) {
                    schemas[vt] = schemaResponse.data.data.additionalFields.handover_schema;
                }
            } catch (err) {
                console.warn(`[PDF Service] Could not fetch schema for vehicle type ${vt}`, (err as Error).message);
            }
        }

        const parameterLabels = {
            FUEL_LEVEL: {
                EMPTY: 'Vide (0/8)',
                ONE_EIGHTH: '1/8',
                ONE_QUARTER: '1/4',
                THREE_EIGHTHS: '3/8',
                HALF: '1/2',
                FIVE_EIGHTHS: '5/8',
                THREE_QUARTERS: '3/4',
                SEVEN_EIGHTHS: '7/8',
                FULL: 'Plein (8/8)',
            },
        };

        const t = (key: string) => {
            const map: Record<string, string> = {
                'handover.checkout': 'État des lieux de départ',
                'handover.checkin': 'État des lieux de retour',
                'handover.vehicle': 'Véhicule',
                'handover.date': 'Date',
                'handover.odometer': 'Kilométrage',
                'handover.fuelLevel': 'Niveau carburant',
                'handover.vehicleCondition': 'État du véhicule',
                'handover.intact': 'Intact',
                'handover.damaged': 'Endommagé',
                'handover.damagesList': 'Liste des dommages',
                'handover.comments': 'Commentaires et Observations',
                'common.draft': 'Brouillon',
                'handover.zone': 'Zone',
                'handover.damageType': 'Type de dommage',
                'handover.description': 'Description',
                'handover.zones.front-bumper': 'Pare-chocs avant',
                'handover.zones.hood': 'Capot',
                'handover.zones.windshield': 'Pare-brise',
                'handover.zones.roof': 'Toit',
                'handover.zones.rear-window': 'Lunette arrière',
                'handover.zones.trunk': 'Coffre',
                'handover.zones.rear-bumper': 'Pare-chocs arrière',
                'handover.zones.left-front-fender': 'Aile AV Gauche',
                'handover.zones.left-front-door': 'Porte AV Gauche',
                'handover.zones.left-rear-door': 'Porte AR Gauche',
                'handover.zones.left-rear-fender': 'Aile AR Gauche',
                'handover.zones.right-front-fender': 'Aile AV Droite',
                'handover.zones.right-front-door': 'Porte AV Droite',
                'handover.zones.right-rear-door': 'Porte AR Droite',
                'handover.zones.right-rear-fender': 'Aile AR Droite',
                'providerRequests.contractTemplate.clientSignature': 'Signature Client',
                'providerRequests.contractTemplate.providerSignature': 'Signature Loueur',
            };
            return map[key] || key;
        };

        return {
            booking,
            handovers,
            vehicleAssignments,
            schemas,
            t,
            parameterLabels,
            language
        };
    }
};
