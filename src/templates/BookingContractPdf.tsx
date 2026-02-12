import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ParameterPdfText } from './ParameterPdfText';
import { format } from 'date-fns';
import type { FleetBooking, FleetBookingOptionSupplement, FleetBookingEquipmentSupplement, Organization, OfferSnapshot } from './types';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
        color: '#1a1a1a',
    },
    // Header & Titles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 15,
    },
    titleContainer: {
        flexDirection: 'column',
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    referenceLabel: {
        fontSize: 10,
        color: '#64748b',
    },
    // Sections
    section: {
        marginBottom: 15,
    },
    sectionHeader: {
        backgroundColor: '#f1f5f9',
        padding: '4 8',
        fontWeight: 'bold',
        fontSize: 10,
        color: '#1e3a8a',
        textTransform: 'uppercase',
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#2563eb',
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
    },
    column: {
        flex: 1,
    },
    // Rows & Labels
    row: {
        flexDirection: 'row',
        marginBottom: 4,
        alignItems: 'baseline',
    },
    label: {
        fontWeight: 'bold',
        color: '#475569',
        width: 100,
    },
    value: {
        flex: 1,
        color: '#0f172a',
    },
    dottedValue: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        borderBottomStyle: 'dotted',
        minHeight: 12,
    },
    // Equipment List
    equipmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '2 4',
        marginBottom: 2,
    },
    bullet: {
        width: 4,
        height: 4,
        backgroundColor: '#2563eb',
        marginRight: 6,
        borderRadius: 2,
    },
    // Tables
    table: {
        width: '100%',
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        fontWeight: 'bold',
        pageBreakInside: 'avoid' as any,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        minHeight: 20,
        alignItems: 'center',
        pageBreakInside: 'avoid' as any,
    },
    tableCol: {
        flex: 1,
        padding: 4,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    // Signatures
    signatureGrid: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 40,
    },
    signatureBox: {
        flex: 1,
        height: 100,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        marginTop: 10,
        padding: 8,
    },
    signatureTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: 5,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 5,
    }
});

interface ContractPdfProps {
    booking: FleetBooking;
    offerSnapshot?: OfferSnapshot;
    rentalDays: number;
    basePrice: number;
    optionsTotal: number;
    discount: number;
    total: number;
    paidEquipments: FleetBookingEquipmentSupplement[];
    paidOptions: FleetBookingOptionSupplement[];
    optionAmount: (modifier: number, periodicity?: string) => number;
    numberLocale: string;
    parameterLabels?: Record<string, Record<string, string>>;
    t: (key: string, options?: any) => string;
    type?: 'CONTRACT' | 'INVOICE';
}

const LabelValue = ({ label, value, dotted = false }: { label: string; value?: React.ReactNode; dotted?: boolean }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label} :</Text>
        {dotted ? (
            <View style={styles.dottedValue}>
                {value && <Text>{value}</Text>}
            </View>
        ) : (
            <Text style={styles.value}>{value || '—'}</Text>
        )}
    </View>
);

