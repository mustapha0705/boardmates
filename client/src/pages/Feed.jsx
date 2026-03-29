import GameCard from "../components/GameCard.jsx";
import "../styles/feed.css"

export default function Feed() {
  return (
    <main className="feed">
      <h1 className="feed-heading">Review Feed</h1>
      <p className="feed-sub">Games waiting for your strategic feedback</p>

      <div className="card-list">
        <GameCard
          date="Submitted Oct 24, 2023"
          title="Chess Match #842"
          rating="4.5 / 5"
          time="10m + 5s"
        />

        <GameCard
          date="Submitted Oct 23, 2023"
          title="Chess Match #843"
          rating="5.0 / 5"
          time="30m"
        />

        <GameCard
          date="Submitted Oct 22, 2023"
          title="Chess Match #844"
          rating="3.8 / 5"
          time="15m"
        />
      </div>

      <div className="load-more-wrap">
        <button className="load-more">Load more games</button>
      </div>
    </main>
  );
}