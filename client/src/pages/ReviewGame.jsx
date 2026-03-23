// import { Chessboard } from "react-chessboard";

// export default function ReviewGame() {
//   return (
//     <>
//       <div className="feed">
//         <div>Review Game</div>
//         <Chessboard position={"start"} />
//       </div>
//     </>
//   );
// }
import ChessBoard from "../components/ChessBoard.jsx";
import MoveList from "../components/MoveList.jsx";
import CommentList from "../components/CommentList.jsx";
import CommentForm from "../components/CommentForm.jsx";
import "../styles/game-review.css";

export default function GameReview() {
  return (
    <main className="review-container">
      {/* Header */}
      <div className="review-header">
        <div>
          <h2>Carlsen vs. Nepomniachtchi</h2>
        </div>

        <button className="btn-secondary">Share</button>
      </div>

      <div className="review-grid">
        {/* LEFT */}
        <div className="left-column">
          <ChessBoard />
          <MoveList />
          <CommentForm />
        </div>

        {/* RIGHT */}
        <div className="right-column">
          <CommentList />
        </div>
      </div>
    </main>
  );
}
