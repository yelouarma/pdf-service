"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterPdfText = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const renderer_1 = require("@react-pdf/renderer");
/**
 * Server-side compatible ParameterPdfText.
 * Relies explicitly on provided parameterReference, labels map or fallback.
 */
const ParameterPdfText = ({ domain, value, parameterReference, style, fallback, labels, language }) => {
    // 1. If language requested and parameterReference has labelsByLanguage, use it first
    if (language && parameterReference?.labelsByLanguage?.[language]) {
        return (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: style, children: parameterReference.labelsByLanguage[language] });
    }
    // 2. Use localizedLabel from parameterReference if available
    if (parameterReference?.localizedLabel) {
        return (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: style, children: parameterReference.localizedLabel });
    }
    const functionalId = value || parameterReference?.functionalId;
    if (!functionalId) {
        return (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: style, children: fallback || '—' });
    }
    // 3. Try to use provided labels map
    if (labels && labels[functionalId]) {
        return (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: style, children: labels[functionalId] });
    }
    // 4. Fallback to fallback string or functionalId
    return (0, jsx_runtime_1.jsx)(renderer_1.Text, { style: style, children: fallback || functionalId });
};
exports.ParameterPdfText = ParameterPdfText;
