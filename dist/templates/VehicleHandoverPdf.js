"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleHandoverPdf = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const renderer_1 = require("@react-pdf/renderer");
const ParameterPdfText_1 = require("./ParameterPdfText");
const date_fns_1 = require("date-fns");
const styles = renderer_1.StyleSheet.create({
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
const VehicleSchemaPdf = ({ damages = [], schema }) => {
    const getZoneColor = (zoneId) => {
        const isDamaged = damages.some((d) => d.zoneId === zoneId);
        if (isDamaged)
            return '#fca5a5';
        return '#f3f4f6';
    };
    const getZoneStroke = (zoneId) => {
        const isDamaged = damages.some((d) => d.zoneId === zoneId);
        if (isDamaged)
            return '#dc2626';
        return '#9ca3af';
    };
    const zones = schema?.zones || [];
    const viewBox = schema?.viewBox || "0 0 300 400";
    if (!schema)
        return null;
    return ((0, jsx_runtime_1.jsxs)(renderer_1.Svg, { viewBox: viewBox, style: { width: 300, height: 400 }, children: [zones.map((zone) => ((0, jsx_runtime_1.jsx)(renderer_1.Path, { d: zone.path, fill: getZoneColor(zone.id), stroke: getZoneStroke(zone.id), strokeWidth: 1 }, zone.id))), (0, jsx_runtime_1.jsx)(renderer_1.Rect, { x: "20", y: "60", width: "20", height: "40", rx: "5", fill: "#1f2937" }), (0, jsx_runtime_1.jsx)(renderer_1.Rect, { x: "260", y: "60", width: "20", height: "40", rx: "5", fill: "#1f2937" }), (0, jsx_runtime_1.jsx)(renderer_1.Rect, { x: "25", y: "280", width: "20", height: "40", rx: "5", fill: "#1f2937" }), (0, jsx_runtime_1.jsx)(renderer_1.Rect, { x: "255", y: "280", width: "20", height: "40", rx: "5", fill: "#1f2937" }), damages.map((damage, index) => {
                const zone = zones.find((z) => z.id === damage.zoneId);
                if (!zone || zone.labelX === undefined)
                    return null;
                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsx)(renderer_1.Circle, { cx: zone.labelX, cy: zone.labelY, r: 8, fill: "#dc2626" }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { x: zone.labelX, y: zone.labelY + 3, style: {
                                fill: 'white',
                                fontSize: 8,
                                fontWeight: 'bold',
                                textAnchor: 'middle'
                            }, children: index + 1 })] }, index));
            })] }));
};
const VehicleHandoverPdf = ({ booking, handovers, vehicleAssignments, schemas, t, parameterLabels, language, }) => {
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '-';
        try {
            return (0, date_fns_1.format)(new Date(dateStr), 'dd/MM/yyyy HH:mm');
        }
        catch {
            return dateStr;
        }
    };
    // Flatten pages: show recorded handovers, or a draft page for each vehicle with no records
    const pages = [];
    // Sort assignments to have a consistent order
    const sortedAssignments = [...vehicleAssignments].sort((a, b) => (a.resourceName || '').localeCompare(b.resourceName || ''));
    sortedAssignments.forEach(assignment => {
        const vehicleHandovers = handovers.filter(h => h.vehicleId === assignment.resourceId);
        if (vehicleHandovers.length === 0) {
            // No history for this vehicle, add a draft page (delivery by default)
            pages.push({ type: 'DRAFT', vehicle: assignment });
        }
        else {
            // Show all records for this vehicle (Delivery then Return etc)
            // Sort them by date ascending
            const sortedHandovers = [...vehicleHandovers].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            sortedHandovers.forEach(h => {
                pages.push({ type: 'RECORD', vehicle: assignment, handover: h });
            });
        }
    });
    if (pages.length === 0) {
        return ((0, jsx_runtime_1.jsx)(renderer_1.Document, { children: (0, jsx_runtime_1.jsxs)(renderer_1.Page, { size: "A4", style: styles.page, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.header, children: (0, jsx_runtime_1.jsxs)(renderer_1.View, { children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.mainTitle, children: "\u00C9TATS DES LIEUX" }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.subTitle, children: ["Ref: ", booking.entityReference || booking.id] })] }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { fontSize: 14, color: '#64748b' }, children: "Aucun v\u00E9hicule n'est assign\u00E9 \u00E0 cette r\u00E9servation." }) })] }) }));
    }
    return ((0, jsx_runtime_1.jsx)(renderer_1.Document, { children: pages.map((item, index) => {
            const handover = item.handover;
            const vehicle = item.vehicle;
            const schema = handover?.schema || schemas[vehicle.vehicleType || ''] || null;
            const isDelivery = handover ? (handover.type === 'DELIVERY') : true; // Default to delivery if draft
            const isDraft = item.type === 'DRAFT' || (handover && handover.status === 'DRAFT');
            const baseTitle = isDelivery ? t('handover.checkout') : t('handover.checkin');
            const title = isDraft ? `${baseTitle} (${t('common.draft') || 'Brouillon'})` : baseTitle;
            return ((0, jsx_runtime_1.jsxs)(renderer_1.Page, { size: "A4", style: styles.page, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.header, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.mainTitle, children: title.toUpperCase() }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.subTitle, children: ["Ref: ", booking.entityReference || booking.id] })] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: formatDate(new Date().toISOString()) }) })] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.section, children: (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.grid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.row, children: [(0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.label, children: [t('handover.vehicle'), ":"] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.value, children: vehicle.resourceName || vehicle.resourceId || 'Véhicule' })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.row, children: [(0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.label, children: [t('handover.date'), ":"] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.value, children: formatDate(handover?.date) })] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.column, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.row, children: [(0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.label, children: [t('handover.odometer'), ":"] }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.value, children: [handover?.odometerValue ?? '____', " km"] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.row, children: [(0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: styles.label, children: [t('handover.fuelLevel'), ":"] }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.value, children: handover ? ((0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "FUEL_LEVEL", value: handover.fuelLevel, labels: parameterLabels?.FUEL_LEVEL })) : ((0, jsx_runtime_1.jsx)(renderer_1.Text, { children: "________________" })) })] })] })] }) }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionTitle, children: t('handover.vehicleCondition') }), schema ? ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.schemaContainer, children: [(0, jsx_runtime_1.jsx)(VehicleSchemaPdf, { damages: handover?.damages || [], schema: schema }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.legend, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.legendItem, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.legendBox, { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#9ca3af' }] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: t('handover.intact') })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.legendItem, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.legendBox, { backgroundColor: '#fca5a5', borderWidth: 1, borderColor: '#dc2626' }] }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: t('handover.damaged') })] })] })] })) : ((0, jsx_runtime_1.jsx)(renderer_1.View, { style: { height: 300, justifyContent: 'center', alignItems: 'center', border: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' }, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { color: '#94a3b8' }, children: "Sch\u00E9ma non disponible pour ce type de v\u00E9hicule" }) }))] }), handover?.damages && handover.damages.length > 0 ? ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionTitle, children: t('handover.damagesList') }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.table, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: [styles.tableRow, styles.tableHeader], children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '10%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCellHeader, children: "#" }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '30%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCellHeader, children: t('handover.zone') }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '25%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCellHeader, children: t('handover.damageType') }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '35%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCellHeader, children: t('handover.description') }) })] }), handover.damages.map((damage, i) => ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.tableRow, children: [(0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '10%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCell, children: i + 1 }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '30%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCell, children: t(`handover.zones.${damage.zoneId}`) }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '25%' }], children: (0, jsx_runtime_1.jsx)(ParameterPdfText_1.ParameterPdfText, { domain: "DAMAGE_TYPES", value: damage.damageType, parameterReference: damage.damageTypeRef, labels: parameterLabels?.DAMAGE_TYPES, language: language }) }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: [styles.tableCol, { width: '35%' }], children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.tableCell, children: damage.description || '-' }) })] }, i)))] })] })) : item.type === 'DRAFT' ? ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionTitle, children: t('handover.damagesList') }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: { border: 1, borderColor: '#e2e8f0', padding: 10, minHeight: 60 }, children: (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: { color: '#94a3b8' }, children: "Notes compl\u00E9mentaires: ____________________________________________________________________________________________________________________________________________________________________________" }) })] })) : null, handover?.comments ? ((0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.section, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.sectionTitle, children: t('handover.comments') }), (0, jsx_runtime_1.jsx)(renderer_1.Text, { children: handover.comments })] })) : item.type === 'DRAFT' ? null : null, (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: styles.signatureGrid, children: [(0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.signatureTitle, children: t('providerRequests.contractTemplate.clientSignature') }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.signatureBox })] }), (0, jsx_runtime_1.jsxs)(renderer_1.View, { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)(renderer_1.Text, { style: styles.signatureTitle, children: t('providerRequests.contractTemplate.providerSignature') }), (0, jsx_runtime_1.jsx)(renderer_1.View, { style: styles.signatureBox })] })] }), (0, jsx_runtime_1.jsxs)(renderer_1.Text, { style: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#9ca3af' }, children: [index + 1, " / ", pages.length] })] }, index));
        }) }));
};
exports.VehicleHandoverPdf = VehicleHandoverPdf;
