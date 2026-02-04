// Simplified types for PDF generation server-side

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

export interface FleetResource {
    type: string;
    quantity: number;
    dailyRate: number;
    resourceName?: string;
}

export interface FleetBookingOptionSupplement {
    code: string;
    name?: string;
    priceModifier?: number;
    priceModifierType?: string;
    periodicity?: string;
    isIncluded?: boolean;
}

export interface FleetBookingEquipmentSupplement {
    code: string;
    name?: string;
    priceModifier?: number;
    priceModifierType?: string;
    periodicity?: string;
    isIncluded?: boolean;
}

export interface FleetResourceAssignment {
    id: string;
    resourceType: 'VEHICLE' | 'DRIVER' | 'EQUIPMENT';
    resourceId: string;
    resourceName?: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface PenaltyRule {
    type?: string;
    amount?: number;
    basis?: string;
    conditions?: string;
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
    provider?: any;
    client?: any;
}
