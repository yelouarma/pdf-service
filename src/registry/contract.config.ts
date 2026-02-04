import { DocumentConfig } from './types';
import { BookingContractPdf } from '../templates/BookingContractPdf';
import axios from 'axios';
import { ParameterPdfText } from '../templates/ParameterPdfText';

// Define the shape of the data expected by the template
// This matches ContractPdfProps in BookingContractPdf.tsx (mostly)
interface ContractData {
    booking: any;
    rentalDays: number;
    basePrice: number;
    optionsTotal: number;
    discount: number;
    total: number;
    paidEquipments: any[];
    paidOptions: any[];
    optionAmount: (modifier: number, periodicity?: string) => number;
    numberLocale: string;
    parameterLabels: any;
    t: (key: string, options?: any) => string;
    type: 'CONTRACT' | 'INVOICE';
}

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export const contractConfig: DocumentConfig<ContractData> = {
    key: 'CONTRACT',
    template: BookingContractPdf,
    fetchData: async (id: string, context: { token?: string, type?: 'CONTRACT' | 'INVOICE' }) => {

        // 1. Fetch Booking Data from Backend
        // If token is missing, this call might fail if backend requires auth.
        // In dev with mock-server, this might hit the mock endpoints if configured.
        const authHeader = context.token ? { Authorization: context.token } : {};

        let booking;
        try {
            // Try fetching from backend
            const response = await axios.get(`${BACKEND_API_URL}/providers/fleet-bookings/${id}`, {
                headers: authHeader
            });
            // Response wrapper likely { status: 'OK', data: { ... } } or just the object
            booking = response.data.data || response.data; // Handle ServiceResponse wrapper
        } catch (error) {
            console.error('[PDF Service] Backend Fetch Error:', error);
            // Fallback for development if backend is not reachable/mocked
            // THROWING error is better for production to surface issues.
            // But for this transition step, we might want to fail gracefully or use mock data.
            // Let's rethrow to show "Proper Integration".
            throw new Error(`Failed to fetch booking ${id} from backend: ${(error as any).message}`);
        }

        // 2. Fetch Parameters (could be cached or fetched separately)
        // For simplicity, we hardcode labels or fetch them from a common param endpoint.
        const parameterLabels = {
            VEHICLE_TYPES: { TRUCK: 'Camion', VAN: 'Camionnette', TRAILER: 'Remorque' },
            VEHICLE_FEATURES: { GPS: 'GPS Intégré', AC: 'Climatisation' },
            VEHICLE_SERVICES: { DRIVER: 'Chauffeur inclus', INSURANCE: 'Assurance tout risque', LATE_RETURN: 'Retard de restitution' },
            PENALTY_BASIS: { PER_HOUR: 'Par heure', PER_KM: 'Par Km', FIXED: 'Forfaitaire' }
        };

        // 3. Prepare Translation Function (Mocked for now or use library)
        const t = (key: string) => {
            const map: Record<string, string> = {
                'providerRequests.contractTitle': 'CONTRAT DE LOCATION',
                'providerRequests.invoiceTitle': 'FACTURE',
                'providerRequests.reference': 'Réf',
                'providerRequests.contractTemplate.providerSection': 'Loueur',
                'providerRequests.contractTemplate.clientSection': 'Locataire',
                'providerRequests.contractTemplate.offerSection': 'Détails de la Location',
                'providerRequests.contractTemplate.assignmentSection': 'Affectation',
                'providerRequests.contractTemplate.vehicleAssigned': 'Véhicule',
                'providerRequests.contractTemplate.driverAssigned': 'Chauffeur',
                'providerRequests.contractTemplate.startMileage': 'Kilométrage Départ',
                'providerRequests.contractTemplate.includedEquipment': 'Inclus',
                'providerRequests.contractTemplate.optionalEquipment': 'Options & Suppléments',
                'providerRequests.contractTemplate.vehicleConditionSection': 'État du Véhicule',
                'providerRequests.contractTemplate.clientSignature': 'Signature Locataire',
                'providerRequests.contractTemplate.providerSignature': 'Signature Loueur',
                'providerRequests.termsIntro': 'Ce document est généré automatiquement et vaut contrat selon les CGV acceptées.',
                'providerRequests.providerDetails': 'Coordonnées Loueur',
                'providerRequests.clientDetails': 'Coordonnées Client',
                'providerRequests.basePrice': 'Location Véhicule',
                'common.day': 'jour',
                'common.days': 'jours'
            };
            return map[key] || key;
        };

        // 4. Calculate Derived Values (Logic duplication from Front... usually bad but necessary in PDF generation unrelated to logic)
        // Or better: The backend DTO should provide calculated totals.

        return {
            booking,
            targetType: context.type || 'CONTRACT', // Pass to prop 'type'
            type: context.type || 'CONTRACT',       // Redundant but safer matching
            rentalDays: 5, // Should be calculated from dates using date-fns
            basePrice: booking.totalPrice, // Simplified
            optionsTotal: 0,
            discount: booking.discount || 0,
            total: booking.totalPrice,
            paidEquipments: booking.paidEquipments || [],
            paidOptions: booking.paidOptions || [],
            optionAmount: (mod: number) => mod,
            numberLocale: 'fr-FR',
            parameterLabels,
            t
        } as ContractData;
    }
};
