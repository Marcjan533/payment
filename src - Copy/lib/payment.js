const paymentApiUrl = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:4242/api/create-checkout-session'

export async function createStripeCheckout({ amount }) {
  const response = await fetch(paymentApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency: 'PHP',
      successUrl: `${window.location.origin}/payment?status=success`,
      cancelUrl: `${window.location.origin}/payment?status=cancelled`,
    }),
  })

  const responseText = await response.text()
  let result
  try {
    result = JSON.parse(responseText)
  } catch {
    throw new Error(`The payment server returned an invalid response (${response.status}). Confirm that "npm run server" is running on port 4242.`)
  }

  if (!response.ok) {
    throw new Error(result.message || 'Stripe could not create a checkout session.')
  }

  if (!result.checkoutUrl) {
    throw new Error('The payment service did not return a checkout URL.')
  }

  return result.checkoutUrl
}
