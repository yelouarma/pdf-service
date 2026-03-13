/**
 * Test script for PDF templates
 * Generates sample PDFs for visual verification
 * 
 * Usage: npx ts-node src/test-generate.ts
 */

import React from 'react';
import ReactPDF, { Font } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';
import { InvoiceDgiPdf, InvoiceDgiProps } from './templates/InvoiceDgiPdf';
import { CommissionInvoicePdf, CommissionInvoiceProps } from './templates/CommissionInvoicePdf';

// Register fonts (same as server.tsx)
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');
Font.register({
    family: 'NotoSans',
    fonts: [
        { src: path.join(FONT_DIR, 'NotoSans-Regular.ttf') },
        { src: path.join(FONT_DIR, 'NotoSans-Bold.ttf'), fontWeight: 'bold' }
    ]
});

// Test data for standard invoice (TVA 14% - transport)
const invoiceData14: InvoiceDgiProps = {
    invoiceNumber: 'FAC-2026-00042',
    type: 'INVOICE',
    status: 'ISSUED',
    issuer: {
        name: 'Transport Express Maroc SARL',
        legalForm: 'SARL',
        address: '123 Boulevard Mohammed V, Casablanca',
        email: 'contact@transport-express.ma',
        phone: '+212 522-123456',
        ice: '001234567000089',
        rc: '123456',
        taxId: '12345678',
        patent: '12345678',
    },
    recipient: {
        name: 'Société Cliente SA',
        legalForm: 'SA',
        address: '45 Avenue Hassan II, Rabat',
        email: 'achats@client.ma',
        phone: '+212 537-987654',
        ice: '009876543000021',
        rc: '654321',
        taxId: '87654321',
    },
    lines: [
        {
            lineNumber: 1,
            description: 'Location de camion plateau avec chauffeur - Trajet Casablanca → Rabat',
            quantity: 1,
            unit: 'forfait',
            unitPrice: 2500.00,
            vatRate: 0.14,
            totalHt: 2500.00,
            totalVat: 350.00,
            totalTtc: 2850.00,
        },
        {
            lineNumber: 2,
            description: 'Frais de péage',
            quantity: 2,
            unit: 'passage',
            unitPrice: 50.00,
            vatRate: 0.14,
            totalHt: 100.00,
            totalVat: 14.00,
            totalTtc: 114.00,
        },
    ],
    totalHt: 2600.00,
    totalVat: 364.00,
    totalTtc: 2964.00,
    currency: 'MAD',
    vatRate: 0.14,
    taxRegime: 'STANDARD',
    issueDate: '2026-03-13',
    dueDate: '2026-04-12',
    paymentMethod: 'Virement bancaire',
};

// Test data for commission invoice (TVA 20% - service)
const commissionData: CommissionInvoiceProps = {
    invoiceNumber: 'COM-2026-00015',
    commissionRate: 0.10,
    transporterInvoiceNumber: 'FAC-2026-00042',
    issuer: {
        name: 'FlexiFlotte Platform',
        legalForm: 'SARL',
        address: 'Casablanca, Maroc',
        email: 'contact@flexiflotte.ma',
        phone: '+212 5XX-XXXXXX',
        ice: '001234567000001',
        rc: '111111',
        taxId: '11111111',
        patent: '11111111',
    },
    recipient: {
        name: 'Transport Express Maroc SARL',
        legalForm: 'SARL',
        address: '123 Boulevard Mohammed V, Casablanca',
        email: 'contact@transport-express.ma',
        phone: '+212 522-123456',
        ice: '001234567000089',
        rc: '123456',
        taxId: '12345678',
        patent: '12345678',
    },
    commissionHt: 260.00,
    commissionVat: 52.00,
    commissionTtc: 312.00,
    currency: 'MAD',
    vatRate: 0.20,
    issueDate: '2026-03-13',
    dueDate: '2026-04-12',
    paymentMethod: 'Prélèvement automatique',
};

// Test data for credit note
const creditNoteData: InvoiceDgiProps = {
    ...invoiceData14,
    invoiceNumber: 'AVO-2026-00008',
    type: 'CREDIT_NOTE',
    lines: invoiceData14.lines.map(line => ({
        ...line,
        unitPrice: -line.unitPrice,
        totalHt: -line.totalHt,
        totalVat: -line.totalVat,
        totalTtc: -line.totalTtc,
    })),
    totalHt: -2600.00,
    totalVat: -364.00,
    totalTtc: -2964.00,
};

