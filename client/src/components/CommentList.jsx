import { useState } from "react";

const comments = [
  {
    id: 1,
    move: "Move 45",
    time: "2 mins ago",
    text: "White is preparing to reposition the Knight to f4. This solidifies the defense around the King and prepares for a central breakthrough if black pushes the c-pawn.",
    active: true,
  },
  {
    id: 2,
    move: "Move 32",
    time: "1 hour ago",
    text: "The rook exchange at d8 was premature. Keeping the major pieces on the board would have favored White's development speed.",
    active: false,
  },
  {
    id: 3,
    move: "Move 24",
    time: "2 hours ago",
    text: "Black's Bishop on e7 is slightly passive here. c5 might have been a better attempt at creating counterplay in the center.",
    active: false,
  },
  {
    id: 4,
    move: "Move 12",
    time: "Yesterday",
    text: "Standard theoretical position from the Ruy Lopez. Both players follow the main line with high accuracy.",
    active: false,
  },
  {
    id: 5,
    move: "Move 50",
    time: "Just now",
    text: "White seizes the initiative with a timely pawn push to e5, opening lines toward the King and forcing Black into a defensive posture.",
    active: false,
  },
  {
    id: 6,
    move: "Move 47",
    time: "5 mins ago",
    text: "Black reroutes the Knight to d7, aiming to reinforce key central squares and prepare a possible f6 break.",
    active: false,
  },
  {
    id: 7,
    move: "Move 41",
    time: "12 mins ago",
    text: "The Queen trade here simplifies the position, but it also reduces White’s attacking chances on the kingside.",
    active: false,
  },
  {
    id: 8,
    move: "Move 38",
    time: "20 mins ago",
    text: "White doubles rooks on the e-file, increasing pressure on the pinned pawn and limiting Black’s mobility.",
    active: false,
  },
  {
    id: 9,
    move: "Move 35",
    time: "30 mins ago",
    text: "Black’s decision to castle long introduces opposite-side attacking chances for both players.",
    active: false,
  },
  {
    id: 10,
    move: "Move 29",
    time: "45 mins ago",
    text: "A subtle Bishop retreat keeps the diagonal alive while avoiding a tempo gain from Black’s advancing pawns.",
    active: false,
  },
  {
    id: 11,
    move: "Move 26",
    time: "1 hour ago",
    text: "White’s pawn structure remains intact, giving a slight long-term advantage in the endgame.",
    active: false,
  },
  {
    id: 12,
    move: "Move 21",
    time: "1 hour ago",
    text: "Black challenges the center with d5, attempting to break open the position and activate the dark-squared Bishop.",
    active: false,
  },
  {
    id: 13,
    move: "Move 17",
    time: "2 hours ago",
    text: "White develops the Knight to c3, reinforcing central control and preparing for kingside castling.",
    active: false,
  },
  {
    id: 14,
    move: "Move 8",
    time: "3 hours ago",
    text: "An early h6 by Black prevents Bg5, but slightly weakens the kingside dark squares.",
    active: false,
  },
];

export default function CommentList({ activeMove, onSelectMove }) {
  const [search, setSearch] = useState("");

  const filtered = comments.filter(
    (c) =>
      c.text.toLowerCase().includes(search.toLowerCase()) ||
      c.move.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="comments-card">
      <div className="comments-header">
        <span>Reviewer Notes</span>
        <span className="comments-count">{comments.length}</span>
      </div>

      <div className="comments-body">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={`comment ${activeMove === c.move ? "active" : ""}`}
            onClick={() => onSelectMove(c.move)}
          >
            <div className="comment-meta">
              <span className={`tag ${activeMove === c.move ? "" : "muted"}`}>
                {c.move}
              </span>
              <span className="comment-time">{c.time}</span>
            </div>
            <p className="comment-text">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="comment-search">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search comments..."
        />
      </div>
    </div>
  );
}
