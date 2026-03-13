import { DocumentConfig } from './types';
import { BookingContractPdf } from '../templates/BookingContractPdf';
import axios from 'axios';

interface ContractData {
    booking: any;
    offerSnapshot?: any;
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

/** French labels for contract/invoice PDFs */
const contractTranslations: Record<string, string> = {
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

/** Build the optionAmount calculator */
function makeOptionAmount(rentalDays: number) {
    return (modifier: number, periodicity?: string) =>
        periodicity === 'PER_DAY' ? modifier * rentalDays : modifier;
}

export const contractConfig: DocumentConfig<ContractData> = {
    key: 'CONTRACT',
    template: BookingContractPdf,

    prepareData: (body: Record<string, any>, lang: string): ContractData => {
        const {
            booking, offerSnapshot, rentalDays, basePrice,
            optionsTotal, discount, total,
            paidEquipments, paidOptions,
            type, numberLocale, parameterLabels
        } = body;

        const t = (key: string) => contractTranslations[key] || key;
        const optionAmount = makeOptionAmount(rentalDays);

        return {
            booking,
            offerSnapshot,
            rentalDays,
            basePrice,
            optionsTotal,
            discount,
            total,
            paidEquipments: paidEquipments || [],
            paidOptions: paidOptions || [],
            optionAmount,
            numberLocale: numberLocale || 'fr-FR',
            parameterLabels: parameterLabels || {},
            t,
            type: type || 'CONTRACT',
        };
    },

    /** @deprecated — will be removed once frontend uses backend endpoints */
    fetchData: async (id: string, context: { token?: string, type?: 'CONTRACT' | 'INVOICE' }) => {
        const authHeader = context.token ? { Authorization: context.token } : {};

        let booking;
        try {
            const response = await axios.get(`${BACKEND_API_URL}/providers/fleet-bookings/${id}`, {
                headers: authHeader
            });
            booking = response.data.data || response.data;
        } catch (error) {
            console.error('[PDF Service] Backend Fetch Error:', error);
            throw new Error(`Failed to fetch booking ${id} from backend: ${(error as any).message}`);
        }

        const parameterLabels = {
            VEHICLE_TYPES: { TRUCK: 'Camion', VAN: 'Camionnette', TRAILER: 'Remorque' },
            VEHICLE_FEATURES: { GPS: 'GPS Intégré', AC: 'Climatisation' },
            VEHICLE_SERVICES: { DRIVER: 'Chauffeur inclus', INSURANCE: 'Assurance tout risque' },
            PENALTY_TYPES: {
                LATE_RETURN: 'Retard de restitution',
                KM_OVERAGE: 'Dépassement kilométrique',
                DAMAGE: 'Dommages',
                CLEANING: 'Nettoyage',
            },
            PENALTY_BASIS: {
                PER_HOUR: 'Par heure',
                HOUR: 'Par heure',
                PER_KM: 'Par km',
                KM: 'Par km',
                FIXED: 'Forfaitaire',
            },
        };

        const t = (key: string) => contractTranslations[key] || key;

        let offerSnapshot;
        if (booking.offerSnapshotId) {
            try {
                const snapshotResponse = await axios.get(`${BACKEND_API_URL}/providers/snapshots/${booking.offerSnapshotId}`, {
                    headers: authHeader
                });
                offerSnapshot = snapshotResponse.data.data || snapshotResponse.data;
            } catch (error) {
                console.warn('[PDF Service] Offer Snapshot Fetch Error:', error);
            }
        }

        const startDateObj = new Date(booking.startDate);
        const endDateObj = new Date(booking.endDate);
        const rentalDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        const basePrice = (booking.resources || []).reduce((sum: number, r: any) =>
            sum + (Number(r.dailyRate) || 0) * (Number(r.quantity) || 0) * rentalDays, 0);

        const paidEquipments = (booking.equipmentSupplements || []).filter(
            (s: any) => !s.isIncluded && (booking.selectedEquipment || []).includes(s.code) && s.priceModifier != null
        );
        const paidOptions = (booking.optionSupplements || []).filter(
            (s: any) => !s.isIncluded && (booking.selectedOptions || []).includes(s.code) && s.priceModifier != null
        );

        const optionAmount = makeOptionAmount(rentalDays);

        const optionsTotal =
            paidEquipments.reduce((s: number, i: any) => s + optionAmount(Number(i.priceModifier) || 0, i.periodicity), 0) +
            paidOptions.reduce((s: number, i: any) => s + optionAmount(Number(i.priceModifier) || 0, i.periodicity), 0);

        const total = Number(booking.totalPrice) || 0;
        const discount = (booking.discount != null && Number(booking.discount) > 0)
            ? Number(booking.discount)
            : Math.max(0, (basePrice + optionsTotal) - total);

        return {
            booking,
            offerSnapshot,
            type: context.type || 'CONTRACT',
            rentalDays,
            basePrice,
            optionsTotal,
            discount,
            total,
            paidEquipments,
            paidOptions,
            optionAmount,
            numberLocale: 'fr-FR',
            parameterLabels,
            t
        } as ContractData;
    }
};
