import express from 'express';
import cors from 'cors';
import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { getDocumentConfig } from './registry';

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
        const { bookingId } = req.query;
        const type = (req.query.type as string) || 'CONTRACT'; // Default type
        const token = req.headers.authorization; // Retrieve Auth Token from Forwarded Request

        if (!bookingId) {
            return res.status(400).json({ error: 'Missing bookingId parameter' });
        }

        console.log(`[PDF Service] Request for ${type} (ID: ${bookingId})`);

        // 1. Get Registry Configuration
        const config = getDocumentConfig(type);
        if (!config) {
            return res.status(400).json({ error: `Unsupported document type: ${type}` });
        }

        // 2. Fetch Data using the configuration
        // We pass the auth token so the fetcher can call protected Backend APIs
        const data = await config.fetchData(bookingId as string, { token, type });

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

app.listen(PORT, () => {
    console.log(`🖨️ PDF Service running on http://localhost:${PORT}`);
    console.log(`   - Connected to Backend: ${process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1'}`);
});
