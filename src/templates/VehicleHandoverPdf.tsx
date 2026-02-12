import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Rect, Circle } from '@react-pdf/renderer';
import { ParameterPdfText } from './ParameterPdfText';
import { format } from 'date-fns';
import type { FleetBooking, VehicleHandoverResponse, HandoverDamage, FleetResourceAssignment } from './types';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
        color: '#1a1a1a',
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a8a',
        textTransform: 'uppercase',
    },
    subTitle: {
        fontSize: 10,
        color: '#64748b',
    },
    // Section
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e3a8a',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 8,
        paddingBottom: 4,
    },
    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    column: {
        flex: 1,
        minWidth: '45%',
    },
    // Key-Value
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        color: '#475569',
        width: 120,
    },
    value: {
        flex: 1,
        color: '#0f172a',
    },
    // Schema
    schemaContainer: {
        alignItems: 'center',
        marginVertical: 10,
        height: 300,
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
        height: 80,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signatureTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginTop: 5,
        fontSize: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendBox: {
        width: 10,
        height: 10,
        marginRight: 4,
    },
    // Table
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f8fafc',
    },
    tableCol: {
        padding: 5,
    },
    tableCell: {
        fontSize: 9,
    },
    tableCellHeader: {
        fontWeight: 'bold',
        fontSize: 9,
        color: '#475569',
    },
});

const VehicleSchemaPdf = ({ damages = [], schema }: { damages?: HandoverDamage[], schema?: any }) => {
    const getZoneColor = (zoneId: string) => {
        const isDamaged = damages.some((d) => d.zoneId === zoneId);
        if (isDamaged) return '#fca5a5';
        return '#f3f4f6';
    };

    const getZoneStroke = (zoneId: string) => {
        const isDamaged = damages.some((d) => d.zoneId === zoneId);
        if (isDamaged) return '#dc2626';
        return '#9ca3af';
    };

    const zones = schema?.zones || [];
    const viewBox = schema?.viewBox || "0 0 300 400";

    if (!schema) return null;

    return (
        <Svg viewBox={viewBox} style={{ width: 300, height: 400 }}>
            {zones.map((zone: any) => (
                <Path
                    key={zone.id}
                    d={zone.path}
                    fill={getZoneColor(zone.id)}
                    stroke={getZoneStroke(zone.id)}
                    strokeWidth={1}
                />
            ))}
            <Rect x="20" y="60" width="20" height="40" rx="5" fill="#1f2937" />
            <Rect x="260" y="60" width="20" height="40" rx="5" fill="#1f2937" />
            <Rect x="25" y="280" width="20" height="40" rx="5" fill="#1f2937" />
            <Rect x="255" y="280" width="20" height="40" rx="5" fill="#1f2937" />

            {damages.map((damage, index) => {
                const zone = zones.find((z: any) => z.id === damage.zoneId);
                if (!zone || zone.labelX === undefined) return null;
                return (
                    <React.Fragment key={index}>
                        <Circle cx={zone.labelX} cy={zone.labelY} r={8} fill="#dc2626" />
                        <Text
                            x={zone.labelX}
                            y={zone.labelY + 3}
                            style={{
                                fill: 'white',
                                fontSize: 8,
                                fontWeight: 'bold',
                                textAnchor: 'middle'
                            }}
                        >
                            {index + 1}
                        </Text>
                    </React.Fragment>
                );
            })}
        </Svg>
    );
};

interface VehicleHandoverPdfProps {
    booking: FleetBooking;
    handovers: VehicleHandoverResponse[];
    vehicleAssignments: FleetResourceAssignment[];
    schemas: Record<string, any>;
    t: (key: string) => string;
    parameterLabels?: Record<string, Record<string, string>>;
    /** Language code for parameter labels/descriptions (e.g. 'fr', 'en') */
    language?: string;
}