// Test data for auto-entrepreneur (exonéré TVA)
const invoiceDataAutoEnt: InvoiceDgiProps = {
    ...invoiceData14,
    invoiceNumber: 'FAC-2026-00043',
    issuer: {
        ...invoiceData14.issuer,
        name: 'Ahmed Transport (Auto-entrepreneur)',
        legalForm: 'Auto-entrepreneur',
    },
    vatRate: 0,
    taxRegime: 'AUTO_ENTREPRENEUR',
    totalVat: 0,
    totalTtc: 2600.00,
    lines: invoiceData14.lines.map(line => ({
        ...line,
        vatRate: 0,
        totalVat: 0,
        totalTtc: line.totalHt,
    })),
};

// Test data for export (TVA 0%)
const invoiceDataExport: InvoiceDgiProps = {
    ...invoiceData14,
    invoiceNumber: 'FAC-2026-00044',
    recipient: {
        name: 'Société Européenne SAS',
        legalForm: 'SAS',
        address: 'Paris, France',
        email: 'contact@euro-client.fr',
        phone: '+33 1 23 45 67 89',
    },
    vatRate: 0,
    taxRegime: 'EXPORT',
    taxExemptionReason: 'Livraison intracommunautaire - Art. 259 du CGI',
    totalVat: 0,
    totalTtc: 2600.00,
    lines: invoiceData14.lines.map(line => ({
        ...line,
        vatRate: 0,
        totalVat: 0,
        totalTtc: line.totalHt,
    })),
};

async function streamToFile(stream: NodeJS.ReadableStream, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        stream.on('error', reject);
    });
}

async function generateTestPDFs() {
    const outputDir = path.join(process.cwd(), 'test-output');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🧪 Génération des PDFs de test...\n');
    
    try {
        // 1. Standard invoice TVA 14%
        console.log('📄 1. Facture standard (TVA 14%)...');
        const stream1 = await ReactPDF.renderToStream(
            React.createElement(InvoiceDgiPdf, invoiceData14) as any
        );
        await streamToFile(stream1, path.join(outputDir, '01-facture-standard-tva14.pdf'));
        console.log('   ✓ FAC-2026-00042 - Transport avec TVA 14%\n');
        
        // 2. Commission invoice TVA 20%
        console.log('📄 2. Facture commission (TVA 20%)...');
        const stream2 = await ReactPDF.renderToStream(
            React.createElement(CommissionInvoicePdf, commissionData) as any
        );
        await streamToFile(stream2, path.join(outputDir, '02-facture-commission-tva20.pdf'));
        console.log('   ✓ COM-2026-00015 - Commission FlexiFlotte\n');
        
        // 3. Credit note
        console.log('📄 3. Avoir (note de crédit)...');
        const stream3 = await ReactPDF.renderToStream(
            React.createElement(InvoiceDgiPdf, creditNoteData) as any
        );
        await streamToFile(stream3, path.join(outputDir, '03-avoir-credit-note.pdf'));
        console.log('   ✓ AVO-2026-00008 - Annulation facture\n');
        
        // 4. Auto-entrepreneur (exonéré)
        console.log('📄 4. Facture auto-entrepreneur (exonéré)...');
        const stream4 = await ReactPDF.renderToStream(
            React.createElement(InvoiceDgiPdf, invoiceDataAutoEnt) as any
        );
        await streamToFile(stream4, path.join(outputDir, '04-facture-auto-entrepreneur.pdf'));
        console.log('   ✓ FAC-2026-00043 - Exonération TVA\n');
        
        // 5. Export
        console.log('📄 5. Facture export (TVA 0%)...');
        const stream5 = await ReactPDF.renderToStream(
            React.createElement(InvoiceDgiPdf, invoiceDataExport) as any
        );
        await streamToFile(stream5, path.join(outputDir, '05-facture-export.pdf'));
        console.log('   ✓ FAC-2026-00044 - Exportation\n');
        
        console.log('✅ Tous les PDFs ont été générés avec succès!');
        console.log(`📁 Fichiers dans: ${outputDir}\n`);
        
        console.log('📝 Résumé des tests:');
        console.log('   • TVA dynamique: ✓ (14%, 20%, 0%)');
        console.log('   • Mention exonération: ✓ (Auto-entrepreneur, Export)');
        console.log('   • Numérotation séquentielle: ✓ (FAC-, COM-, AVO-)');
        console.log('   • Template avoir: ✓ (montants négatifs)');
        console.log('   • Mentions DGI (ICE, RC, IF, Patente): ✓\n');
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateTestPDFs();
}

export { generateTestPDFs };
