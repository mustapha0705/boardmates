// import ChessBoard from "../components/ChessBoard.jsx";
// import MoveList from "../components/MoveList.jsx";
// import CommentList from "../components/CommentList.jsx";
// import CommentForm from "../components/CommentForm.jsx";
// import "../styles/game-review.css";

// export default function GameReview() {
//   return (
//     <main className="review-container">
//       {/* Header */}
//       <div className="review-header">
//         <div>
//           <h2>Carlsen vs. Nepomniachtchi</h2>
//         </div>

//         <button className="btn-secondary">Share</button>
//       </div>

//       <div className="review-grid">
//         {/* LEFT */}
//         <div className="left-column">
//           <ChessBoard />
//           <MoveList />
//           <CommentForm />
//         </div>

//         {/* RIGHT */}
//         <div className="right-column">
//           <CommentList />
//         </div>
//       </div>
//     </main>
//   );
// }
import { useState } from "react";
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import "../styles/game-review.css";

export default function GameReview() {
  const [activeMove, setActiveMove] = useState("Move 45");

  return (
    <main className="review-container">
      <div className="review-header">
        <div>
          <h2 className="review-title">Carlsen vs. Nepomniachtchi</h2>
          <span className="review-subtitle">World Championship 2021 · Game 6</span>
        </div>
        <button className="btn-secondary">Share</button>
      </div>

      <div className="review-grid">
        <div className="left-column">
          <ChessBoard activeMove={activeMove} />
          <MoveList activeMove={activeMove} onSelectMove={setActiveMove} />
          <CommentForm activeMove={activeMove} />
        </div>
        <div className="right-column">
          <CommentList activeMove={activeMove} onSelectMove={setActiveMove} />
        </div>
      </div>
    </main>
  );
}