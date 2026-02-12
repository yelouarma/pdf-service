"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const renderer_1 = __importDefault(require("@react-pdf/renderer"));
const registry_1 = require("./registry");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- Routes ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'pdf-service' });
});
app.get('/generate', async (req, res) => {
    try {
        const { bookingId, lang } = req.query;
        const type = req.query.type || 'CONTRACT'; // Default type
        const token = req.headers.authorization; // Retrieve Auth Token from Forwarded Request
        const language = lang || 'fr'; // Language for labels/descriptions in PDF (e.g. fr, en, ar)
        if (!bookingId) {
            return res.status(400).json({ error: 'Missing bookingId parameter' });
        }
        console.log(`[PDF Service] Request for ${type} (ID: ${bookingId}, lang: ${language})`);
        // 1. Get Registry Configuration
        const config = (0, registry_1.getDocumentConfig)(type);
        if (!config) {
            return res.status(400).json({ error: `Unsupported document type: ${type}` });
        }
        // 2. Fetch Data using the configuration
        // We pass the auth token and language so the fetcher/template can use the right locale for labels
        const data = await config.fetchData(bookingId, { token, type, language });
        // 3. Render PDF
        // Dynamically instantiate the template component from config
        const Template = config.template;
        const stream = await renderer_1.default.renderToStream((0, jsx_runtime_1.jsx)(Template, { ...data }));
        // 4. Send Response
        res.setHeader('Content-Type', 'application/pdf');
        // Filename can be dynamic based on data
        const filename = config.getFilename ? config.getFilename(data) : `${type}_${bookingId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        // Headers for Iframe/CORS
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', "frame-ancestors *");
        stream.pipe(res);
    }
    catch (error) {
        console.error('[PDF Service] Generation Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'PDF Generation Failed', details: msg });
    }
});
app.listen(PORT, () => {
    console.log(`🖨️ PDF Service running on http://localhost:${PORT}`);
    console.log(`   - Connected to Backend: ${process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1'}`);
});
