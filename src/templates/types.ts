// Simplified types for PDF generation server-side

export interface ParameterReference {
    domain: string;
    functionalId: string;
    localizedLabel?: string;
    localizedDescription?: string;
    /** Label per language (e.g. "fr" -> "Rayure", "en" -> "Scratch") for PDF to choose by requested language. */
    labelsByLanguage?: Record<string, string>;
    /** Description per language for PDF to choose by requested language. */
    descriptionsByLanguage?: Record<string, string>;
}

export interface Address {
    street: string;
    additionalInfo?: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface ContactInfo {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
}

export interface Organization {
    id: string;
    name: string;
    /** Contact email de l'organisation (pour documents, distinct du représentant légal). */
    contactEmail?: string;
    /** Contact téléphone de l'organisation (pour documents, distinct du représentant légal). */
    contactPhone?: string;
    legalPersonTypeKey?: string;
    // Physical
    physicalFirstName?: string;
    physicalLastName?: string;
    physicalDateOfBirth?: string;
    physicalResidencePlace?: string;
    physicalIdentityNumber?: string;
    physicalPhone?: string;
    physicalEmail?: string;
    // Moral
    moralLegalFormKey?: string;
    moralHeadquarters?: string;
    moralIce?: string;
    moralRc?: string;
    moralTaxId?: string;
    moralPatent?: string;

    address?: Address;
    contactInfo?: ContactInfo;
    legalRepresentative?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
    };
}

export interface FleetResource {
    type: string;
    quantity: number;
    dailyRate: number;
    resourceName?: string;
    typeRef?: ParameterReference;
}

export interface FleetBookingOptionSupplement {
    code: string;
    name?: string;
    priceModifier?: number;
    priceModifierType?: string;
    periodicity?: string;
    isIncluded?: boolean;
    codeRef?: ParameterReference;
}

export interface FleetBookingEquipmentSupplement {
    code: string;
    name?: string;
    priceModifier?: number;
    priceModifierType?: string;
    periodicity?: string;
    isIncluded?: boolean;
    codeRef?: ParameterReference;
}

export interface FleetResourceAssignment {
    id: string;
    resourceType: 'VEHICLE' | 'DRIVER' | 'EQUIPMENT';
    resourceId: string;
    resourceName?: string;
    startDate: string;
    endDate: string;
    status: string;
    statusRef?: ParameterReference;
    vehicleType?: string;
}

export interface SnapshotPreferentialPrice {
    id?: string;
    price?: { type?: string; basePrice?: number; currency?: string };
    priority?: number;
    isActive?: boolean;
}

export interface SnapshotDiscountRule {
    id?: string;
    percentage?: number;
    priority?: number;
    isActive?: boolean;
}

export interface SnapshotOfferItem {
    id?: string;
    name?: string;
    vehicleType?: string;
    vehicleTier?: string;
    rentalType?: string;
    basePrice?: number;
    pricePerDay?: number;
    pricePerHour?: number;
    pricePerKm?: number;
    includedKm?: number;
    options?: { code: string; name?: string; priceModifier?: number; periodicity?: string; isIncluded?: boolean; codeRef?: ParameterReference }[];
    equipments?: { code: string; name?: string; priceModifier?: number; periodicity?: string; isIncluded?: boolean; codeRef?: ParameterReference }[];
    securityDeposit?: number;
    franchise?: { percentage?: number; minAmount?: number; conditions?: string };
    preferentialPrices?: SnapshotPreferentialPrice[];
    discounts?: SnapshotDiscountRule[];
    penalties?: PenaltyRule[];
}

export interface OfferSnapshot {
    id: string;
    offers: SnapshotOfferItem[];
}

export interface PenaltyRule {
    type?: string;
    amount?: number;
    basis?: string;
    conditions?: string;
    typeRef?: ParameterReference;
    basisRef?: ParameterReference;
}

export interface FleetBooking {
    id: string;
    entityReference?: string;
    startDate: string;
    endDate: string;
    resources: FleetResource[];
    totalPrice: number;
    discount?: number;
    status: string;
    createdAt: string;
    updatedAt?: string;
    optionSupplements?: FleetBookingOptionSupplement[];
    equipmentSupplements?: FleetBookingEquipmentSupplement[];
    selectedEquipment?: string[];
    selectedOptions?: string[];
    assignments?: FleetResourceAssignment[];
    securityDeposit?: number;
    includedKm?: number;
    franchise?: {
        percentage?: number;
        minAmount?: number;
        conditions?: string;
    };
    penalties?: PenaltyRule[];
    provider?: Organization;
    client?: Organization;
    offerSnapshotId?: string;
}

export interface HandoverDamage {
    id?: string;
    zoneId: string;
    description: string;
    damageType: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    photoId?: string;
    photoIds?: string[];
    damageTypeRef?: ParameterReference;
}

export interface HandoverSchema {
    viewBox: string;
    zones: { id: string; path: string }[];
}

export interface VehicleHandoverResponse {
    id: string;
    bookingId: string;
    vehicleId?: string;
    type: 'DELIVERY' | 'RETURN';
    status: 'DRAFT' | 'ACCEPTED';
    date: string;
    odometerValue: number;
    fuelLevel: string;
    comments?: string;
    signatureImageId?: string;
    damages?: HandoverDamage[];
    schema?: HandoverSchema;
    createdAt: string;
}

export type ShipmentStatus = 'PENDING' | 'MATCHING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type ShipmentLegStatus = 'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type VehicleType = 'TRUCK' | 'VAN' | 'TRAILER' | 'REFRIGERATED' | 'FLATBED' | 'TANKER';
export type CargoType = 'GENERAL' | 'FRAGILE' | 'HAZARDOUS' | 'PERISHABLE' | 'BULK';
export type TourType = 'PICKUP' | 'LONG_HAUL' | 'LAST_MILE' | 'DIRECT';

export interface ShipmentLeg {
    id: string;
    sequenceOrder: number;
    type: TourType;
    fromHubId?: string;
    toHubId?: string;
    status: ShipmentLegStatus;
    assignedTourId?: string;
    estimatedStartTime?: string;
    estimatedEndTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
}

export interface Shipment {
    id: string;
    entityReference?: string;
    trackingNumber?: string;
    origin: Address;
    destination: Address;
    vehicleType: VehicleType;
    weight?: number;
    status: ShipmentStatus;
    estimatedPrice?: number;
    selectedDeliveryServiceId?: string;
    selectedProviderId?: string;
    itinerary?: ShipmentLeg[];
    createdAt: string;
    updatedAt: string;
    userRating?: number;
    userComment?: string;
    provider?: Organization;
    client?: Organization;
}
