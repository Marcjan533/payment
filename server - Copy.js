import http from 'node:http'

const port = Number(process.env.PORT || 4242)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(body))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 10_000) {
        reject(new Error('Request body is too large.'))
        request.destroy()
      }
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch {
        reject(new Error('Invalid JSON body.'))
      }
    })
    request.on('error', reject)
  })
}

function stripeFormData({ amount, successUrl, cancelUrl }) {
  const fields = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price_data][currency]': 'php',
    'line_items[0][price_data][product_data][name]': 'Marc Jan payment',
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return fields
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    })
    response.end()
    return
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { ok: true, stripeConfigured: Boolean(stripeSecretKey) })
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/create-checkout-session') {
    sendJson(response, 404, { message: 'Not found.' })
    return
  }

  if (!stripeSecretKey) {
    sendJson(response, 500, { message: 'Stripe is not configured. Set STRIPE_SECRET_KEY on the server.' })
    return
  }

  try {
    const body = await readBody(request)
    const amount = Number(body.amount)
    const successUrl = new URL(body.successUrl)
    const cancelUrl = new URL(body.cancelUrl)

    if (!Number.isInteger(amount) || amount < 100) {
      sendJson(response, 400, { message: 'The payment amount must be at least PHP 1.00.' })
      return
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: ['Bearer', stripeSecretKey].join(' '),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeFormData({
        amount,
        successUrl: successUrl.toString(),
        cancelUrl: cancelUrl.toString(),
      }),
    })
    const result = await stripeResponse.json()

    if (!stripeResponse.ok) {
      sendJson(response, stripeResponse.status, { message: result.error?.message || 'Stripe rejected the checkout request.' })
      return
    }

    sendJson(response, 200, { checkoutUrl: result.url })
  } catch (error) {
    sendJson(response, 400, { message: error instanceof Error ? error.message : 'Invalid payment request.' })
  }
})

server.listen(port, () => {
  console.log(`Stripe checkout server listening on http://localhost:${port}`)
})
