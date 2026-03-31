"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractConfig = void 0;
const BookingContractPdf_1 = require("../templates/BookingContractPdf");
/** French labels for contract/invoice PDFs */
const contractTranslations = {
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
function makeOptionAmount(rentalDays) {
    return (modifier, periodicity) => periodicity === 'PER_DAY' ? modifier * rentalDays : modifier;
}
exports.contractConfig = {
    key: 'CONTRACT',
    template: BookingContractPdf_1.BookingContractPdf,
    prepareData: (body, lang) => {
        const { booking, offerSnapshot, rentalDays, basePrice, optionsTotal, discount, total, paidEquipments, paidOptions, type, numberLocale, parameterLabels } = body;
        const t = (key) => contractTranslations[key] || key;
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
