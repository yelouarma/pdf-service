import { DocumentConfig } from './types';
import { VehicleHandoverPdf } from '../templates/VehicleHandoverPdf';

/** French labels for handover PDFs */
const handoverTranslations: Record<string, string> = {
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

export const handoverConfig: DocumentConfig<any> = {
    key: 'HANDOVER',
    template: VehicleHandoverPdf,

    prepareData: (body: Record<string, any>, lang: string) => {
        const { booking, handovers, vehicleAssignments, schemas, parameterLabels, language } = body;
        const t = (key: string) => handoverTranslations[key] || key;

        return {
            booking,
            handovers: handovers || [],
            vehicleAssignments: vehicleAssignments || [],
            schemas: schemas || {},
            t,
            parameterLabels: parameterLabels || {},
            language: language || lang || 'fr',
        };
    },
};
