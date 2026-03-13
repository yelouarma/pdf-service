import express from 'express';
import cors from 'cors';
import React from 'react';
import path from 'path';
import ReactPDF, { Font } from '@react-pdf/renderer';
import { getDocumentConfig } from './registry';
import { InvoiceDgiPdf } from './templates/InvoiceDgiPdf';

// Resolve paths to fonts - relative to the CWD when running the service
// In dev (ts-node-dev), process.cwd() is project root.
// In prod (node dist/server.js), it might be different, but assets should be copied.
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
app.use(express.json());

// --- Routes ---

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'pdf-service' });
});

app.get('/generate', async (req, res) => {
    try {
        const { bookingId, lang } = req.query;
        const type = (req.query.type as string) || 'CONTRACT'; // Default type
        const token = req.headers.authorization; // Retrieve Auth Token from Forwarded Request
        const language = (lang as string) || 'fr'; // Language for labels/descriptions in PDF (e.g. fr, en, ar)

        if (!bookingId) {
            return res.status(400).json({ error: 'Missing bookingId parameter' });
        }

        console.log(`[PDF Service] Request for ${type} (ID: ${bookingId}, lang: ${language})`);

        // 1. Get Registry Configuration
        const config = getDocumentConfig(type);
        if (!config) {
            return res.status(400).json({ error: `Unsupported document type: ${type}` });
        }

        // 2. Fetch Data using the configuration
        // We pass the auth token and language so the fetcher/template can use the right locale for labels
        const data = await config.fetchData(bookingId as string, { token, type, language, ...req.query });

        // 3. Render PDF
        // Dynamically instantiate the template component from config
        const Template = config.template;
        const stream = await ReactPDF.renderToStream(<Template {...data} />);

        // 4. Send Response
        res.setHeader('Content-Type', 'application/pdf');

        // Filename can be dynamic based on data
        const filename = config.getFilename ? config.getFilename(data) : `${type}_${bookingId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Headers for Iframe/CORS
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', "frame-ancestors *");

        stream.pipe(res);

    } catch (error) {
        console.error('[PDF Service] Generation Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'PDF Generation Failed', details: msg });
    }
});

// --- Internal endpoint for backend-to-service invoice generation ---

app.post('/internal/generate-invoice', async (req, res) => {
    try {
        const apiKey = req.headers['x-internal-key'];
        if (apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const invoiceData = req.body;
        if (!invoiceData || !invoiceData.invoiceNumber) {
            return res.status(400).json({ error: 'Missing invoice data' });
        }

        console.log(`[PDF Service] Internal invoice generation for ${invoiceData.invoiceNumber}`);

        const stream = await ReactPDF.renderToStream(<InvoiceDgiPdf {...invoiceData} />);

        const filename = `${invoiceData.type === 'CREDIT_NOTE' ? 'Avoir' : 'Facture'}_${invoiceData.invoiceNumber}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        stream.pipe(res);
    } catch (error) {
        console.error('[PDF Service] Internal Invoice Generation Error:', error);
        const msg = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Invoice PDF Generation Failed', details: msg });
    }
});

// Export the app for Vercel
export default app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🖨️ PDF Service running on http://localhost:${PORT}`);
        console.log(`   - Connected to Backend: ${process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1'}`);
    });
}
