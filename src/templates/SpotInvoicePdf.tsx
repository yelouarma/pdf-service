import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Shipment, Organization, Address } from './types';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'NotoSans',
        lineHeight: 1.5,
        color: '#334155',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 20,
    },
    brand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    invoiceTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#64748b',
    },
    invoiceNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#0f172a',
    },
    grid: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 30,
    },
    column: {
        flex: 1,
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    text: {
        fontSize: 10,
        marginBottom: 2,
    },
    table: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 8,
    },
    colDesc: { flex: 3 },
    colQty: { flex: 1, textAlign: 'center' },
    colPrice: { flex: 1, textAlign: 'right' },
    colTotal: { flex: 1, textAlign: 'right', fontWeight: 'bold' },
    
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
        marginBottom: 5,
    },
    totalLabel: {
        width: 100,
        textAlign: 'right',
        color: '#64748b',
    },
    totalValue: {
        width: 100,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    grandTotal: {
        fontSize: 14,
        color: '#2563eb',
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        paddingTop: 10,
        marginTop: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
    }
});

interface Props {
    shipment: Shipment;
    t: (key: string) => string;
    vatRate?: number;  // Dynamic VAT rate (default: 0.20 for 20%)
}

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
};

const LabelValue = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
        <Text style={{ width: 80, fontSize: 9, color: '#64748b' }}>{label} :</Text>
        <Text style={{ flex: 1, fontSize: 9, color: '#0f172a' }}>{value || '—'}</Text>
    </View>
);

const OrganizationDetails = ({ org, title }: { org?: Organization, title: string }) => {
    if (!org) {
        return (
            <View style={styles.column}>
                <Text style={styles.label}>{title}</Text>
                <Text style={styles.text}>—</Text>
            </View>
        );
    }

    const isPhysical = org.legalPersonTypeKey === 'PHYSICAL';
    const name = isPhysical ? `${org.physicalFirstName} ${org.physicalLastName}` : org.name;
    const address = org.address?.street || (isPhysical ? org.physicalResidencePlace : org.moralHeadquarters);
    const city = org.address?.city || org.physicalResidencePlace;
    const postalCode = org.address?.postalCode || '';
    const email = org.contactEmail || org.physicalEmail || org.legalRepresentative?.email || org.contactInfo?.email;
    const phone = org.contactPhone || org.physicalPhone || org.legalRepresentative?.phone || org.contactInfo?.phone;

    return (
        <View style={styles.column}>
            <Text style={styles.label}>{title}</Text>
            <Text style={[styles.text, { fontWeight: 'bold', fontSize: 11, marginBottom: 4 }]}>{name}</Text>
            <LabelValue label="Adresse" value={address} />
            <LabelValue label="Ville" value={`${postalCode} ${city}`} />
            <LabelValue label="Email" value={email} />
            <LabelValue label="Tél" value={phone} />
            
            {!isPhysical && (
                <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: '#e2e8f0' }}>
                    {org.moralIce && <LabelValue label="ICE" value={org.moralIce} />}
                    {org.moralRc && <LabelValue label="RC" value={org.moralRc} />}
                    {org.moralTaxId && <LabelValue label="I.F" value={org.moralTaxId} />}
                    {org.moralPatent && <LabelValue label="Patente" value={org.moralPatent} />}
                </View>
            )}
        </View>
    );
};

export const SpotInvoicePdf = ({ shipment, t, vatRate = 0.20 }: Props) => {
    const effectiveVatRate = vatRate ?? 0.20;
    const provider = shipment.provider || {} as Organization;
    const client = shipment.client || {} as Organization;
    const date = format(new Date(), 'dd/MM/yyyy');
    
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>FACTURE</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>Service de Livraison Spot</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceTitle}>FACTURE N°</Text>
                        <Text style={styles.invoiceNumber}>INV-{shipment.trackingNumber || shipment.id.substring(0, 8)}</Text>
                        <Text style={{ textAlign: 'right', fontSize: 10, marginTop: 4 }}>Date: {date}</Text>
                    </View>
                </View>

                {/* Addresses */}
                <View style={styles.grid}>
                    <OrganizationDetails org={provider} title="ÉMETTEUR (PRESTATAIRE)" />
                    <OrganizationDetails org={client} title="CLIENT (DESTINATAIRE)" />
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>DESCRIPTION</Text>
                        <Text style={styles.colQty}>QTE</Text>
                        <Text style={styles.colPrice}>P.U. HT</Text>
                        <Text style={styles.colTotal}>TOTAL HT</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.colDesc}>
                            <Text style={{ fontWeight: 'bold' }}>Livraison Spot</Text>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>De: {shipment.origin.city}</Text>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>À: {shipment.destination.city}</Text>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>Véhicule: {shipment.vehicleType}</Text>
                        </View>
                        <Text style={styles.colQty}>1</Text>
                        <Text style={styles.colPrice}>{formatPrice(shipment.estimatedPrice || 0)}</Text>
                        <Text style={styles.colTotal}>{formatPrice(shipment.estimatedPrice || 0)}</Text>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total HT:</Text>
                        <Text style={styles.totalValue}>{formatPrice(shipment.estimatedPrice || 0)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TVA ({(effectiveVatRate * 100).toFixed(0)}%):</Text>
                        <Text style={styles.totalValue}>{formatPrice((shipment.estimatedPrice || 0) * effectiveVatRate)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text style={[styles.totalLabel, { color: '#1e3a8a', fontWeight: 'bold' }]}>TOTAL TTC:</Text>
                        <Text style={[styles.totalValue, { fontSize: 14 }]}>{formatPrice((shipment.estimatedPrice || 0) * (1 + effectiveVatRate))}</Text>
                    </View>
                </View>

                {/* Payment Info */}
                <View style={{ marginTop: 40, padding: 15, backgroundColor: '#f8fafc', borderRadius: 4 }}>
                    <Text style={[styles.label, { marginBottom: 8 }]}>INFORMATIONS DE PAIEMENT</Text>
                    <Text style={styles.text}>Mode de paiement: Virement Bancaire / Chèque</Text>
                    <Text style={styles.text}>Échéance: À réception de facture</Text>
                    <Text style={[styles.text, { marginTop: 5, fontSize: 9 }]}>
                        En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.
                    </Text>
                </View>

                <Text style={styles.footer}>
                    {provider.name} - {provider.address?.city} - ICE: {provider.moralIce} - RC: {provider.moralRc}
                </Text>
            </Page>
        </Document>
    );
};
