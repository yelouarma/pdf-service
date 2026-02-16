# PDF Service

Standalone microservice for generating PDF documents (Contracts, Invoices, Handovers) for FlexiFlotte.

## 🚀 Deployment on Vercel

This service is configured for serverless deployment on Vercel.

### 1. Environment Variables

To connect this service to your backend, you **must** configure the `BACKEND_API_URL` environment variable in your Vercel project settings.

1.  Go to your Vercel Project Dashboard.
2.  Navigate to **Settings** > **Environment Variables**.
3.  Add a new variable:
    *   **Key**: `BACKEND_API_URL`
    *   **Value**: `https://your-backend-api-url.com/api/v1` (Replace with your actual production backend URL)
    *   **Environments**: Check Production, Preview, and Development.

### 2. Local Development

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run locally:
    ```bash
    npm run dev
    ```

### 3. API Usage

**Endpoint**: `GET /generate`

**Parameters**:
*   `bookingId` (required): UUID of the booking.
*   `type` (optional): Document type (`CONTRACT`, `HANDOVER`, `INVOICE`). Defaults to `CONTRACT`.
*   `lang` (optional): Language code (`fr`, `en`, `ar`). Defaults to `fr`.

**Example**:
```
GET /generate?bookingId=123&type=CONTRACT&lang=fr
```
