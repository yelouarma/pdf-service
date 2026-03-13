import express from 'express';
import cors from 'cors';
import React from 'react';
import path from 'path';
import ReactPDF, { Font } from '@react-pdf/renderer';
import { getDocumentConfig } from './registry';
import { requireInternalKey } from './middleware/authMiddleware';
import type { Readable as NodeReadable } from 'stream';

// Resolve paths to fonts
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');

// Register fonts for Arabic support
Font.register({
    family: 'NotoSans',
    fonts: [
        { src: path.join(FONT_DIR, 'NotoSans-Regular.ttf') },
        { src: path.join(FONT_DIR, 'NotoSans-Bold.ttf'), fontWeight: 'bold' }
    ]
});

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased for handover SVG schemas
app.use(requireInternalKey); // Global auth — skips /health automatically

// --- Routes ---

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'pdf-service' });
});

// --- Unified internal endpoint ---
// Backend sends ALL data in the body. PDF service is a pure renderer.
app.post('/internal/generate', async (req, res) => {
    try {
        const { type, lang, ...data } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Missing "type" field in request body' });
        }

        const language = lang || 'fr';
        console.log(`[PDF Service] POST /internal/generate — type=${type}, lang=${language}`);

        // 1. Get Registry Configuration
        const config = getDocumentConfig(type);
        if (!config) {
            return res.status(400).json({ error: `Unsupported document type: ${type}` });
        }

        // 2. Transform body → template props
        const props = config.prepareData(data, language);

        // 3. Render PDF
        const Template = config.template;
        const stream = await ReactPDF.renderToStream(<Template {...props} />);

        // 4. Send Response
        res.setHeader('Content-Type', 'application/pdf');
        const filename = config.getFilename ? config.getFilename(props) : `${type}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        (stream as unknown as NodeReadable).pipe(res);
    } catch (error) {
        console.error('[PDF Service] POST /internal/generate Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'PDF Generation Failed', details: msg });
    }
});

// --- DEPRECATED: GET /generate ---
// Kept for backward compatibility until frontend migrates to backend endpoints.
// Now requires X-Internal-Key (applied globally).
app.get('/generate', async (req, res) => {
    console.warn('[PDF Service] DEPRECATED: GET /generate — use POST /internal/generate instead');

    try {
        const { bookingId, lang } = req.query;
        const type = (req.query.type as string) || 'CONTRACT';
        const token = req.headers.authorization;
        const language = (lang as string) || 'fr';

        if (!bookingId) {
            return res.status(400).json({ error: 'Missing bookingId parameter' });
        }

        console.log(`[PDF Service] Request for ${type} (ID: ${bookingId}, lang: ${language})`);

        const config = getDocumentConfig(type);
        if (!config) {
            return res.status(400).json({ error: `Unsupported document type: ${type}` });
        }

        if (!config.fetchData) {
            return res.status(400).json({ error: `Document type ${type} does not support GET /generate. Use POST /internal/generate.` });
        }

        const data = await config.fetchData(bookingId as string, { token, type, language, ...req.query });

        const Template = config.template;
        const stream = await ReactPDF.renderToStream(<Template {...data} />);

        res.setHeader('Content-Type', 'application/pdf');
        const filename = config.getFilename ? config.getFilename(data) : `${type}_${bookingId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', "frame-ancestors *");

        stream.pipe(res);
    } catch (error) {
        console.error('[PDF Service] Generation Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'PDF Generation Failed', details: msg });
    }
});

// Export the app for Vercel
export default app;

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`PDF Service running on http://localhost:${PORT}`);
    });
}
