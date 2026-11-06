# Marc Jan nonprofit site

## Stripe Checkout integration

The payment page creates a Stripe Checkout Session on the local Node server and redirects the browser to Stripe-hosted checkout. The Stripe secret key is used only by the server and must never be added to React or a `VITE_` variable.

1. Copy `.env.example` to `.env`.
2. In the Stripe Dashboard, use the test-mode secret key beginning with `sk_test_` for local development.
3. Set `STRIPE_SECRET_KEY` in `.env`.
4. Enable the payment methods you want in Stripe Dashboard → Settings → Payment methods.
5. Start the API server with Node 20+:

```text
node --env-file=.env server.js
```

6. Start Vite in another terminal:

```text
npm run dev
```

The Vite development server proxies `/api/create-checkout-session` to `http://localhost:4242`. For production, deploy `server.js` or move the same endpoint to a serverless function and set `VITE_PAYMENT_API_URL` to its HTTPS URL.

The backend validates the amount, creates the Checkout Session with Stripe, and returns only `checkoutUrl`. Configure Stripe webhooks on the backend before treating a payment as completed; a browser redirect alone is not proof of payment.
