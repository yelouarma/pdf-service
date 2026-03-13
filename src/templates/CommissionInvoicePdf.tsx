import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// --- Types ---

interface PartySnapshot {
    name: string;
    ice?: string;
    rc?: string;
    taxId?: string;
    patent?: string;
    address?: string;
    email?: string;
    phone?: string;
    legalForm?: string;
}

export interface CommissionInvoiceProps {
    invoiceNumber: string;
    commissionRate: number;
    transporterInvoiceNumber: string;
    issuer: PartySnapshot;  // FlexiFlotte platform
    recipient: PartySnapshot;  // Transporter
    commissionHt: number;
    commissionVat: number;
    commissionTtc: number;
    currency: string;
    vatRate: number;
    issueDate: string;
    dueDate?: string;
    paymentMethod?: string;
}

// --- Styles ---

const colors = {
    slate900: '#0f172a',
    slate700: '#334155',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate200: '#e2e8f0',
    slate100: '#f1f5f9',
    slate50: '#f8fafc',
    blue700: '#1d4ed8',
    blue600: '#2563eb',
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: 'NotoSans',
        lineHeight: 1.5,
        color: colors.slate700,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        borderBottomWidth: 2,
        borderBottomColor: colors.slate200,
        paddingBottom: 16,
    },
    docTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.slate900,
    },
    docSubtitle: {
        fontSize: 10,
        color: colors.slate500,
        marginTop: 2,
    },
    invoiceNumberLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'right',
        color: colors.slate500,
        textTransform: 'uppercase',
    },
    invoiceNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        color: colors.slate900,
        marginTop: 2,
    },
    dateText: {
        fontSize: 9,
        textAlign: 'right',
        color: colors.slate500,
        marginTop: 2,
    },
    // Parties
    partiesGrid: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 24,
    },
    partyBlock: {
        flex: 1,
        padding: 12,
        backgroundColor: colors.slate50,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.slate200,
    },
    partyTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.slate500,
        textTransform: 'uppercase',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate200,
        paddingBottom: 4,
    },
    partyName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.slate900,
        marginBottom: 4,
    },
    partyField: {
        flexDirection: 'row',
        marginBottom: 1,
    },
    partyFieldLabel: {
        width: 55,
        fontSize: 8,
        color: colors.slate500,
    },
    partyFieldValue: {
        flex: 1,
        fontSize: 8,
        color: colors.slate900,
    },
    // Commission Info Box
    commissionInfo: {
        marginTop: 16,
        marginBottom: 24,
        padding: 12,
        backgroundColor: colors.slate50,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.slate200,
    },
    commissionInfoTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.slate500,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    commissionInfoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    commissionInfoLabel: {
        width: 200,
        fontSize: 9,
        color: colors.slate700,
    },
    commissionInfoValue: {
        flex: 1,
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.slate900,
    },
    // Table
    table: {
        marginTop: 16,
        borderWidth: 1,
        borderColor: colors.slate200,
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.slate50,
        borderBottomWidth: 1,
        borderBottomColor: colors.slate200,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableHeaderText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.slate500,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.slate100,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    colDesc: { flex: 3 },
    colRate: { width: 60, textAlign: 'center' },
    colAmount: { width: 100, textAlign: 'right' },
    // Totals
    totalsSection: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: 240,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    totalLabel: {
        fontSize: 9,
        color: colors.slate500,
    },
    totalValue: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.slate900,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderTopWidth: 2,
        borderTopColor: colors.slate200,
        marginTop: 4,
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.slate900,
    },
    grandTotalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.blue600,
    },
    // Tax mention
    taxMention: {
        marginTop: 16,
        padding: 10,
        backgroundColor: colors.slate50,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.slate200,
    },
    taxMentionText: {
        fontSize: 8,
        color: colors.slate700,
        fontWeight: 'bold',
    },
    // Payment
    paymentSection: {
        marginTop: 16,
        padding: 10,
        backgroundColor: colors.slate50,
        borderRadius: 4,
    },
    paymentTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.slate500,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    paymentText: {
        fontSize: 8,
        color: colors.slate700,
        marginBottom: 1,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: colors.slate200,
        paddingTop: 8,
    },
    footerLine: {
        fontSize: 7,
        color: colors.slate400,
        textAlign: 'center',
        marginBottom: 1,
    },
});

// --- Helpers ---

const formatPrice = (amount: number, currency: string = 'MAD') => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency }).format(amount);
};

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const formatPercent = (rate: number): string => {
    return `${(rate * 100).toFixed(0)}%`;
};

// --- Sub-components ---

const PartyField = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <View style={styles.partyField}>
            <Text style={styles.partyFieldLabel}>{label} :</Text>
            <Text style={styles.partyFieldValue}>{value}</Text>
        </View>
    );
};

const PartyBlock = ({ party, title }: { party: PartySnapshot; title: string }) => (
    <View style={styles.partyBlock}>
        <Text style={styles.partyTitle}>{title}</Text>
        <Text style={styles.partyName}>{party.name}</Text>
        {party.legalForm && (
            <Text style={{ fontSize: 8, color: colors.slate500, marginBottom: 4 }}>{party.legalForm}</Text>
        )}
        <PartyField label="Adresse" value={party.address} />
        <PartyField label="Email" value={party.email} />
        <PartyField label="Tel" value={party.phone} />
        {(party.ice || party.rc || party.taxId || party.patent) && (
            <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: colors.slate200 }}>
                <PartyField label="ICE" value={party.ice} />
                <PartyField label="R.C." value={party.rc} />
                <PartyField label="I.F." value={party.taxId} />
                <PartyField label="Patente" value={party.patent} />
            </View>
        )}
    </View>
);

