import { DocumentConfig } from './types';
import { BookingContractPdf } from '../templates/BookingContractPdf';

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
};
