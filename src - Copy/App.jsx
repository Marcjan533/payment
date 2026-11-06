import { useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import about from './data/about.json'
import { createStripeCheckout } from './lib/payment'
import './App.css'

function ArrowIcon() {
  return <span aria-hidden="true">→</span>
}

function Layout({ children }) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Marc Jan home">
          <span className="brand-mark">M</span>
          <span>Marc Jan</span>
        </NavLink>
        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About me</NavLink>
          <NavLink to="/payment">Payment</NavLink>
        </nav>
        <NavLink to="/payment" className="donate-btn">
          Make a payment <ArrowIcon />
        </NavLink>
      </header>
      {children}
      <footer className="footer">
        <div>
          <NavLink to="/" className="footer-brand">Marc Jan</NavLink>
          <p>Building brighter communities, one act of care at a time.</p>
        </div>
        <p className="footer-note">Made with purpose © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Welcome to a kinder future</p>
          <h1>Small actions.<br /><em>Big change.</em></h1>
          <p className="lead">{about.intro}</p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => navigate('/about')}>
              Discover my story <ArrowIcon />
            </button>
            <button type="button" className="text-btn" onClick={() => navigate('/payment')}>
              Make a payment <ArrowIcon />
            </button>
          </div>
          <div className="impact-line">
            <span className="avatar-stack" aria-hidden="true">
              <span>J</span><span>A</span><span>M</span><span>+</span>
            </span>
            <span><strong>120+</strong> people supported through community action</span>
          </div>
        </div>

      </section>

      <section className="home-section mission-preview">
        <div className="section-heading">
          <p className="eyebrow">What I believe</p>
          <h2>Kindness is not a feeling.<br /><em>It is a practice.</em></h2>
        </div>
        <div className="preview-grid">
          <p>{about.mission}</p>
          <div className="highlight-cards">
            {about.highlights.map((highlight, index) => (
              <div className="highlight-card" key={highlight}>
                <span>0{index + 1}</span>
                <p>{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function AboutPage() {
  return (
    <main className="about-page">
      <section className="page-intro">
        <p className="eyebrow">About me</p>
        <h1>A little more<br /><em>about the person</em> behind the work.</h1>
        <p className="intro-copy">{about.intro}</p>
      </section>
      <section className="story-grid">
        <div className="about-profile">
          <div className="about-photo-frame">
            <img src="/unnamed.jpg" alt="Marc Jan smiling" className="about-portrait" />
          </div>
          <div className="about-profile-caption">
            <strong>Marc Jan</strong>
            <span>{about.role}</span>
          </div>
        </div>
        <div className="story-text">
          <p className="eyebrow">My mission</p>
          <h2>Making room for more hope.</h2>
          <p>{about.mission}</p>
          <p>Whether it is through thoughtful design, a helping hand, or a contribution that reaches someone at the right moment, I believe progress grows when people choose to show up for one another.</p>
        </div>
        <div className="mini-panel">
          <span className="quote-mark">“</span>
          <p>{about.tagline}</p>
          <span className="signature">— Marc Jan</span>
        </div>
      </section>
      <section className="values">
        <div className="section-heading">
          <p className="eyebrow">My values</p>
          <h2>The principles that guide me.</h2>
        </div>
        <div className="value-grid">
          {about.values.map((value, index) => (
            <article className="value-card" key={value.title}>
              <span className="value-number">0{index + 1}</span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function PaymentPage() {
  const [amount, setAmount] = useState('500')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const checkoutUrl = await createStripeCheckout({ amount })
      window.location.assign(checkoutUrl)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to start the payment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="donate-page">
      <section className="donate-intro">
        <p className="eyebrow">Secure payment integration</p>
        <h1>Simple, safe,<br /><em>and powered by Stripe.</em></h1>
        <p>Choose an amount below and continue to Stripe Checkout. Your payment details are handled by Stripe, not stored on this website.</p>
      </section>
      <section className="payment-layout">
        <div className="payment-card">
          <form onSubmit={handleSubmit}>
              <div className="form-heading">
                <span className="step">01</span>
                <div><p className="eyebrow">Payment amount</p><h2>How much would you like to pay?</h2></div>
              </div>
              <div className="amount-grid">
                {['250', '500', '1000'].map((value) => (
                  <button type="button" className={amount === value ? 'amount-option selected' : 'amount-option'} key={value} onClick={() => setAmount(value)}>₱{Number(value).toLocaleString()}</button>
                ))}
              </div>
              <label className="custom-amount">Custom amount
                <span className="currency-input"><span>₱</span><input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /></span>
              </label>
              <div className="form-heading second-step">
                <span className="step">02</span>
                <div><p className="eyebrow">Payment method</p><h2>Continue with Stripe.</h2></div>
              </div>
              <div className="method-grid">
                <div className="method-option selected"><span className="method-dot" />Stripe Checkout</div>
              </div>
              {error && <p className="payment-error" role="alert">{error}</p>}
              <button type="submit" className="primary-btn submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Connecting to Stripe…' : 'Continue to Stripe'} <ArrowIcon />
              </button>
              <p className="secure-note">You will be redirected to the secure checkout page to authorize this payment.</p>
          </form>
        </div>
        <aside className="donate-aside">
          <div className="aside-art">✦</div>
          <p className="eyebrow">Payment integration</p>
          <h2>Your payment stays secure from start to finish.</h2>
          <div className="aside-stat"><strong>100%</strong><span>of payment details are handled by the checkout provider.</span></div>
        </aside>
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/donate" element={<PaymentPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
