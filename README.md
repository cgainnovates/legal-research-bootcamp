# Legal Research Bootcamp — Edge Legal Consult

Official landing page and registration portal for the **Legal Research Bootcamp with David Eyongndi PhD**, hosted by Edge Legal Consult.

The frontend is a React + Vite + Tailwind site. The backend is a Node.js + Express API that initialises and verifies Paystack payments. Registration fees are never trusted from the browser; the server resolves the amount from a fixed pricing table.

## Project structure

```
legal-research-bootcamp/
├── README.md
├── .gitignore
├── .env.example
├── frontend/          React + Vite application
└── backend/           Express API + Paystack integration
```

## Pricing (server-validated)

| Category | Early Bird | Late Registration |
|---|---|---|
| Postgraduate LLM/PhD Student | ₦40,000 | ₦50,000 |
| Legal Academia | ₦50,000 | ₦70,000 |

Change amounts only in `backend/src/config/pricing.js` (and keep `frontend/src/lib/pricing.js` in display sync). The API is the source of truth at checkout.

## 1. Install dependencies

Requires Node.js 18 or newer.

```bash
cd frontend && npm install
cd ../backend && npm install
```

## 2. Configure environment variables

Never commit a real `.env` file.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### `backend/.env`

```
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_WEBHOOK_SECRET=
```

### `frontend/.env`

```
VITE_API_URL=http://localhost:4000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

During local development the Vite dev server also proxies `/api` to `http://localhost:4000`, so the frontend can use an empty `VITE_API_URL` if you prefer same-origin requests.

## 3. Run the frontend

```bash
cd frontend
npm run dev
```

The site is served at [http://localhost:5173](http://localhost:5173).

## 4. Run the backend

```bash
cd backend
npm run dev
```

The API listens on [http://localhost:4000](http://localhost:4000). Health check: `GET /api/health`.

## 5. Connect Paystack

1. Create an account at [Paystack](https://dashboard.paystack.com).
2. Open **Settings → API Keys & Webhooks**.
3. Copy the **test** public and secret keys into the `.env` files above.
4. Set the Paystack callback to the frontend confirmation route via `FRONTEND_URL`. The API already sends `callback_url` as `{FRONTEND_URL}/confirmation?reference=...`.
5. Optional webhook: `POST {BACKEND_URL}/api/payments/webhook`. Verify the signature with `PAYSTACK_WEBHOOK_SECRET` or the secret key.

The secret key is used only on the server. It is never sent to the browser.

## 6. Test payments

Use Paystack test cards from the [Paystack docs](https://paystack.com/docs/payments/test-payments):

- Successful card: `4084084084084081`
- Any future expiry, any CVV, any PIN/OTP requested by the test checkout

Flow:

1. Open `/register`.
2. Submit a valid form.
3. The backend creates a pending registration and calls Paystack `transaction/initialize` with the **server-side** fee.
4. Complete checkout.
5. You are returned to `/confirmation?reference=...`.
6. The frontend calls `GET /api/payments/verify/:reference`.
7. The backend calls Paystack `transaction/verify` and only then marks the registration as paid.

A registration is never marked paid because the browser claimed success.

## 7. Build for production

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist`.

```bash
cd backend
NODE_ENV=production npm start
```

## 8. Deploy the frontend

The `frontend/dist` folder is a static site. It can be deployed to:

- GitHub Pages (set the correct `base` in `vite.config.js` if using a project path)
- Netlify, Vercel, Cloudflare Pages, or similar

Set production environment variables before building:

```
VITE_API_URL=https://api.your-domain.com
VITE_PAYSTACK_PUBLIC_KEY=pk_live_or_test_key
```

## 9. Deploy the backend

Deploy the `backend` folder to a Node host (Render, Railway, Fly.io, a VPS, etc.).

Production environment:

```
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://www.your-domain.com
PAYSTACK_SECRET_KEY=sk_live_or_test_key
PAYSTACK_PUBLIC_KEY=pk_live_or_test_key
PAYSTACK_WEBHOOK_SECRET=optional_webhook_secret
```

CORS is restricted to `FRONTEND_URL`. Registrations are stored in `backend/data/registrations.json`. Replace that file store with a database before high-volume production use.

## 10. Files that must never be committed

- `.env`
- `backend/.env`
- `frontend/.env`
- Any file containing `sk_live_`, `sk_test_`, or other live secrets
- `backend/data/registrations.json` (participant records)

The repository already lists these in `.gitignore`.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Service health |
| GET | `/api/payments/pricing` | Public pricing table |
| POST | `/api/payments/initialize` | Validate form, resolve fee, initialise Paystack |
| GET | `/api/payments/verify/:reference` | Verify with Paystack and confirm registration |
| POST | `/api/payments/webhook` | Optional Paystack webhook |

`POST /api/payments/initialize` body:

```json
{
  "fullName": "Adaeze Okonkwo",
  "email": "adaeze@example.com",
  "phone": "08012345678",
  "category": "postgraduate",
  "registrationType": "early"
}
```

`category` must be `postgraduate` or `academia`. `registrationType` must be `early` or `late`.

## Placeholders for the client

The brief did not include event date, venue, duration, timetable, certificate details or social profiles. Those are not invented on the site. Add them in the footer note, FAQ, and any later schedule section when they are confirmed.

## Licence

Project source is supplied for Edge Legal Consult to deploy this bootcamp. Facilitator portrait is derived from the official promotional flyer supplied by the client.
