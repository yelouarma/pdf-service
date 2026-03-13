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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const renderer_1 = __importStar(require("@react-pdf/renderer"));
const registry_1 = require("./registry");
const InvoiceDgiPdf_1 = require("./templates/InvoiceDgiPdf");
// Resolve paths to fonts - relative to the CWD when running the service
// In dev (ts-node-dev), process.cwd() is project root.
// In prod (node dist/server.js), it might be different, but assets should be copied.
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
        const data = await config.fetchData(bookingId, { token, type, language, ...req.query });
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
// Helper to convert Node.js stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
app.post('/internal/generate-invoice', async (req, res) => {
    try {
        const apiKey = req.headers['x-internal-key'];
        if (apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const requestData = req.body;
        if (!requestData || !requestData.invoiceNumber) {
            return res.status(400).json({ error: 'Missing invoice data' });
        }
        if (!requestData.s3UploadUrl || !requestData.s3Key) {
            return res.status(400).json({ error: 'Missing s3UploadUrl or s3Key' });
        }
        console.log(`[PDF Service] Internal invoice generation for ${requestData.invoiceNumber}, uploading to S3: ${requestData.s3Key}`);
        // 1. Render PDF to stream (pass invoice data without S3-related fields)
        const { s3UploadUrl, s3Key, ...invoiceData } = requestData;
        const pdfStream = await renderer_1.default.renderToStream((0, jsx_runtime_1.jsx)(InvoiceDgiPdf_1.InvoiceDgiPdf, { ...invoiceData }));
        // 2. Convert stream to buffer
        const pdfBuffer = await streamToBuffer(pdfStream);
        console.log(`[PDF Service] PDF rendered: ${pdfBuffer.length} bytes`);
        // 3. Upload directly to S3 using pre-signed URL
        await uploadToS3(requestData.s3UploadUrl, pdfBuffer);
        console.log(`[PDF Service] PDF uploaded to S3: ${requestData.s3Key}`);
        // 4. Return success with S3 key
        res.json({
            success: true,
            s3Key: requestData.s3Key,
            size: pdfBuffer.length,
            invoiceNumber: requestData.invoiceNumber
        });
    }
    catch (error) {
        console.error('[PDF Service] Internal Invoice Generation Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Invoice PDF Generation Failed', details: msg });
    }
});
// Helper to upload PDF buffer to S3 via pre-signed URL
async function uploadToS3(presignedUrl, pdfBuffer) {
    try {
        // Convert Buffer to Uint8Array for fetch compatibility
        const uint8Array = new Uint8Array(pdfBuffer);
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/pdf',
            },
            body: uint8Array,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }
    catch (error) {
        console.error('[PDF Service] S3 upload error:', error);
        throw error;
    }
}
// Export the app for Vercel
exports.default = app;
// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🖨️ PDF Service running on http://localhost:${PORT}`);
        console.log(`   - Connected to Backend: ${process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1'}`);
    });
}