export const BookingContractPdf = ({
    booking,
    offerSnapshot,
    rentalDays,
    basePrice,
    optionsTotal,
    discount,
    total,
    paidEquipments,
    paidOptions,
    optionAmount,
    numberLocale,
    parameterLabels,
    t,
    type = 'CONTRACT'
}: ContractPdfProps) => {
    const reference = booking.entityReference || booking.id;
    const client = (booking.client || {}) as Organization;
    const provider = (booking.provider || {}) as Organization;
    const mainResource = booking.resources?.[0];

    // Assignments
    const vehicleAssigned = booking.assignments?.find(a => a.resourceType === 'VEHICLE');
    const driverAssigned = booking.assignments?.find(a => a.resourceType === 'DRIVER');

    const formatPrice = (amount: number) => {
        const parts = amount.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts[0] + (parts[1] !== '00' ? ',' + parts[1] : '') + ' DH';
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch (e) {
            return '';
        }
    };

    const renderContract = () => (
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>{t('providerRequests.contractTitle').toUpperCase()}</Text>
                    <View style={{ height: 10 }} />
                    <Text style={styles.referenceLabel}>{t('providerRequests.reference')} : {reference}</Text>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text style={{ fontWeight: 'bold' }}>{formatDate(new Date().toISOString())}</Text>
                </View>
            </View>

            {/* Parties */}
            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.providerSection')}</Text>
                    <LabelValue label="Société" value={provider.name || '—'} />
                    {provider.moralIce && <LabelValue label="ICE" value={provider.moralIce} />}
                    {provider.moralRc && <LabelValue label="RC" value={provider.moralRc} />}
                    {provider.moralTaxId && <LabelValue label="I.F" value={provider.moralTaxId} />}
                    {provider.moralPatent && <LabelValue label="Patente" value={provider.moralPatent} />}
                    <LabelValue label="Email" value={provider.contactEmail || provider.physicalEmail || provider.legalRepresentative?.email || provider.contactInfo?.email} />
                    <LabelValue label="Téléphone" value={provider.contactPhone || provider.physicalPhone || provider.legalRepresentative?.phone || provider.contactInfo?.phone} />
                    <LabelValue label="Adresse" value={provider.address?.street || (provider.legalPersonTypeKey === 'MORAL' ? provider.moralHeadquarters : null) || provider.physicalResidencePlace} />
                    <LabelValue label="Ville" value={provider.address?.city || provider.physicalResidencePlace} />
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.clientSection')}</Text>
                    <LabelValue label="Nom/Raison" value={client.legalPersonTypeKey === 'PHYSICAL' ? `${client.physicalFirstName} ${client.physicalLastName}` : client.name} />
                    {client.legalPersonTypeKey !== 'PHYSICAL' && (
                        <>
                            {client.moralIce && <LabelValue label="ICE" value={client.moralIce} />}
                            {client.moralRc && <LabelValue label="RC" value={client.moralRc} />}
                            {client.moralTaxId && <LabelValue label="I.F" value={client.moralTaxId} />}
                            {client.moralPatent && <LabelValue label="Patente" value={client.moralPatent} />}
                        </>
                    )}
                    <LabelValue label="Email" value={client.contactEmail || client.physicalEmail || client.legalRepresentative?.email || client.contactInfo?.email} />
                    <LabelValue label="Téléphone" value={client.contactPhone || client.physicalPhone || client.legalRepresentative?.phone || client.contactInfo?.phone} />
                    <LabelValue label="Adresse" value={client.address?.street || (client.legalPersonTypeKey === 'MORAL' ? client.moralHeadquarters : null) || client.physicalResidencePlace} />
                    <LabelValue label="Ville" value={client.address?.city || client.physicalResidencePlace} />
                </View>
            </View>
            {/* Détails Offres */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.offerSection')}</Text>
                {(offerSnapshot?.offers || booking.resources || []).map((item: any, idx) => {
                    const isSnapshot = !!item.vehicleType;
                    const type = isSnapshot ? item.vehicleType : item.type;
                    const qty = isSnapshot ? 1 : item.quantity;
                    const price = isSnapshot ? (item.pricePerDay || item.basePrice || 0) : item.dailyRate;
                    const franchise = item.franchise || booking.franchise;
                    const securityDeposit = item.securityDeposit != null ? item.securityDeposit : booking.securityDeposit;
                    const includedKm = item.includedKm != null ? item.includedKm : booking.includedKm;

                    return (
                        <View key={idx} style={{ marginBottom: idx < (offerSnapshot?.offers?.length || booking.resources?.length || 0) - 1 ? 10 : 0 }}>
                            <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 2, marginBottom: 5 }]}>
                                <Text style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{item.name || `Offre #${idx + 1}`} ({qty} véhicule{qty > 1 ? 's' : ''})</Text>
                            </View>
                            <View style={styles.grid}>
                                <View style={styles.column}>
                                    <LabelValue label="Période" value={`${formatDate(booking.startDate)} au ${formatDate(booking.endDate)}`} />
                                    <LabelValue
                                        label="Type Véhicule"
                                        value={<ParameterPdfText domain="VEHICLE_TYPES" value={type} parameterReference={isSnapshot ? item.typeRef : item.typeRef} labels={parameterLabels?.VEHICLE_TYPES} />}
                                    />
                                    <LabelValue label="KM Inclus" value={includedKm != null ? `${includedKm} KM` : 'Illimité'} />
                                </View>
                                <View style={styles.column}>
                                    <LabelValue label="Tarif de base" value={formatPrice(Number(price))} />
                                    <LabelValue label="Caution" value={formatPrice(Number(securityDeposit || 0))} />
                                    <LabelValue
                                        label="Franchise"
                                        value={franchise ? `${franchise.percentage || 0}% (min. ${formatPrice(franchise.minAmount || 0)})` : '—'}
                                    />
                                </View>
                            </View>
                            {/* Included items for this specific offer */}
                            {isSnapshot && (item.equipments?.some((e: any) => e.isIncluded) || item.options?.some((o: any) => o.isIncluded)) && (
                                <View style={{ marginTop: 5, paddingLeft: 5 }}>
                                    <Text style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>Inclus :</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                        {item.equipments?.filter((e: any) => e.isIncluded).map((e: any) => (
                                            <Text key={e.code} style={{ fontSize: 7, backgroundColor: '#f8fafc', padding: '1 3', borderRadius: 2, borderWidth: 0.5, borderColor: '#e2e8f0' }}>
                                                <ParameterPdfText domain="VEHICLE_FEATURES" value={e.code} parameterReference={e.codeRef} labels={parameterLabels?.VEHICLE_FEATURES} />
                                            </Text>
                                        ))}
                                        {item.options?.filter((o: any) => o.isIncluded).map((o: any) => (
                                            <Text key={o.code} style={{ fontSize: 7, backgroundColor: '#f8fafc', padding: '1 3', borderRadius: 2, borderWidth: 0.5, borderColor: '#e2e8f0' }}>
                                                <ParameterPdfText domain="VEHICLE_SERVICES" value={o.code} parameterReference={o.codeRef} labels={parameterLabels?.VEHICLE_SERVICES} />
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {/* Affectation & Resources */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.assignmentSection')}</Text>
                {booking.assignments && booking.assignments.length > 0 ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableCol, { textAlign: 'left', flex: 2 }]}>Ressource</Text>
                            <Text style={styles.tableCol}>Type</Text>
                            <Text style={[styles.tableCol, { flex: 2 }]}>Période</Text>
                            <Text style={styles.tableCol}>Km Départ</Text>
                        </View>
                        {booking.assignments.map((a, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.tableCol, { textAlign: 'left', flex: 2 }]}>{a.resourceName || a.resourceId}</Text>
                                <Text style={styles.tableCol}>{a.resourceType}</Text>
                                <View style={[styles.tableCol, { fontSize: 8 }]}>
                                    <ParameterPdfText domain="RESOURCE_ASSIGNMENT_STATUS" value={a.status} parameterReference={a.statusRef} labels={parameterLabels?.RESOURCE_ASSIGNMENT_STATUS} />
                                </View>
                                <Text style={[styles.tableCol, { flex: 2, fontSize: 8 }]}>{formatDate(a.startDate)} - {formatDate(a.endDate)}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.grid}>
                        <View style={styles.column}>
                            <LabelValue label={t('providerRequests.contractTemplate.vehicleAssigned')} value="—" dotted />
                            <LabelValue label={t('providerRequests.contractTemplate.driverAssigned')} value="—" dotted />
                        </View>
                        <View style={styles.column}>
                            <LabelValue label={t('providerRequests.contractTemplate.startMileage')} value="" dotted />
                        </View>
                    </View>
                )}
            </View>

            {/* Equipments */}
            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.includedEquipment')}</Text>
                    {booking.equipmentSupplements?.filter(e => e.isIncluded).map(e => (
                        <View key={e.code} style={styles.equipmentItem}>
                            <View style={styles.bullet} />
                            <ParameterPdfText domain="VEHICLE_FEATURES" value={e.code} parameterReference={e.codeRef} fallback={e.name} />
                        </View>
                    ))}
                    {booking.optionSupplements?.filter(o => o.isIncluded).map(o => (
                        <View key={o.code} style={styles.equipmentItem}>
                            <View style={styles.bullet} />
                            <ParameterPdfText domain="VEHICLE_SERVICES" value={o.code} parameterReference={o.codeRef} fallback={o.name} />
                        </View>
                    ))}
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.optionalEquipment')}</Text>
                    {paidEquipments.map(e => (
                        <View key={e.code} style={styles.equipmentItem}>
                            <View style={[styles.bullet, { backgroundColor: '#10b981' }]} />
                            <Text>
                                <ParameterPdfText domain="VEHICLE_FEATURES" value={e.code} parameterReference={e.codeRef} fallback={e.name} />
                                <Text> ({formatPrice(optionAmount(Number(e.priceModifier) || 0, e.periodicity))})</Text>
                            </Text>
                        </View>
                    ))}
                    {paidOptions.map(o => (
                        <View key={o.code} style={styles.equipmentItem}>
                            <View style={[styles.bullet, { backgroundColor: '#10b981' }]} />
                            <Text>
                                <ParameterPdfText domain="VEHICLE_SERVICES" value={o.code} parameterReference={o.codeRef} fallback={o.name} />
                                <Text> ({formatPrice(optionAmount(Number(o.priceModifier) || 0, o.periodicity))})</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Conditions Tables */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>{t('providerRequests.contractTemplate.vehicleConditionSection')}</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableCol, { flex: 2 }]}>Désignation</Text>
                        <Text style={styles.tableCol}>État Départ</Text>
                        <Text style={styles.tableCol}>État Retour</Text>
                        <Text style={[styles.tableCol, { flex: 2 }]}>Observations</Text>
                    </View>
                    {['Carrosserie', 'Pneus', 'Intérieur', 'Niveau Carburant', 'Accessoires'].map(item => (
                        <View key={item} style={styles.tableRow}>
                            <Text style={[styles.tableCol, { flex: 2, textAlign: 'left' }]}>{item}</Text>
                            <Text style={styles.tableCol}></Text>
                            <Text style={styles.tableCol}></Text>
                            <Text style={[styles.tableCol, { flex: 2 }]}></Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Pénalités */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>PÉNALITÉS & CONDITIONS SPÉCIFIQUES</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableCol, { flex: 2 }]}>Type de manquement</Text>
                        <Text style={styles.tableCol}>Montant / Base</Text>
                        <Text style={[styles.tableCol, { flex: 3 }]}>Observations / Conditions</Text>
                    </View>
                    {booking.penalties && booking.penalties.length > 0 ? (
                        booking.penalties.map((p, i) => (
                            <View key={i} style={styles.tableRow}>
                                <View style={[styles.tableCol, { flex: 2, textAlign: 'left' }]}>
                                    <ParameterPdfText domain="PENALTY_TYPES" value={p.type} parameterReference={p.typeRef} labels={parameterLabels?.PENALTY_TYPES} />
                                </View>
                                <View style={[styles.tableCol, { flexWrap: 'nowrap' }]}>
                                    <Text>{p.amount != null ? `${p.amount} ` : ''}<ParameterPdfText domain="PENALTY_BASIS" value={p.basis} parameterReference={p.basisRef} labels={parameterLabels?.PENALTY_BASIS} /></Text>
                                </View>
                                <Text style={[styles.tableCol, { flex: 3, textAlign: 'left', fontSize: 7 }]}>{p.conditions}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCol, { flex: 6, textAlign: 'center', fontStyle: 'italic', color: '#94a3b8' }]}>
                                Aucune pénalité spécifique renseignée
                            </Text>
                        </View>
                    )}
                </View>
                {booking.franchise?.conditions && (
                    <Text style={{ fontSize: 7, marginTop: 5, color: '#475569' }}>
                        * Conditions franchise : {booking.franchise.conditions}
                    </Text>
                )}
            </View>

            {/* Signatures */}
            <View style={styles.signatureGrid}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.signatureTitle}>{t('providerRequests.contractTemplate.clientSignature')}</Text>
                    <View style={styles.signatureBox} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.signatureTitle}>{t('providerRequests.contractTemplate.providerSignature')}</Text>
                    <View style={styles.signatureBox} />
                </View>
            </View>

            <Text style={styles.footer}>{t('providerRequests.termsIntro')}</Text>
        </Page>
    );

    const renderInvoice = () => (
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>{t('providerRequests.invoiceTitle').toUpperCase()}</Text>
                    <View style={{ height: 10 }} />
                    <Text style={styles.referenceLabel}>Facture N° : INV-{reference}</Text>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text style={{ fontWeight: 'bold' }}>{formatDate(new Date().toISOString())}</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionHeader}>{t('providerRequests.providerDetails')}</Text>
                    <Text style={{ fontWeight: 'bold' }}>{provider.name || '—'}</Text>
                    {provider.moralIce && <Text>ICE: {provider.moralIce}</Text>}
                    <Text>{provider.contactEmail || provider.physicalEmail || provider.legalRepresentative?.email || provider.contactInfo?.email || '—'}</Text>
                    <Text>{provider.contactPhone || provider.physicalPhone || provider.legalRepresentative?.phone || provider.contactInfo?.phone || '—'}</Text>
                    <Text>{provider.address?.street || (provider.legalPersonTypeKey === 'MORAL' ? provider.moralHeadquarters : null) || provider.physicalResidencePlace || '—'}</Text>
                    <Text>{provider.address?.postalCode} {provider.address?.city || '—'}</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionHeader}>{t('providerRequests.clientDetails')}</Text>
                    <Text style={{ fontWeight: 'bold' }}>{client.legalPersonTypeKey === 'PHYSICAL' ? `${client.physicalFirstName} ${client.physicalLastName}` : client.name}</Text>
                    {client.legalPersonTypeKey !== 'PHYSICAL' && client.moralIce && <Text>ICE: {client.moralIce}</Text>}
                    <Text>{client.contactEmail || client.physicalEmail || client.legalRepresentative?.email || client.contactInfo?.email || '—'}</Text>
                    <Text>{client.contactPhone || client.physicalPhone || client.legalRepresentative?.phone || client.contactInfo?.phone || '—'}</Text>
                    <Text>{client.address?.street || (client.legalPersonTypeKey === 'MORAL' ? client.moralHeadquarters : null) || client.physicalResidencePlace || '—'}</Text>
                    <Text>{client.address?.postalCode} {client.address?.city || '—'}</Text>
                </View>
            </View>

            <View style={{ marginTop: 30 }}>
                <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#1e3a8a', paddingBottom: 5, fontWeight: 'bold' }}>
                    <Text style={{ flex: 3 }}>Description</Text>
                    <Text style={{ flex: 1, textAlign: 'center' }}>Quantité</Text>
                    <Text style={{ flex: 1, textAlign: 'right' }}>Montant HT</Text>
                </View>

                {(offerSnapshot?.offers || booking.resources || []).map((item: any, idx) => {
                    const isSnapshot = !!item.vehicleType;
                    const type = isSnapshot ? item.vehicleType : item.type;
                    const qty = isSnapshot ? 1 : item.quantity;
                    const price = isSnapshot ? (item.pricePerDay || item.basePrice || 0) : item.dailyRate;
                    const name = item.name || `Offre #${idx + 1}`;

                    return (
                        <View key={idx} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                            <View style={{ flex: 3 }}>
                                <Text style={{ fontWeight: 'bold' }}>{name} ({rentalDays}j)</Text>
                                <ParameterPdfText domain="VEHICLE_TYPES" value={type} parameterReference={isSnapshot ? item.typeRef : item.typeRef} labels={parameterLabels?.VEHICLE_TYPES} />
                            </View>
                            <Text style={{ flex: 1, textAlign: 'center' }}>{qty}</Text>
                            <Text style={{ flex: 1, textAlign: 'right' }}>{formatPrice(Number(price) * qty * rentalDays)}</Text>
                        </View>
                    );
                })}

                {paidEquipments.map(e => (
                    <View key={e.code} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                        <View style={{ flex: 3 }}>
                            <ParameterPdfText domain="VEHICLE_FEATURES" value={e.code} parameterReference={e.codeRef} fallback={e.name} labels={parameterLabels?.VEHICLE_FEATURES} />
                        </View>
                        <Text style={{ flex: 1, textAlign: 'center' }}>1</Text>
                        <Text style={{ flex: 1, textAlign: 'right' }}>{formatPrice(optionAmount(Number(e.priceModifier) || 0, e.periodicity))}</Text>
                    </View>
                ))}

                {paidOptions.map(o => (
                    <View key={o.code} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                        <View style={{ flex: 3 }}>
                            <ParameterPdfText domain="VEHICLE_SERVICES" value={o.code} parameterReference={o.codeRef} fallback={o.name} labels={parameterLabels?.VEHICLE_SERVICES} />
                        </View>
                        <Text style={{ flex: 1, textAlign: 'center' }}>1</Text>
                        <Text style={{ flex: 1, textAlign: 'right' }}>{formatPrice(optionAmount(Number(o.priceModifier) || 0, o.periodicity))}</Text>
                    </View>
                ))}
            </View>

            <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
                <View style={{ width: 200 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                        <Text>Sous-total HT :</Text>
                        <Text>{formatPrice(basePrice + optionsTotal)}</Text>
                    </View>
                    {discount > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, color: '#10b981' }}>
                            <Text>Remise :</Text>
                            <Text>-{formatPrice(discount)}</Text>
                        </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1e3a8a', marginTop: 5, fontWeight: 'bold', fontSize: 12 }}>
                        <Text>TOTAL À PAYER :</Text>
                        <Text>{formatPrice(total)}</Text>
                    </View>
                </View>
            </View>

            <View style={{ marginTop: 50 }}>
                <Text style={{ fontStyle: 'italic', color: '#64748b' }}>Merci de votre confiance.</Text>
            </View>
        </Page>
    );

    return (
        <Document>
            {type === 'CONTRACT' ? renderContract() : renderInvoice()}
        </Document>
    );
};
