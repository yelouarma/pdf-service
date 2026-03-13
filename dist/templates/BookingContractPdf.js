"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingContractPdf = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const renderer_1 = require("@react-pdf/renderer");
const ParameterPdfText_1 = require("./ParameterPdfText");
const date_fns_1 = require("date-fns");
const styles = renderer_1.StyleSheet.create({
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
        pageBreakInside: 'avoid',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        minHeight: 20,
        alignItems: 'center',
        pageBreakInside: 'avoid',
    },
    tableCol: {
        flex: 1,
        padding: 4,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    tableColLeft: {
        flex: 1,
        padding: 4,
        textAlign: 'left',
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    // Summary Box
    summaryBox: {
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    totalLabel: {
        fontWeight: 'bold',
        color: '#475569',
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#1e3a8a',
        fontSize: 11,
    },
    // Terms section
    termsBox: {
        marginTop: 15,
        padding: 8,
        backgroundColor: '#fffef3',
        borderWidth: 1,
        borderColor: '#fef08a',
        borderRadius: 4,
    },
    termsTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#854d0e',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    termsText: {
        fontSize: 7.5,
        color: '#71717a',
        textAlign: 'justify',
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
const LabelValue = ({ label, value, dotted = false }) => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.row, children: [(0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.label, children: [label, " :"] }), dotted ? ((0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.dottedValue, children: value && (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: value }) })) : ((0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.value, children: value || '—' }))] }));
const BookingContractPdf = ({ booking, offerSnapshot, rentalDays, basePrice, optionsTotal, discount, total, paidEquipments, paidOptions, optionAmount, numberLocale, parameterLabels, t, type = 'CONTRACT' }) => {
    const reference = booking.entityReference || booking.id;
    const client = (booking.client || {});
    const provider = (booking.provider || {});
    const mainResource = booking.resources?.[0];
    // Assignments
    const vehicleAssigned = booking.assignments?.find(a => a.resourceType === 'VEHICLE');
    const driverAssigned = booking.assignments?.find(a => a.resourceType === 'DRIVER');
    const formatPrice = (amount) => {
        const parts = amount.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return parts[0] + (parts[1] !== '00' ? ',' + parts[1] : '') + ' DH';
    };
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        try {
            return (0, date_fns_1.format)(new Date(dateStr), 'dd/MM/yyyy');
        }
        catch (e) {
            return '';
        }
    };
    const renderContract = () => ((0, jsx_runtime_1.jsxs)(renderer_1.Page, { size: "A4", style: styles.page, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.header, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.titleContainer, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.mainTitle, children: t('providerRequests.contractTitle').toUpperCase() }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { height: 10 } }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.referenceLabel, children: [t('providerRequests.reference'), " : ", reference] })] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { textAlign: 'right' }, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontWeight: 'bold' }, children: formatDate(new Date().toISOString()) }) })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.grid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.providerSection') }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Soci\u00E9t\u00E9", value: provider.name || '—' }), provider.moralIce && (0, jsx_runtime_1.jsx)(LabelValue, { label: "ICE", value: provider.moralIce }), provider.moralRc && (0, jsx_runtime_1.jsx)(LabelValue, { label: "RC", value: provider.moralRc }), provider.moralTaxId && (0, jsx_runtime_1.jsx)(LabelValue, { label: "I.F", value: provider.moralTaxId }), provider.moralPatent && (0, jsx_runtime_1.jsx)(LabelValue, { label: "Patente", value: provider.moralPatent }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Email", value: provider.contactEmail || provider.physicalEmail || provider.legalRepresentative?.email || provider.contactInfo?.email }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "T\u00E9l\u00E9phone", value: provider.contactPhone || provider.physicalPhone || provider.legalRepresentative?.phone || provider.contactInfo?.phone }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Adresse", value: provider.address?.street || (provider.legalPersonTypeKey === 'MORAL' ? provider.moralHeadquarters : null) || provider.physicalResidencePlace }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Ville", value: provider.address?.city || provider.physicalResidencePlace })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.clientSection') }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Nom/Raison", value: client.legalPersonTypeKey === 'PHYSICAL' ? `${client.physicalFirstName} ${client.physicalLastName}` : client.name }), client.legalPersonTypeKey !== 'PHYSICAL' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [client.moralIce && (0, jsx_runtime_1.jsx)(LabelValue, { label: "ICE", value: client.moralIce }), client.moralRc && (0, jsx_runtime_1.jsx)(LabelValue, { label: "RC", value: client.moralRc }), client.moralTaxId && (0, jsx_runtime_1.jsx)(LabelValue, { label: "I.F", value: client.moralTaxId }), client.moralPatent && (0, jsx_runtime_1.jsx)(LabelValue, { label: "Patente", value: client.moralPatent })] })), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Email", value: client.contactEmail || client.physicalEmail || client.legalRepresentative?.email || client.contactInfo?.email }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "T\u00E9l\u00E9phone", value: client.contactPhone || client.physicalPhone || client.legalRepresentative?.phone || client.contactInfo?.phone }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Adresse", value: client.address?.street || (client.legalPersonTypeKey === 'MORAL' ? client.moralHeadquarters : null) || client.physicalResidencePlace }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Ville", value: client.address?.city || client.physicalResidencePlace })] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.offerSection') }), (offerSnapshot?.offers || booking.resources || []).map((item, idx) => {
                        const isSnapshot = !!item.vehicleType;
                        const type = isSnapshot ? item.vehicleType : item.type;
                        // Try to find the quantity from booking.resources if we are looking at a snapshot offer
                        let qty = 1;
                        if (isSnapshot && booking.resources) {
                            // Match by vehicle type or name if possible
                            const matchingResource = booking.resources.find((r) => r.type === item.vehicleType || r.resourceName === item.name);
                            if (matchingResource) {
                                qty = matchingResource.quantity;
                            }
                        }
                        else if (!isSnapshot) {
                            qty = item.quantity;
                        }
                        const price = isSnapshot ? (item.pricePerDay || item.basePrice || 0) : item.dailyRate;
                        const franchise = item.franchise || booking.franchise;
                        const securityDeposit = item.securityDeposit != null ? item.securityDeposit : booking.securityDeposit;
                        const includedKm = item.includedKm != null ? item.includedKm : booking.includedKm;
                        return ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: {
                                marginBottom: idx < (offerSnapshot?.offers?.length || booking.resources?.length || 0) - 1 ? 15 : 0,
                                borderBottomWidth: idx < (offerSnapshot?.offers?.length || booking.resources?.length || 0) - 1 ? 0.5 : 0,
                                borderBottomColor: '#e2e8f0',
                                paddingBottom: 10
                            }, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.row, { marginBottom: 8 }], children: (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: { fontSize: 11, fontWeight: 'bold', color: '#1e3a8a' }, children: [item.name || `Offre #${idx + 1}`, " - ", qty, " v\u00E9hicule", qty > 1 ? 's' : ''] }) }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.grid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(LabelValue, { label: "P\u00E9riode", value: `${formatDate(booking.startDate)} au ${formatDate(booking.endDate)}` }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Type V\u00E9hicule", value: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_TYPES", value: type, parameterReference: item.typeRef, labels: parameterLabels?.VEHICLE_TYPES }) }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "KM Inclus", value: includedKm != null ? `${includedKm} KM` : 'Illimité' })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(LabelValue, { label: "Tarif Journalier", value: formatPrice(Number(price)) }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Caution (D\u00E9p\u00F4t)", value: formatPrice(Number(securityDeposit || 0)) }), (0, jsx_runtime_1.jsx)(LabelValue, { label: "Franchise", value: franchise ? `${franchise.percentage || 0}% (min. ${formatPrice(franchise.minAmount || 0)})` : '—' })] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { marginTop: 8, flexDirection: 'row', gap: 20 }, children: [(item.equipments?.some((e) => e.isIncluded) || item.options?.some((o) => o.isIncluded)) && ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 3 }, children: "\u00C9quipements & Services Inclus :" }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 }, children: [item.equipments?.filter((e) => e.isIncluded).map((e) => ((0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontSize: 7, backgroundColor: '#f0f9ff', color: '#0369a1', padding: '2 5', borderRadius: 3, borderWidth: 0.5, borderColor: '#bae6fd' }, children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_FEATURES", value: e.code, parameterReference: e.codeRef, labels: parameterLabels?.VEHICLE_FEATURES }) }, e.code))), item.options?.filter((o) => o.isIncluded).map((o) => ((0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontSize: 7, backgroundColor: '#f0f9ff', color: '#0369a1', padding: '2 5', borderRadius: 3, borderWidth: 0.5, borderColor: '#bae6fd' }, children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_SERVICES", value: o.code, parameterReference: o.codeRef, labels: parameterLabels?.VEHICLE_SERVICES }) }, o.code)))] })] })), (item.equipments?.some((e) => !e.isIncluded && (booking.selectedEquipment || []).includes(e.code)) ||
                                            item.options?.some((o) => !o.isIncluded && (booking.selectedOptions || []).includes(o.code))) && ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 3 }, children: "Options Suppl\u00E9mentaires Demand\u00E9es :" }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 }, children: [item.equipments?.filter((e) => !e.isIncluded && (booking.selectedEquipment || []).includes(e.code)).map((e) => ((0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: { fontSize: 7, backgroundColor: '#f0fdf4', color: '#15803d', padding: '2 5', borderRadius: 3, borderWidth: 0.5, borderColor: '#bbf7d0' }, children: [(0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_FEATURES", value: e.code, parameterReference: e.codeRef, labels: parameterLabels?.VEHICLE_FEATURES }), e.priceModifier ? ` (+${formatPrice(optionAmount(e.priceModifier, e.periodicity))})` : ''] }, e.code))), item.options?.filter((o) => !o.isIncluded && (booking.selectedOptions || []).includes(o.code)).map((o) => ((0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: { fontSize: 7, backgroundColor: '#f0fdf4', color: '#15803d', padding: '2 5', borderRadius: 3, borderWidth: 0.5, borderColor: '#bbf7d0' }, children: [(0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_SERVICES", value: o.code, parameterReference: o.codeRef, labels: parameterLabels?.VEHICLE_SERVICES }), o.priceModifier ? ` (+${formatPrice(optionAmount(o.priceModifier, o.periodicity))})` : ''] }, o.code)))] })] }))] }), item.penalties && item.penalties.length > 0 && ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 3 }, children: "P\u00E9nalit\u00E9s Sp\u00E9cifiques \u00E0 cette Offre :" }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: [styles.table, { marginTop: 0 }], children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: [styles.tableHeaderRow, { backgroundColor: '#fff7ed', borderBottomColor: '#ffedd5' }], children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableColLeft, { flex: 2, fontSize: 7 }], children: "Manquement" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { fontSize: 7 }], children: "Montant" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableColLeft, { flex: 3, fontSize: 7 }], children: "Conditions" })] }), item.penalties.map((p, pIdx) => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: [styles.tableRow, { minHeight: 15 }], children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableColLeft, { flex: 2, fontSize: 7 }], children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "PENALTY_TYPES", value: p.type, parameterReference: p.typeRef, labels: parameterLabels?.PENALTY_TYPES }) }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: [styles.tableCol, { fontSize: 7 }], children: [p.amount != null ? `${formatPrice(p.amount)} ` : '', (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "PENALTY_BASIS", value: p.basis, parameterReference: p.basisRef, labels: parameterLabels?.PENALTY_BASIS })] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableColLeft, { flex: 3, fontSize: 6.5, color: '#64748b' }], children: p.conditions })] }, pIdx)))] })] }))] }, idx));
                    })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.assignmentSection') }), booking.assignments && booking.assignments.length > 0 ? ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.table, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableHeaderRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { textAlign: 'left', flex: 2 }], children: "Ressource" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol, children: "Type" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 2 }], children: "P\u00E9riode" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol, children: "Km D\u00E9part" })] }), booking.assignments.map((a, i) => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { textAlign: 'left', flex: 2 }], children: a.resourceName || a.resourceId }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol, children: a.resourceType }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { fontSize: 8 }], children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "RESOURCE_ASSIGNMENT_STATUS", value: a.status, parameterReference: a.statusRef, labels: parameterLabels?.RESOURCE_ASSIGNMENT_STATUS }) }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: [styles.tableCol, { flex: 2, fontSize: 8 }], children: [formatDate(a.startDate), " - ", formatDate(a.endDate)] })] }, i)))] })) : ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.grid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(LabelValue, { label: t('providerRequests.contractTemplate.vehicleAssigned'), value: "\u2014", dotted: true }), (0, jsx_runtime_1.jsx)(LabelValue, { label: t('providerRequests.contractTemplate.driverAssigned'), value: "\u2014", dotted: true })] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.column, children: (0, jsx_runtime_1.jsx)(LabelValue, { label: t('providerRequests.contractTemplate.startMileage'), value: "", dotted: true }) })] }))] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.grid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.includedEquipment') }), booking.equipmentSupplements?.filter(e => e.isIncluded).map(e => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.equipmentItem, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.bullet }), (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_FEATURES", value: e.code, parameterReference: e.codeRef, fallback: e.name })] }, e.code))), booking.optionSupplements?.filter(o => o.isIncluded).map(o => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.equipmentItem, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.bullet }), (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_SERVICES", value: o.code, parameterReference: o.codeRef, fallback: o.name })] }, o.code)))] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.optionalEquipment') }), paidEquipments.map(e => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.equipmentItem, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.bullet, { backgroundColor: '#10b981' }] }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [(0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_FEATURES", value: e.code, parameterReference: e.codeRef, fallback: e.name }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [" (", formatPrice(optionAmount(Number(e.priceModifier) || 0, e.periodicity)), ")"] })] })] }, e.code))), paidOptions.map(o => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.equipmentItem, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.bullet, { backgroundColor: '#10b981' }] }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [(0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_SERVICES", value: o.code, parameterReference: o.codeRef, fallback: o.name }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [" (", formatPrice(optionAmount(Number(o.priceModifier) || 0, o.periodicity)), ")"] })] })] }, o.code)))] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.contractTemplate.vehicleConditionSection') }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.table, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableHeaderRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 2 }], children: "D\u00E9signation" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol, children: "\u00C9tat D\u00E9part" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol, children: "\u00C9tat Retour" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 2 }], children: "Observations" })] }), ['Carrosserie', 'Pneus', 'Intérieur', 'Niveau Carburant', 'Accessoires'].map(item => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 2, textAlign: 'left' }], children: item }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 2 }] })] }, item)))] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: "P\u00C9NALIT\u00C9S & CONDITIONS SP\u00C9CIFIQUES" }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.table, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableHeaderRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 2 }], children: "Type de manquement" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCol, children: "Montant / Base" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 3 }], children: "Observations / Conditions" })] }), booking.penalties && booking.penalties.length > 0 ? (booking.penalties.map((p, i) => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { flex: 2, textAlign: 'left' }], children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "PENALTY_TYPES", value: p.type, parameterReference: p.typeRef, labels: parameterLabels?.PENALTY_TYPES }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { flexWrap: 'nowrap' }], children: (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [p.amount != null ? `${formatPrice(p.amount)} ` : '', (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "PENALTY_BASIS", value: p.basis, parameterReference: p.basisRef, labels: parameterLabels?.PENALTY_BASIS })] }) }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 3, textAlign: 'left', fontSize: 7 }], children: p.conditions })] }, i)))) : ((0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.tableRow, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.tableCol, { flex: 6, textAlign: 'center', fontStyle: 'italic', color: '#94a3b8' }], children: "Aucune p\u00E9nalit\u00E9 sp\u00E9cifique renseign\u00E9e" }) }))] }), booking.franchise?.conditions && ((0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: { fontSize: 7, marginTop: 5, color: '#475569' }, children: ["* Conditions franchise : ", booking.franchise.conditions] }))] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.summaryBox, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.termsTitle, { color: '#1e3a8a', marginBottom: 8 }], children: "R\u00E9capitulatif de la R\u00E9servation" }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.totalRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.totalLabel, children: "Total Location (V\u00E9hicules) :" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.totalValue, children: formatPrice(basePrice) })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.totalRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.totalLabel, children: "Total Options & Services :" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.totalValue, children: formatPrice(optionsTotal) })] }), discount > 0 && ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.totalRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.totalLabel, { color: '#10b981' }], children: "Remise Appliqu\u00E9e :" }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: [styles.totalValue, { color: '#10b981' }], children: ["-", formatPrice(discount)] })] })), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: [styles.totalRow, { borderTopWidth: 1, borderTopColor: '#cbd5e1', marginTop: 5, paddingTop: 5 }], children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.totalLabel, { fontSize: 12, color: '#1e3a8a' }], children: "TOTAL NET \u00C0 PAYER (TTC) :" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: [styles.totalValue, { fontSize: 14, color: '#2563eb' }], children: formatPrice(total) })] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.termsBox, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.termsTitle, children: "Conditions & R\u00E9solution des Litiges" }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.termsText, children: ["1. Le pr\u00E9sent document constitue la preuve contractuelle des services r\u00E9serv\u00E9s et des tarifs accept\u00E9s. En cas de litige, les d\u00E9tails list\u00E9s ci-dessus (v\u00E9hicules, \u00E9quipements inclus, options demand\u00E9es et p\u00E9nalit\u00E9s) feront foi.", "\n", "2. Le locataire s'engage \u00E0 restituer les v\u00E9hicules dans l'\u00E9tat constat\u00E9 au d\u00E9part. Toute d\u00E9gradation non signal\u00E9e pourra entra\u00EEner l'application des p\u00E9nalit\u00E9s d\u00E9finies.", "\n", "3. La franchise et la caution sont d\u00E9bit\u00E9es ou pr\u00E9-autoris\u00E9es selon les conditions sp\u00E9cifiques de chaque offre. En cas d'accident responsable, le montant de la franchise sera d\u00FB.", "\n", "4. Tout retard de restitution entra\u00EEnera les p\u00E9nalit\u00E9s pr\u00E9vues au contrat."] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.signatureGrid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.signatureTitle, children: t('providerRequests.contractTemplate.clientSignature') }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.signatureBox })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.signatureTitle, children: t('providerRequests.contractTemplate.providerSignature') }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.signatureBox })] })] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.footer, children: t('providerRequests.termsIntro') })] }));
    const renderInvoice = () => ((0, jsx_runtime_1.jsxs)(renderer_1.Page, { size: "A4", style: styles.page, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.header, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.titleContainer, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.mainTitle, children: t('providerRequests.invoiceTitle').toUpperCase() }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { height: 10 } }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.referenceLabel, children: ["Facture N\u00B0 : INV-", reference] })] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { textAlign: 'right' }, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontWeight: 'bold' }, children: formatDate(new Date().toISOString()) }) })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.grid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.providerDetails') }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontWeight: 'bold' }, children: provider.name || '—' }), provider.moralIce && (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: ["ICE: ", provider.moralIce] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: provider.contactEmail || provider.physicalEmail || provider.legalRepresentative?.email || provider.contactInfo?.email || '—' }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: provider.contactPhone || provider.physicalPhone || provider.legalRepresentative?.phone || provider.contactInfo?.phone || '—' }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: provider.address?.street || (provider.legalPersonTypeKey === 'MORAL' ? provider.moralHeadquarters : null) || provider.physicalResidencePlace || '—' }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [provider.address?.postalCode, " ", provider.address?.city || '—'] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionHeader, children: t('providerRequests.clientDetails') }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontWeight: 'bold' }, children: client.legalPersonTypeKey === 'PHYSICAL' ? `${client.physicalFirstName} ${client.physicalLastName}` : client.name }), client.legalPersonTypeKey !== 'PHYSICAL' && client.moralIce && (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: ["ICE: ", client.moralIce] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: client.contactEmail || client.physicalEmail || client.legalRepresentative?.email || client.contactInfo?.email || '—' }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: client.contactPhone || client.physicalPhone || client.legalRepresentative?.phone || client.contactInfo?.phone || '—' }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: client.address?.street || (client.legalPersonTypeKey === 'MORAL' ? client.moralHeadquarters : null) || client.physicalResidencePlace || '—' }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: [client.address?.postalCode, " ", client.address?.city || '—'] })] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { marginTop: 30 }, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#1e3a8a', paddingBottom: 5, fontWeight: 'bold' }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 3 }, children: "Description" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'center' }, children: "Quantit\u00E9" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'right' }, children: "Montant HT" })] }), (offerSnapshot?.offers || booking.resources || []).map((item, idx) => {
                        const isSnapshot = !!item.vehicleType;
                        const type = isSnapshot ? item.vehicleType : item.type;
                        let qty = 1;
                        if (isSnapshot && booking.resources) {
                            const matchingResource = booking.resources.find((r) => r.type === item.vehicleType || r.resourceName === item.name);
                            if (matchingResource) {
                                qty = matchingResource.quantity;
                            }
                        }
                        else if (!isSnapshot) {
                            qty = item.quantity;
                        }
                        const price = isSnapshot ? (item.pricePerDay || item.basePrice || 0) : item.dailyRate;
                        const name = item.name || `Offre #${idx + 1}`;
                        return ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 3 }, children: [(0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: { fontWeight: 'bold' }, children: [name, " (", rentalDays, "j)"] }), (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_TYPES", value: type, parameterReference: item.typeRef, labels: parameterLabels?.VEHICLE_TYPES })] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'center' }, children: qty }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'right' }, children: formatPrice(Number(price) * qty * rentalDays) })] }, idx));
                    }), paidEquipments.map(e => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: { flex: 3 }, children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_FEATURES", value: e.code, parameterReference: e.codeRef, fallback: e.name, labels: parameterLabels?.VEHICLE_FEATURES }) }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'center' }, children: "1" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'right' }, children: formatPrice(optionAmount(Number(e.priceModifier) || 0, e.periodicity)) })] }, e.code))), paidOptions.map(o => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: { flex: 3 }, children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "VEHICLE_SERVICES", value: o.code, parameterReference: o.codeRef, fallback: o.name, labels: parameterLabels?.VEHICLE_SERVICES }) }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'center' }, children: "1" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { flex: 1, textAlign: 'right' }, children: formatPrice(optionAmount(Number(o.priceModifier) || 0, o.periodicity)) })] }, o.code)))] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { marginTop: 20, alignItems: 'flex-end' }, children: (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { width: 200 }, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { children: "Sous-total HT :" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: formatPrice(basePrice + optionsTotal) })] }), discount > 0 && ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, color: '#10b981' }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { children: "Remise :" }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { children: ["-", formatPrice(discount)] })] })), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1e3a8a', marginTop: 5, fontWeight: 'bold', fontSize: 12 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { children: "TOTAL \u00C0 PAYER :" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: formatPrice(total) })] })] }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { marginTop: 50 }, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontStyle: 'italic', color: '#64748b' }, children: "Merci de votre confiance." }) })] }));
    return ((0, jsx_runtime_1.jsx)(renderer_1.Document, { children: type === 'CONTRACT' ? renderContract() : renderInvoice() }));
};
exports.BookingContractPdf = BookingContractPdf;