// --- Main Component ---

export const CommissionInvoicePdf = (props: CommissionInvoiceProps) => {
    const {
        invoiceNumber,
        commissionRate,
        transporterInvoiceNumber,
        issuer,
        recipient,
        commissionHt,
        commissionVat,
        commissionTtc,
        currency,
        vatRate,
        issueDate,
        dueDate,
        paymentMethod,
    } = props;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.docTitle}>FACTURE COMMISSION</Text>
                        <Text style={styles.docSubtitle}>Prestation de service - Commission sur transaction</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceNumberLabel}>Facture N.</Text>
                        <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
                        <Text style={styles.dateText}>Date : {formatDate(issueDate)}</Text>
                        {dueDate && (
                            <Text style={styles.dateText}>Echeance : {formatDate(dueDate)}</Text>
                        )}
                    </View>
                </View>

                {/* Parties */}
                <View style={styles.partiesGrid}>
                    <PartyBlock party={issuer} title="EMETTEUR (FLEXIFLOTTE)" />
                    <PartyBlock party={recipient} title="DESTINATAIRE (TRANSPORTEUR)" />
                </View>

                {/* Commission Details */}
                <View style={styles.commissionInfo}>
                    <Text style={styles.commissionInfoTitle}>DETAILS DE LA COMMISSION</Text>
                    <View style={styles.commissionInfoRow}>
                        <Text style={styles.commissionInfoLabel}>Taux de commission :</Text>
                        <Text style={styles.commissionInfoValue}>{formatPercent(commissionRate)}</Text>
                    </View>
                    <View style={styles.commissionInfoRow}>
                        <Text style={styles.commissionInfoLabel}>Reference facture transporteur :</Text>
                        <Text style={styles.commissionInfoValue}>{transporterInvoiceNumber}</Text>
                    </View>
                </View>

                {/* Commission Line Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colDesc]}>DESCRIPTION</Text>
                        <Text style={[styles.tableHeaderText, styles.colRate]}>TAUX</Text>
                        <Text style={[styles.tableHeaderText, styles.colAmount]}>MONTANT HT</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={styles.colDesc}>
                            Commission FlexiFlotte sur la transaction de transport
                        </Text>
                        <Text style={styles.colRate}>{formatPercent(commissionRate)}</Text>
                        <Text style={[styles.colAmount, { fontWeight: 'bold' }]}>
                            {formatPrice(commissionHt, currency)}
                        </Text>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Commission HT</Text>
                            <Text style={styles.totalValue}>{formatPrice(commissionHt, currency)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TVA ({formatPercent(vatRate)})</Text>
                            <Text style={styles.totalValue}>{formatPrice(commissionVat, currency)}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>TOTAL TTC</Text>
                            <Text style={styles.grandTotalValue}>{formatPrice(commissionTtc, currency)}</Text>
                        </View>
                    </View>
                </View>

                {/* Tax Regime Mention */}
                <View style={styles.taxMention}>
                    <Text style={styles.taxMentionText}>
                        TVA {formatPercent(vatRate)} - Prestation de service (commission sur transaction)
                    </Text>
                </View>

                {/* Payment Information */}
                <View style={styles.paymentSection}>
                    <Text style={styles.paymentTitle}>CONDITIONS DE PAIEMENT</Text>
                    {paymentMethod && (
                        <Text style={styles.paymentText}>Mode de paiement : {paymentMethod}</Text>
                    )}
                    {dueDate && (
                        <Text style={styles.paymentText}>Date d'echeance : {formatDate(dueDate)}</Text>
                    )}
                    {!paymentMethod && !dueDate && (
                        <Text style={styles.paymentText}>Paiement a reception de facture</Text>
                    )}
                    <Text style={[styles.paymentText, { marginTop: 4, fontSize: 7 }]}>
                        En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee
                        conformement a la loi 49-15 relative aux delais de paiement.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerLine}>
                        {issuer.name}
                        {issuer.legalForm ? ` - ${issuer.legalForm}` : ''}
                        {issuer.address ? ` - ${issuer.address}` : ''}
                    </Text>
                    <Text style={styles.footerLine}>
                        {issuer.ice ? `ICE: ${issuer.ice}` : ''}
                        {issuer.rc ? ` | RC: ${issuer.rc}` : ''}
                        {issuer.taxId ? ` | IF: ${issuer.taxId}` : ''}
                        {issuer.patent ? ` | Patente: ${issuer.patent}` : ''}
                    </Text>
                    {(issuer.email || issuer.phone) && (
                        <Text style={styles.footerLine}>
                            {issuer.email ? `Email: ${issuer.email}` : ''}
                            {issuer.email && issuer.phone ? ' | ' : ''}
                            {issuer.phone ? `Tel: ${issuer.phone}` : ''}
                        </Text>
                    )}
                </View>
            </Page>
        </Document>
    );
};