export const VehicleHandoverPdf = ({
    booking,
    handovers,
    vehicleAssignments,
    schemas,
    t,
    parameterLabels,
    language,
}: VehicleHandoverPdfProps) => {

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
        } catch {
            return dateStr;
        }
    };

    // Flatten pages: show recorded handovers, or a draft page for each vehicle with no records
    const pages: Array<{ type: 'RECORD' | 'DRAFT', vehicle: FleetResourceAssignment, handover?: VehicleHandoverResponse }> = [];

    // Sort assignments to have a consistent order
    const sortedAssignments = [...vehicleAssignments].sort((a, b) => (a.resourceName || '').localeCompare(b.resourceName || ''));

    sortedAssignments.forEach(assignment => {
        const vehicleHandovers = handovers.filter(h => h.vehicleId === assignment.resourceId);
        if (vehicleHandovers.length === 0) {
            // No history for this vehicle, add a draft page (delivery by default)
            pages.push({ type: 'DRAFT', vehicle: assignment });
        } else {
            // Show all records for this vehicle (Delivery then Return etc)
            // Sort them by date ascending
            const sortedHandovers = [...vehicleHandovers].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            sortedHandovers.forEach(h => {
                pages.push({ type: 'RECORD', vehicle: assignment, handover: h });
            });
        }
    });

    if (pages.length === 0) {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.mainTitle}>ÉTATS DES LIEUX</Text>
                            <Text style={styles.subTitle}>Ref: {booking.entityReference || booking.id}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#64748b' }}>Aucun véhicule n'est assigné à cette réservation.</Text>
                    </View>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            {pages.map((item, index) => {
                const handover = item.handover;
                const vehicle = item.vehicle;
                const schema = handover?.schema || schemas[vehicle.vehicleType || ''] || null;
                const isDelivery = handover ? (handover.type === 'DELIVERY') : true; // Default to delivery if draft

                const isDraft = item.type === 'DRAFT' || (handover && handover.status === 'DRAFT');
                const baseTitle = isDelivery ? t('handover.checkout') : t('handover.checkin');
                const title = isDraft ? `${baseTitle} (${t('common.draft') || 'Brouillon'})` : baseTitle;

                return (
                    <Page key={index} size="A4" style={styles.page}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.mainTitle}>{title.toUpperCase()}</Text>
                                <Text style={styles.subTitle}>Ref: {booking.entityReference || booking.id}</Text>
                            </View>
                            <View>
                                <Text>{formatDate(new Date().toISOString())}</Text>
                            </View>
                        </View>

                        {/* Info Section */}
                        <View style={styles.section}>
                            <View style={styles.grid}>
                                <View style={styles.column}>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{t('handover.vehicle')}:</Text>
                                        <Text style={styles.value}>{vehicle.resourceName || vehicle.resourceId || 'Véhicule'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{t('handover.date')}:</Text>
                                        <Text style={styles.value}>{formatDate(handover?.date)}</Text>
                                    </View>
                                </View>
                                <View style={styles.column}>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{t('handover.odometer')}:</Text>
                                        <Text style={styles.value}>{handover?.odometerValue ?? '____'} km</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>{t('handover.fuelLevel')}:</Text>
                                        <View style={styles.value}>
                                            {handover ? (
                                                <ParameterPdfText domain="FUEL_LEVEL" value={handover.fuelLevel} labels={parameterLabels?.FUEL_LEVEL} />
                                            ) : (
                                                <Text>________________</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Schema Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('handover.vehicleCondition')}</Text>
                            {schema ? (
                                <View style={styles.schemaContainer}>
                                    <VehicleSchemaPdf damages={handover?.damages || []} schema={schema} />
                                    <View style={styles.legend}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#9ca3af' }]} />
                                            <Text>{t('handover.intact')}</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, { backgroundColor: '#fca5a5', borderWidth: 1, borderColor: '#dc2626' }]} />
                                            <Text>{t('handover.damaged')}</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ height: 300, justifyContent: 'center', alignItems: 'center', border: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' }}>
                                    <Text style={{ color: '#94a3b8' }}>Schéma non disponible pour ce type de véhicule</Text>
                                </View>
                            )}
                        </View>

                        {/* Damages Table */}
                        {handover?.damages && handover.damages.length > 0 ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('handover.damagesList')}</Text>
                                <View style={styles.table}>
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <View style={[styles.tableCol, { width: '10%' }]}>
                                            <Text style={styles.tableCellHeader}>#</Text>
                                        </View>
                                        <View style={[styles.tableCol, { width: '30%' }]}>
                                            <Text style={styles.tableCellHeader}>{t('handover.zone')}</Text>
                                        </View>
                                        <View style={[styles.tableCol, { width: '25%' }]}>
                                            <Text style={styles.tableCellHeader}>{t('handover.damageType')}</Text>
                                        </View>
                                        <View style={[styles.tableCol, { width: '35%' }]}>
                                            <Text style={styles.tableCellHeader}>{t('handover.description')}</Text>
                                        </View>
                                    </View>
                                    {handover.damages.map((damage, i) => (
                                        <View key={i} style={styles.tableRow}>
                                            <View style={[styles.tableCol, { width: '10%' }]}>
                                                <Text style={styles.tableCell}>{i + 1}</Text>
                                            </View>
                                            <View style={[styles.tableCol, { width: '30%' }]}>
                                                <Text style={styles.tableCell}>{t(`handover.zones.${damage.zoneId}`)}</Text>
                                            </View>
                                            <View style={[styles.tableCol, { width: '25%' }]}>
                                                <ParameterPdfText domain="DAMAGE_TYPES" value={damage.damageType} parameterReference={damage.damageTypeRef} labels={parameterLabels?.DAMAGE_TYPES} language={language} />
                                            </View>
                                            <View style={[styles.tableCol, { width: '35%' }]}>
                                                <Text style={styles.tableCell}>{damage.description || '-'}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : item.type === 'DRAFT' ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('handover.damagesList')}</Text>
                                <View style={{ border: 1, borderColor: '#e2e8f0', padding: 10, minHeight: 60 }}>
                                    <Text style={{ color: '#94a3b8' }}>Notes complémentaires: ____________________________________________________________________________________________________________________________________________________________________________</Text>
                                </View>
                            </View>
                        ) : null}

                        {/* Comments */}
                        {handover?.comments ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{t('handover.comments')}</Text>
                                <Text>{handover.comments}</Text>
                            </View>
                        ) : item.type === 'DRAFT' ? null : null}

                        {/* Signatures */}
                        <View style={styles.signatureGrid}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.signatureTitle}>{t('providerRequests.contractTemplate.clientSignature')}</Text>
                                <View style={styles.signatureBox}>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.signatureTitle}>{t('providerRequests.contractTemplate.providerSignature')}</Text>
                                <View style={styles.signatureBox}>
                                </View>
                            </View>
                        </View>

                        <Text style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#9ca3af' }}>
                            {index + 1} / {pages.length}
                        </Text>
                    </Page>
                );
            })}
        </Document>
    );
};
