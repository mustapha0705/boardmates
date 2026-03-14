export default function GameCard({ date, title, rating, time }) {
  return (
    <div className="game-card">
      <div className="card-left">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
        </div>

        <div>
          <div className="card-date">{date}</div>
          <div className="card-title">{title}</div>

          <div className="card-meta">
            <span className="meta-pill">⭐ {rating}</span>
            <span className="dot"></span>
            <span className="meta-pill">{time}</span>
          </div>
        </div>
      </div>

      <button className="review-btn">Start Review →</button>
    </div>
  );
}