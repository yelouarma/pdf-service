"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const renderer_1 = __importStar(require("@react-pdf/renderer"));
const registry_1 = require("./registry");
const authMiddleware_1 = require("./middleware/authMiddleware");
// Resolve paths to fonts
const FONT_DIR = path_1.default.join(process.cwd(), 'assets', 'fonts');
// Register fonts for Arabic support
renderer_1.Font.register({
    family: 'NotoSans',
    fonts: [
        { src: path_1.default.join(FONT_DIR, 'NotoSans-Regular.ttf') },
        { src: path_1.default.join(FONT_DIR, 'NotoSans-Bold.ttf'), fontWeight: 'bold' }
    ]
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Increased for handover SVG schemas
app.use(authMiddleware_1.requireInternalKey); // Global auth — skips /health automatically
// --- Routes ---
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'pdf-service' });
});
// --- Unified internal endpoint ---
// Backend sends ALL data in the body. PDF service is a pure renderer.
app.post('/internal/generate', async (req, res) => {
    try {
        const { type, lang, uploadUrl, ...data } = req.body;
        if (!type) {
            return res.status(400).json({ error: 'Missing "type" field in request body' });
        }
        const language = lang || 'fr';
        console.log(`[PDF Service] POST /internal/generate — type=${type}, lang=${language}, uploadUrl=${uploadUrl ? 'yes' : 'no'}`);
        // 1. Get Registry Configuration
        const config = (0, registry_1.getDocumentConfig)(type);
        if (!config) {
            return res.status(400).json({ error: `Unsupported document type: ${type}` });
        }
        // 2. Transform body → template props
        const props = config.prepareData(data, language);
        // 3. Render PDF
        const Template = config.template;
        const stream = await renderer_1.default.renderToStream((0, jsx_runtime_1.jsx)(Template, { ...props }));
        // 4a. If uploadUrl provided, collect bytes and upload to S3
        if (uploadUrl) {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(Buffer.from(chunk));
            }
            const pdfBuffer = Buffer.concat(chunks);
            await axios_1.default.put(uploadUrl, pdfBuffer, {
                headers: { 'Content-Type': 'application/pdf' },
                maxBodyLength: Infinity,
            });
            console.log(`[PDF Service] PDF uploaded to S3 (${pdfBuffer.length} bytes)`);
            return res.status(200).json({ success: true, size: pdfBuffer.length });
        }
        // 4b. Otherwise, stream PDF bytes back to caller
        res.setHeader('Content-Type', 'application/pdf');
        const filename = config.getFilename ? config.getFilename(props) : `${type}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        stream.pipe(res);
    }
    catch (error) {
        console.error('[PDF Service] POST /internal/generate Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'PDF Generation Failed', details: msg });
    }
});
// Export the app for Vercel
exports.default = app;
// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`PDF Service running on http://localhost:${PORT}`);
    });
}
