import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import React from 'react';
import path from 'path';
import axios from 'axios';
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
        const { type, lang, uploadUrl, ...data } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Missing "type" field in request body' });
        }

        const language = lang || 'fr';
        console.log(`[PDF Service] POST /internal/generate — type=${type}, lang=${language}, uploadUrl=${uploadUrl ? 'yes' : 'no'}`);

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

        // 4a. If uploadUrl provided, collect bytes and upload to S3
        if (uploadUrl) {
            const chunks: Buffer[] = [];
            for await (const chunk of stream as unknown as NodeReadable) {
                chunks.push(Buffer.from(chunk));
            }
            const pdfBuffer = Buffer.concat(chunks);

            await axios.put(uploadUrl, pdfBuffer, {
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

        (stream as unknown as NodeReadable).pipe(res);
    } catch (error) {
        console.error('[PDF Service] POST /internal/generate Error:', error);
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
