import { Link } from 'react-router-dom';
import { FiTarget, FiAward, FiHeart, FiArrowRight, FiStar, FiShield, FiZap } from 'react-icons/fi';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="hero-content animate-fade-in-up">
          <div className="hero-badge">
            <FiZap /> New Season Now Live
          </div>
          <h1 className="hero-title">
            Play. <span className="text-emerald">Win.</span><br />
            Make an <span className="text-gold">Impact.</span>
          </h1>
          <p className="hero-description">
            Track your golf scores, compete in monthly prize draws, and contribute to charities you care about — all in one premium platform.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">$50K+</span>
              <span className="hero-stat-label">Prizes Distributed</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">2,500+</span>
              <span className="hero-stat-label">Active Players</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">$12K+</span>
              <span className="hero-stat-label">Donated to Charity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-container">
          <div className="section-header animate-fade-in-up">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to start winning and making a difference</p>
          </div>
          <div className="features-grid">
            <div className="feature-card glass-card animate-fade-in-up delay-100">
              <div className="feature-icon emerald"><FiTarget /></div>
              <h3 className="feature-title">Track Your Scores</h3>
              <p className="feature-desc">Enter your golf scores (1-45) and track your performance. Your latest 5 scores are your lucky numbers for the monthly draw.</p>
              <span className="feature-step">01</span>
            </div>
            <div className="feature-card glass-card animate-fade-in-up delay-200">
              <div className="feature-icon gold"><FiAward /></div>
              <h3 className="feature-title">Win Monthly Prizes</h3>
              <p className="feature-desc">Automatic entry into monthly draws. Match 3, 4, or 5 numbers to win a share of the growing prize pool. Jackpot rolls over!</p>
              <span className="feature-step">02</span>
            </div>
            <div className="feature-card glass-card animate-fade-in-up delay-300">
              <div className="feature-icon rose"><FiHeart /></div>
              <h3 className="feature-title">Support Charity</h3>
              <p className="feature-desc">A portion of every subscription goes to the charity of your choice. Play for yourself, win for others.</p>
              <span className="feature-step">03</span>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="prize-section">
        <div className="prize-container">
          <div className="prize-card glass-card animate-fade-in-up">
            <div className="prize-content">
              <h2 className="prize-title">Monthly Prize Pool</h2>
              <div className="prize-tiers">
                <div className="prize-tier">
                  <div className="tier-match">5 Matches</div>
                  <div className="tier-pct gold-text">40%</div>
                  <div className="tier-label">Jackpot</div>
                </div>
                <div className="prize-tier">
                  <div className="tier-match">4 Matches</div>
                  <div className="tier-pct emerald-text">35%</div>
                  <div className="tier-label">Second Tier</div>
                </div>
                <div className="prize-tier">
                  <div className="tier-match">3 Matches</div>
                  <div className="tier-pct">25%</div>
                  <div className="tier-label">Third Tier</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-section" id="pricing">
        <div className="plans-container">
          <div className="section-header animate-fade-in-up">
            <h2 className="section-title">Simple Pricing</h2>
            <p className="section-subtitle">Choose your plan and start playing today</p>
          </div>
          <div className="plans-grid">
            <div className="plan-card glass-card animate-fade-in-up delay-100">
              <h3 className="plan-name">Monthly</h3>
              <div className="plan-price">
                <span className="plan-currency">$</span>
                <span className="plan-amount">9.99</span>
                <span className="plan-period">/month</span>
              </div>
              <ul className="plan-features">
                <li><FiStar /> Score tracking</li>
                <li><FiAward /> Monthly draw entry</li>
                <li><FiHeart /> Charity contribution</li>
                <li><FiShield /> Full dashboard access</li>
              </ul>
              <Link to="/register" className="btn btn-primary" style={{width: '100%'}}>Subscribe Monthly</Link>
            </div>
            <div className="plan-card glass-card plan-featured animate-fade-in-up delay-200">
              <div className="plan-badge">Best Value</div>
              <h3 className="plan-name">Yearly</h3>
              <div className="plan-price">
                <span className="plan-currency">$</span>
                <span className="plan-amount">99.99</span>
                <span className="plan-period">/year</span>
              </div>
              <ul className="plan-features">
                <li><FiStar /> Everything in Monthly</li>
                <li><FiZap /> Save 17%</li>
                <li><FiAward /> Priority support</li>
                <li><FiHeart /> Extra charity boost</li>
              </ul>
              <Link to="/register" className="btn btn-gold" style={{width: '100%'}}>Subscribe Yearly</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container animate-fade-in-up">
          <h2 className="cta-title">Ready to Play & Win?</h2>
          <p className="cta-desc">Join thousands of players making an impact while competing for prizes.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Your Journey <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
