import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Shipment, Organization, Address } from './types';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'NotoSans',
        lineHeight: 1.4,
        color: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b',
    },
    section: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 10,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1e3a8a',
        textTransform: 'uppercase',
        backgroundColor: '#f1f5f9',
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 100,
        fontWeight: 'bold',
        color: '#475569',
        fontSize: 9,
    },
    value: {
        flex: 1,
        fontSize: 9,
    },
    grid: {
        flexDirection: 'row',
        gap: 10,
    },
    column: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
    },
    signatureBox: {
        height: 60,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
        marginTop: 5,
    }
});

interface Props {
    shipment: Shipment;
    t: (key: string) => string;
}

const LabelValue = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label} :</Text>
        <Text style={styles.value}>{value || '—'}</Text>
    </View>
);

const OrganizationDetails = ({ org, title }: { org?: Organization, title: string }) => {
    if (!org) {
        return (
            <View style={styles.column}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.value}>—</Text>
            </View>
        );
    }

    const isPhysical = org.legalPersonTypeKey === 'PHYSICAL';
    const name = isPhysical ? `${org.physicalFirstName} ${org.physicalLastName}` : org.name;
    const address = org.address?.street || (isPhysical ? org.physicalResidencePlace : org.moralHeadquarters);
    const city = org.address?.city || org.physicalResidencePlace;
    const email = org.contactEmail || org.physicalEmail || org.legalRepresentative?.email || org.contactInfo?.email;
    const phone = org.contactPhone || org.physicalPhone || org.legalRepresentative?.phone || org.contactInfo?.phone;

    return (
        <View style={styles.column}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <LabelValue label="Nom/Raison" value={name} />
            {!isPhysical && (
                <>
                    {org.moralIce && <LabelValue label="ICE" value={org.moralIce} />}
                    {org.moralRc && <LabelValue label="RC" value={org.moralRc} />}
                    {org.moralTaxId && <LabelValue label="I.F" value={org.moralTaxId} />}
                    {org.moralPatent && <LabelValue label="Patente" value={org.moralPatent} />}
                </>
            )}
            <LabelValue label="Email" value={email} />
            <LabelValue label="Téléphone" value={phone} />
            <LabelValue label="Adresse" value={address} />
            <LabelValue label="Ville" value={city} />
        </View>
    );
};

const AddressBlock = ({ address, title }: { address: Address, title: string }) => (
    <View style={styles.column}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <LabelValue label="Adresse" value={address.street} />
        {address.additionalInfo && <LabelValue label="Complément" value={address.additionalInfo} />}
        <LabelValue label="Ville" value={`${address.postalCode} ${address.city}`} />
        <LabelValue label="Pays" value={address.country} />
    </View>
);

export const SpotTransportLetterPdf = ({ shipment, t }: Props) => {
    const formatDate = (date: string) => date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>LETTRE DE VOITURE</Text>
                        <Text style={styles.subtitle}>Transport Routier de Marchandises</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold' }}>N° {shipment.trackingNumber || shipment.id.substring(0, 8).toUpperCase()}</Text>
                        <Text>Date: {formatDate(shipment.createdAt)}</Text>
                    </View>
                </View>

                {/* Parties */}
                <View style={styles.section}>
                    <View style={styles.grid}>
                        <OrganizationDetails org={shipment.client} title="EXPÉDITEUR (Donneur d'ordre)" />
                        <OrganizationDetails org={shipment.provider} title="TRANSPORTEUR" />
                    </View>
                </View>

                {/* Trajet */}
                <View style={styles.section}>
                    <View style={styles.grid}>
                        <AddressBlock title="LIEU D'ENLÈVEMENT" address={shipment.origin} />
                        <AddressBlock title="LIEU DE LIVRAISON" address={shipment.destination} />
                    </View>
                </View>

                {/* Marchandise */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DÉTAIL DE LA MARCHANDISE</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Type de véhicule requis:</Text>
                        <Text style={styles.value}>{shipment.vehicleType}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Poids déclaré:</Text>
                        <Text style={styles.value}>{shipment.weight ? `${shipment.weight} kg` : 'Non spécifié'}</Text>
                    </View>
                    {/* Add more details if available in Shipment interface later */}
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>INSTRUCTIONS PARTICULIÈRES</Text>
                    <Text style={{ fontSize: 9 }}>
                        {shipment.userComment || "Aucune instruction particulière."}
                    </Text>
                </View>

                {/* Signatures */}
                <View style={[styles.section, { borderStyle: 'solid', marginTop: 20 }]}>
                    <View style={styles.grid}>
                        <View style={styles.column}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>SIGNATURE EXPÉDITEUR</Text>
                            <Text style={{ fontSize: 7, color: '#64748b' }}>Date & Heure d'enlèvement</Text>
                            <View style={styles.signatureBox} />
                        </View>
                        <View style={styles.column}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>SIGNATURE TRANSPORTEUR</Text>
                            <Text style={{ fontSize: 7, color: '#64748b' }}>Prise en charge</Text>
                            <View style={styles.signatureBox} />
                        </View>
                        <View style={styles.column}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>SIGNATURE DESTINATAIRE</Text>
                            <Text style={{ fontSize: 7, color: '#64748b' }}>Date & Heure de livraison</Text>
                            <View style={styles.signatureBox} />
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Ce document atteste de la prise en charge de la marchandise par le transporteur.
                    Généré par FlexiFlotte le {format(new Date(), 'dd/MM/yyyy HH:mm')}
                </Text>
            </Page>
        </Document>
    );
};
