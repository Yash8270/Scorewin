import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Score<span className="logo-highlight">Win</span></span>
          <p className="footer-tagline">Play. Win. Make an Impact.</p>
        </div>
        <div className="footer-copy">
          <p>&copy; {new Date().getFullYear()} ScoreWin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
