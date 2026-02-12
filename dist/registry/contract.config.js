"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractConfig = void 0;
const BookingContractPdf_1 = require("../templates/BookingContractPdf");
const axios_1 = __importDefault(require("axios"));
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';
exports.contractConfig = {
    key: 'CONTRACT',
    template: BookingContractPdf_1.BookingContractPdf,
    fetchData: async (id, context) => {
        // 1. Fetch Booking Data from Backend
        // If token is missing, this call might fail if backend requires auth.
        // In dev with mock-server, this might hit the mock endpoints if configured.
        const authHeader = context.token ? { Authorization: context.token } : {};
        let booking;
        try {
            // Try fetching from backend
            const response = await axios_1.default.get(`${BACKEND_API_URL}/providers/fleet-bookings/${id}`, {
                headers: authHeader
            });
            // Response wrapper likely { status: 'OK', data: { ... } } or just the object
            booking = response.data.data || response.data; // Handle ServiceResponse wrapper
        }
        catch (error) {
            console.error('[PDF Service] Backend Fetch Error:', error);
            // Fallback for development if backend is not reachable/mocked
            // THROWING error is better for production to surface issues.
            // But for this transition step, we might want to fail gracefully or use mock data.
            // Let's rethrow to show "Proper Integration".
            throw new Error(`Failed to fetch booking ${id} from backend: ${error.message}`);
        }
        // 2. Fetch Parameters (could be cached or fetched separately)
        // For simplicity, we hardcode labels or fetch them from a common param endpoint.
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
        // 3. Prepare Translation Function (Mocked for now or use library)
        const t = (key) => {
            const map = {
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
        // 4. Fetch Offer Snapshot if available
        let offerSnapshot;
        if (booking.offerSnapshotId) {
            try {
                const snapshotResponse = await axios_1.default.get(`${BACKEND_API_URL}/providers/snapshots/${booking.offerSnapshotId}`, {
                    headers: authHeader
                });
                offerSnapshot = snapshotResponse.data.data || snapshotResponse.data;
            }
            catch (error) {
                console.warn('[PDF Service] Offer Snapshot Fetch Error:', error);
            }
        }
        // 5. Calculate Derived Values
        const startDateObj = new Date(booking.startDate);
        const endDateObj = new Date(booking.endDate);
        const rentalDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const basePrice = (booking.resources || []).reduce((sum, r) => sum + (Number(r.dailyRate) || 0) * (Number(r.quantity) || 0) * rentalDays, 0);
        const paidEquipments = (booking.equipmentSupplements || []).filter((s) => !s.isIncluded && (booking.selectedEquipment || []).includes(s.code) && s.priceModifier != null);
        const paidOptions = (booking.optionSupplements || []).filter((s) => !s.isIncluded && (booking.selectedOptions || []).includes(s.code) && s.priceModifier != null);
        const calcOptionAmount = (modifier, periodicity) => periodicity === 'PER_DAY' ? modifier * rentalDays : modifier;
        const optionsTotal = paidEquipments.reduce((s, i) => s + calcOptionAmount(Number(i.priceModifier) || 0, i.periodicity), 0) +
            paidOptions.reduce((s, i) => s + calcOptionAmount(Number(i.priceModifier) || 0, i.periodicity), 0);
        const total = Number(booking.totalPrice) || 0;
        const discount = (booking.discount != null && Number(booking.discount) > 0)
            ? Number(booking.discount)
            : Math.max(0, (basePrice + optionsTotal) - total);
        return {
            booking,
            offerSnapshot,
            targetType: context.type || 'CONTRACT',
            type: context.type || 'CONTRACT',
            rentalDays,
            basePrice,
            optionsTotal,
            discount,
            total,
            paidEquipments,
            paidOptions,
            optionAmount: calcOptionAmount,
            numberLocale: 'fr-FR',
            parameterLabels,
            t
        };
    }
};
