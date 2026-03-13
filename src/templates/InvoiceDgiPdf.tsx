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

interface InvoiceLineData {
    lineNumber: number;
    description: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    vatRate: number;
    totalHt: number;
    totalVat: number;
    totalTtc: number;
}

export interface InvoiceDgiProps {
    invoiceNumber: string;
    type: 'INVOICE' | 'CREDIT_NOTE';
    status: string;
    issuer: PartySnapshot;
    recipient: PartySnapshot;
    lines: InvoiceLineData[];
    totalHt: number;
    totalVat: number;
    totalTtc: number;
    discountAmount?: number;
    currency: string;
    vatRate: number;
    taxRegime: string;
    taxExemptionReason?: string;
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
    colNum: { width: 25, textAlign: 'center' },
    colDesc: { flex: 3 },
    colQty: { width: 35, textAlign: 'center' },
    colUnit: { width: 40, textAlign: 'center' },
    colPu: { width: 70, textAlign: 'right' },
    colVat: { width: 40, textAlign: 'center' },
    colTotal: { width: 75, textAlign: 'right' },
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

const getTaxMention = (taxRegime: string, vatRate: number, exemptionReason?: string): string => {
    switch (taxRegime) {
        case 'STANDARD':
            return `TVA ${formatPercent(vatRate)} - Transport de marchandises`;
        case 'AUTO_ENTREPRENEUR':
            return `Exonere de TVA - Auto-entrepreneur (Art. 89-I-12 du CGI)`;
        case 'EXEMPT':
            return `Exonere de TVA${exemptionReason ? ' - ' + exemptionReason : ''}`;
        case 'EXPORT':
            return `Exportation - TVA 0% (Art. 92 du CGI)`;
        default:
            return `TVA ${formatPercent(vatRate)}`;
    }
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
        {/* DGI fiscal identifiers */}
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

export const InvoiceDgiPdf = (props: InvoiceDgiProps) => {
    const {
        invoiceNumber,
        type,
        issuer,
        recipient,
        lines,
        totalHt,
        totalVat,
        totalTtc,
        discountAmount,
        currency,
        vatRate,
        taxRegime,
        taxExemptionReason,
        issueDate,
        dueDate,
        paymentMethod,
    } = props;

    const docTitle = type === 'CREDIT_NOTE' ? 'AVOIR' : 'FACTURE';
    const docSubtitle = type === 'CREDIT_NOTE' ? "Note de credit" : 'Document comptable';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.docTitle}>{docTitle}</Text>
                        <Text style={styles.docSubtitle}>{docSubtitle}</Text>
                    </View>
                    <View>
                        <Text style={styles.invoiceNumberLabel}>{docTitle} N.</Text>
                        <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
                        <Text style={styles.dateText}>Date : {formatDate(issueDate)}</Text>
                        {dueDate && (
                            <Text style={styles.dateText}>Echeance : {formatDate(dueDate)}</Text>
                        )}
                    </View>
                </View>

                {/* Parties */}
                <View style={styles.partiesGrid}>
                    <PartyBlock party={issuer} title="EMETTEUR" />
                    <PartyBlock party={recipient} title="DESTINATAIRE" />
                </View>

                {/* Lines Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colNum]}>N.</Text>
                        <Text style={[styles.tableHeaderText, styles.colDesc]}>DESCRIPTION</Text>
                        <Text style={[styles.tableHeaderText, styles.colQty]}>QTE</Text>
                        <Text style={[styles.tableHeaderText, styles.colUnit]}>UNITE</Text>
                        <Text style={[styles.tableHeaderText, styles.colPu]}>P.U. HT</Text>
                        <Text style={[styles.tableHeaderText, styles.colVat]}>TVA</Text>
                        <Text style={[styles.tableHeaderText, styles.colTotal]}>TOTAL HT</Text>
                    </View>

                    {/* Table Rows */}
                    {lines.map((line, idx) => (
                        <View style={styles.tableRow} key={idx}>
                            <Text style={styles.colNum}>{line.lineNumber}</Text>
                            <Text style={styles.colDesc}>{line.description}</Text>
                            <Text style={styles.colQty}>{line.quantity}</Text>
                            <Text style={styles.colUnit}>{line.unit || '—'}</Text>
                            <Text style={styles.colPu}>{formatPrice(line.unitPrice, currency)}</Text>
                            <Text style={styles.colVat}>{formatPercent(line.vatRate)}</Text>
                            <Text style={[styles.colTotal, { fontWeight: 'bold' }]}>
                                {formatPrice(line.totalHt, currency)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total HT</Text>
                            <Text style={styles.totalValue}>{formatPrice(totalHt, currency)}</Text>
                        </View>
                        {discountAmount != null && discountAmount > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Remise</Text>
                                <Text style={styles.totalValue}>- {formatPrice(discountAmount, currency)}</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TVA ({formatPercent(vatRate)})</Text>
                            <Text style={styles.totalValue}>{formatPrice(totalVat, currency)}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>TOTAL TTC</Text>
                            <Text style={styles.grandTotalValue}>{formatPrice(totalTtc, currency)}</Text>
                        </View>
                    </View>
                </View>

                {/* Tax Regime Mention (DGI) */}
                <View style={styles.taxMention}>
                    <Text style={styles.taxMentionText}>
                        Regime fiscal : {getTaxMention(taxRegime, vatRate, taxExemptionReason)}
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
