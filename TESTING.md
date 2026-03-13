# Testing PDF Templates

## Quick Test

Generate test PDFs locally:

```bash
cd pdf-service

# Install dependencies
npm install

# Generate test PDFs
npx ts-node src/test-generate.ts
```

Test PDFs will be created in `pdf-service/test-output/`:

| File | Description |
|------|-------------|
| `01-facture-standard-tva14.pdf` | Standard invoice with 14% VAT (transport) |
| `02-facture-commission-tva20.pdf` | Commission invoice with 20% VAT (service) |
| `03-avoir-credit-note.pdf` | Credit note with negative amounts |
| `04-facture-auto-entrepreneur.pdf` | Auto-entrepreneur (VAT exempt) |
| `05-facture-export.pdf` | Export invoice (0% VAT) |
| `06-facture-spot-shipping.pdf` | Spot shipping invoice |

## Running the PDF Service

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3002/health
```

### Internal Invoice Generation (Backend → PDF Service)
```bash
curl -X POST http://localhost:3002/internal/generate-invoice \
  -H "Content-Type: application/json" \
  -H "X-Internal-Key: your-secret-key" \
  -d '{
    "invoiceNumber": "FAC-2026-00042",
    "type": "INVOICE",
    "issuer": { "name": "Transport SA", ... },
    "recipient": { "name": "Client SA", ... },
    "lines": [...],
    "totalHt": 2600,
    "totalVat": 364,
    "totalTtc": 2964,
    "vatRate": 0.14,
    "taxRegime": "STANDARD",
    "issueDate": "2026-03-13"
  }'
```

## What to Verify

### DGI Compliance Checklist

- [ ] **ICE** (Identifiant Commun de l'Entreprise) displayed
- [ ] **RC** (Registre de Commerce) displayed
- [ ] **IF** (Identifiant Fiscal) displayed  
- [ ] **Patente** displayed
- [ ] **TVA rate** correct (14% transport, 20% service, 0% exempt)
- [ ] **Mention exonération** displayed when applicable
- [ ] **Numérotation séquentielle** (FAC-*, COM-*, AVO-*)
- [ ] **Date d'échéance** displayed
- [ ] **Conditions de paiement** displayed

### Visual Check

- [ ] Layout is clean and professional
- [ ] Tables are properly formatted
- [ ] Footer with legal info present
- [ ] No overflow or clipping issues
- [ ] Arabic text renders correctly (if applicable)
